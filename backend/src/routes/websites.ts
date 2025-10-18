import { Router } from 'express'
import { getPrismaClient } from '../services/database'

const router = Router()

// Get all websites
router.get('/', async (req, res) => {
  try {
    const websites = await getPrismaClient().website.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        pages: true,
        _count: {
          select: {
            pages: true,
            products: true,
            orders: true,
          },
        },
      },
    })
    res.json(websites)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch websites' })
  }
})

// Get website by ID
router.get('/:id', async (req, res) => {
  try {
    const website = await getPrismaClient().website.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        pages: true,
        settings: true,
        products: true,
        services: true,
      },
    })
    if (!website) {
      return res.status(404).json({ error: 'Website not found' })
    }
    res.json(website)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch website' })
  }
})

// Create new website
router.post('/', async (req, res) => {
  try {
    const { name, subdomain } = req.body
    
    // Get userId from authenticated user
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const website = await getPrismaClient().website.create({
      data: {
        userId,
        name,
        subdomain,
        status: 'DRAFT',
      },
      include: {
        pages: true,
        settings: true,
      },
    })
    
    res.status(201).json(website)
  } catch (error) {
    console.error('Create website error:', error)
    res.status(500).json({ error: 'Failed to create website' })
  }
})

// Update website
router.put('/:id', async (req, res) => {
  try {
    const { name, subdomain, status, domain } = req.body
    
    const website = await getPrismaClient().website.update({
      where: { id: req.params.id },
      data: {
        name,
        subdomain,
        status,
        domain,
      },
    })
    
    res.json(website)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update website' })
  }
})

// Delete website
router.delete('/:id', async (req, res) => {
  try {
    await getPrismaClient().website.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: 'Website deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete website' })
  }
})

export default router
