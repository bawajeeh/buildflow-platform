import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { requireWebsiteAccess } from '../middleware/auth'

// We use existing Template and TemplatePage tables to store website snapshots
// category = 'SNAPSHOT', tags stores websiteId for quick filtering

const router = Router()

// List snapshots for a website
router.get('/websites/:websiteId/snapshots', requireWebsiteAccess(), async (req, res) => {
  try {
    const prisma = getPrismaClient()
    const websiteId = req.params.websiteId

    const snapshots = await prisma.template.findMany({
      where: { category: 'SNAPSHOT', tags: websiteId },
      orderBy: { createdAt: 'desc' },
      include: { pages: true },
    })

    res.json(
      snapshots.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        createdAt: s.createdAt,
        pageCount: s.pages.length,
      }))
    )
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list snapshots' })
  }
})

// Create a snapshot for a website
router.post('/websites/:websiteId/snapshots', requireWebsiteAccess(), async (req, res) => {
  try {
    const prisma = getPrismaClient()
    const websiteId = req.params.websiteId
    const { name } = req.body || {}

    const website = await prisma.website.findUnique({ where: { id: websiteId } })
    if (!website) return res.status(404).json({ error: 'Website not found' })

    const pages = await prisma.page.findMany({
      where: { websiteId },
      include: {
        elements: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Create Template snapshot with TemplatePages
    const snapshot = await prisma.template.create({
      data: {
        name: name || `${website.name} Snapshot ${new Date().toISOString()}`,
        description: `Snapshot of website ${website.name}`,
        category: 'SNAPSHOT',
        preview: '',
        tags: websiteId,
        pages: {
          create: pages.map(p => ({
            name: p.name,
            slug: p.slug,
            elements: JSON.stringify(
              p.elements.map(el => ({
                id: el.id,
                type: el.type,
                name: el.name,
                props: el.props,
                styles: el.styles,
                parentId: el.parentId,
                order: el.order,
                isVisible: el.isVisible,
                responsive: el.responsive,
              }))
            ),
          })),
        },
      },
      include: { pages: true },
    })

    res.status(201).json({ id: snapshot.id, name: snapshot.name, createdAt: snapshot.createdAt, pageCount: snapshot.pages.length })
  } catch (error: any) {
    console.error('Create snapshot failed:', error)
    res.status(500).json({ error: error.message || 'Failed to create snapshot' })
  }
})

// Restore a snapshot to a website (destructive)
router.post('/websites/:websiteId/snapshots/:snapshotId/restore', requireWebsiteAccess(), async (req, res) => {
  const prisma = getPrismaClient()
  const websiteId = req.params.websiteId
  const snapshotId = req.params.snapshotId

  try {
    const snapshot = await prisma.template.findUnique({
      where: { id: snapshotId },
      include: { pages: true },
    })
    if (!snapshot || snapshot.category !== 'SNAPSHOT' || snapshot.tags !== websiteId) {
      return res.status(404).json({ error: 'Snapshot not found for this website' })
    }

    await prisma.$transaction(async tx => {
      // Delete existing pages (cascade deletes elements)
      await tx.page.deleteMany({ where: { websiteId } })

      // Recreate pages and elements from snapshot
      for (const sp of snapshot.pages) {
        const createdPage = await tx.page.create({
          data: {
            websiteId,
            name: sp.name,
            slug: sp.slug,
            isHome: false,
            isPublished: false,
          },
        })

        const elements = JSON.parse(sp.elements || '[]') as any[]
        // Create elements preserving order and hierarchy
        for (const el of elements) {
          await tx.element.create({
            data: {
              pageId: createdPage.id,
              type: el.type,
              name: el.name,
              props: typeof el.props === 'string' ? el.props : JSON.stringify(el.props || {}),
              styles: typeof el.styles === 'string' ? el.styles : JSON.stringify(el.styles || {}),
              parentId: null, // parent relationships will be rebuilt in a simple flat manner
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
    console.error('Restore snapshot failed:', error)
    res.status(500).json({ error: error.message || 'Failed to restore snapshot' })
  }
})

export default router


