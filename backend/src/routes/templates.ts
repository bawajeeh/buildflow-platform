import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      where: { isActive: true },
      include: {
        pages: true,
        _count: {
          select: {
            pages: true,
          },
        },
      },
    })
    res.json(templates)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
      include: {
        pages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }
    res.json(template)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' })
  }
})

export default router
