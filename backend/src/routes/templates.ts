import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'
import { cache } from '../services/redis'
import { authMiddleware } from '../middleware/auth'
import { requireWebsiteAccess } from '../middleware/auth'
import { asyncHandler, createError } from '../utils/errorHandler'

const router = Router()

// Get all templates - Public route (no auth required for template browsing)
router.get('/', asyncHandler(async (req, res) => {
  try {
    const cacheKey = 'templates:list:v1'
    const cached = await cache.get(cacheKey)
    if (cached) {
      return res.json({ success: true, data: cached })
    }

    const templates = await getPrismaClient().template.findMany({
      where: { isActive: true },
      include: {
        pages: true,
        _count: {
          select: {
            pages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    // cache for 60s
    await cache.set(cacheKey, templates, 60)
    
    logger.debug('Templates fetched', { count: templates.length })

    res.json({ success: true, data: templates })
  } catch (error) {
    logger.error('Failed to fetch templates', error)
    throw createError('Failed to fetch templates', 500, 'TEMPLATES_FETCH_ERROR')
  }
}))

// Get template by ID - Public route (no auth required for template viewing)
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const template = await getPrismaClient().template.findUnique({
      where: { id: req.params.id },
      include: {
        pages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!template) {
      throw createError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    logger.debug('Template fetched', { templateId: req.params.id })

    res.json({ success: true, data: template })
  } catch (error) {
    logger.error('Failed to fetch template', error, { templateId: req.params.id })
    throw createError('Failed to fetch template', 500, 'TEMPLATE_FETCH_ERROR')
  }
}))

// Export a website as a template
router.post('/export/website/:websiteId', authMiddleware, requireWebsiteAccess(), async (req, res) => {
  try {
    const prisma = getPrismaClient()
    const websiteId = req.params.websiteId
    const { name, description, category = 'WEBSITE_EXPORT', tags } = req.body || {}

    const website = await prisma.website.findUnique({ where: { id: websiteId } })
    if (!website) return res.status(404).json({ error: 'Website not found' })

    const pages = await prisma.page.findMany({
      where: { websiteId },
      include: { elements: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    })

    const tpl = await prisma.template.create({
      data: {
        name: name || `${website.name} Template`,
        description: description || `Exported from website ${website.name}`,
        category,
        preview: '',
        tags: tags || 'export',
        pages: {
          create: pages.map((p) => ({
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
      include: { pages: true },
    })

    // Invalidate list cache
    await cache.del('templates:list:v1')

    res.status(201).json({ id: tpl.id, name: tpl.name, pages: tpl.pages.length })
  } catch (error: any) {
    logger.error('Template export failed', error, { websiteId: req.params.id })
    res.status(500).json({ error: error.message || 'Failed to export template' })
  }
})

// Import a template into a website
router.post('/import', authMiddleware, requireWebsiteAccess(), async (req, res) => {
  try {
    const prisma = getPrismaClient()
    const { websiteId, templateId } = req.body || {}
    if (!websiteId || !templateId) return res.status(400).json({ error: 'websiteId and templateId required' })

    const template = await prisma.template.findUnique({ where: { id: templateId }, include: { pages: true } })
    if (!template) return res.status(404).json({ error: 'Template not found' })

    await prisma.$transaction(async (tx) => {
      // Clear existing pages
      await tx.page.deleteMany({ where: { websiteId } })
      // Recreate from template
      for (const tp of template.pages) {
        const created = await tx.page.create({
          data: { websiteId, name: tp.name, slug: tp.slug, isHome: false, isPublished: false },
        })
        const elements = JSON.parse(tp.elements || '[]')
        for (const el of elements) {
          await tx.element.create({
            data: {
              pageId: created.id,
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
  } catch (error: any) {
    logger.error('Template import failed', error, { websiteId: req.params.websiteId })
    res.status(500).json({ error: error.message || 'Failed to import template' })
  }
})

export default router
