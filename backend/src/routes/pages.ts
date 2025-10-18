import { Router } from 'express'
import { getPrismaClient } from '../services/database'

const router = Router()

// Get all pages for a website
router.get('/website/:websiteId', async (req, res) => {
  try {
    const pages = await getPrismaClient().page.findMany({
      where: { websiteId: req.params.websiteId },
      include: {
        elements: {
          orderBy: { order: 'asc' },
        },
      },
    })
    res.json(pages)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' })
  }
})

// Get page by ID
router.get('/:id', async (req, res) => {
  try {
    const page = await getPrismaClient().page.findUnique({
      where: { id: req.params.id },
      include: {
        elements: {
          orderBy: { order: 'asc' },
        },
        website: true,
      },
    })
    if (!page) {
      return res.status(404).json({ error: 'Page not found' })
    }
    res.json(page)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch page' })
  }
})

// Create new page
router.post('/', async (req, res) => {
  try {
    const { websiteId, name, slug, isHome } = req.body
    
    const page = await getPrismaClient().page.create({
      data: {
        websiteId,
        name,
        slug,
        isHome: isHome || false,
        isPublished: false,
      },
    })
    
    res.status(201).json(page)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create page' })
  }
})

// Update page
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, isHome, isPublished } = req.body
    
    const page = await getPrismaClient().page.update({
      where: { id: req.params.id },
      data: {
        name,
        slug,
        isHome,
        isPublished,
      },
    })
    
    res.json(page)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page' })
  }
})

// Delete page
router.delete('/:id', async (req, res) => {
  try {
    await getPrismaClient().page.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: 'Page deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete page' })
  }
})

export default router
