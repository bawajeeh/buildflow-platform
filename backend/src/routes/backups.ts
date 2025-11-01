import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { requireWebsiteAccess } from '../middleware/auth'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateParams } from '../middleware/validation'
import { websiteIdParamsSchema, backupIdParamsSchema } from '../validations/backups'

const router = Router()

// List backups
router.get('/websites/:websiteId/backups', requireWebsiteAccess(), validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const prisma = getPrismaClient()
  const { websiteId } = req.params
  
  const backups = await prisma.template.findMany({
    where: { category: 'BACKUP', tags: websiteId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true },
  })
  
  logger.debug('Backups listed', { websiteId, count: backups.length })
  
  res.json({ success: true, data: backups })
}))

// Create backup
router.post('/websites/:websiteId/backups', requireWebsiteAccess(), validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const prisma = getPrismaClient()
  const { websiteId } = req.params
  
  const website = await prisma.website.findUnique({ where: { id: websiteId } })
  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }
  
  const pages = await prisma.page.findMany({
    where: { websiteId },
    include: { elements: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  })
  
  const backup = await prisma.template.create({
    data: {
      name: `${website.name} Backup ${new Date().toISOString()}`,
      description: `Backup of website ${website.name}`,
      category: 'BACKUP',
      preview: '',
      tags: websiteId,
      pages: {
        create: pages.map(p => ({
          name: p.name,
          slug: p.slug,
          elements: JSON.stringify(p.elements.map(el => ({
            id: el.id,
            type: el.type,
            name: el.name,
            props: el.props,
            styles: el.styles,
            parentId: el.parentId,
            order: el.order,
            isVisible: el.isVisible,
            responsive: el.responsive,
          }))),
        })),
      },
    },
    select: { id: true, name: true, createdAt: true },
  })
  
  logger.info('Backup created', { backupId: backup.id, websiteId, pagesCount: pages.length })
  
  res.status(201).json({ success: true, data: backup })
}))

// Restore backup
router.post('/websites/:websiteId/backups/:backupId/restore', requireWebsiteAccess(), validateParams(backupIdParamsSchema), asyncHandler(async (req, res) => {
  const prisma = getPrismaClient()
  const { websiteId, backupId } = req.params
  
  const backup = await prisma.template.findUnique({ where: { id: backupId }, include: { pages: true } })
  if (!backup || backup.category !== 'BACKUP' || backup.tags !== websiteId) {
    throw createError('Backup not found', 404, 'BACKUP_NOT_FOUND')
  }
  
  await prisma.$transaction(async (tx) => {
    await tx.page.deleteMany({ where: { websiteId } })
    for (const bp of backup.pages) {
      const page = await tx.page.create({ data: { websiteId, name: bp.name, slug: bp.slug, isHome: false, isPublished: false } })
      const elements = JSON.parse(bp.elements || '[]')
      for (const el of elements) {
        await tx.element.create({
          data: {
            pageId: page.id,
            type: el.type,
            name: el.name,
            props: typeof el.props === 'string' ? el.props : JSON.stringify(el.props || {}),
            styles: typeof el.styles === 'string' ? el.styles : JSON.stringify(el.styles || {}),
            parentId: null,
            order: el.order ?? 0,
            isVisible: el.isVisible ?? true,
            responsive: typeof el.responsive === 'string' ? el.responsive : JSON.stringify(el.responsive || {}),
          },
        })
      }
    }
  })
  
  logger.info('Backup restored', { backupId, websiteId, pagesCount: backup.pages.length })
  
  res.json({ success: true })
}))

export default router


