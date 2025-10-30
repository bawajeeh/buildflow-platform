import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { requireWebsiteAccess } from '../middleware/auth'

const router = Router()

// List backups
router.get('/websites/:websiteId/backups', requireWebsiteAccess(), async (req, res) => {
  try {
    const prisma = getPrismaClient()
    const backups = await prisma.template.findMany({
      where: { category: 'BACKUP', tags: req.params.websiteId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true },
    })
    res.json(backups)
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to list backups' })
  }
})

// Create backup
router.post('/websites/:websiteId/backups', requireWebsiteAccess(), async (req, res) => {
  try {
    const prisma = getPrismaClient()
    const websiteId = req.params.websiteId
    const website = await prisma.website.findUnique({ where: { id: websiteId } })
    if (!website) return res.status(404).json({ error: 'Website not found' })
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
    res.status(201).json(backup)
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to create backup' })
  }
})

// Restore backup
router.post('/websites/:websiteId/backups/:backupId/restore', requireWebsiteAccess(), async (req, res) => {
  try {
    const prisma = getPrismaClient()
    const websiteId = req.params.websiteId
    const backupId = req.params.backupId
    const backup = await prisma.template.findUnique({ where: { id: backupId }, include: { pages: true } })
    if (!backup || backup.category !== 'BACKUP' || backup.tags !== websiteId) return res.status(404).json({ error: 'Backup not found' })
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
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to restore backup' })
  }
})

export default router


