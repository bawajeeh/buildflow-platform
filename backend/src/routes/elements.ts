import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get all elements for a page
router.get('/page/:pageId', async (req, res) => {
  try {
    const elements = await prisma.element.findMany({
      where: { pageId: req.params.pageId },
      orderBy: { order: 'asc' },
    })
    res.json(elements)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch elements' })
  }
})

// Get element by ID
router.get('/:id', async (req, res) => {
  try {
    const element = await prisma.element.findUnique({
      where: { id: req.params.id },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
        parent: true,
      },
    })
    if (!element) {
      return res.status(404).json({ error: 'Element not found' })
    }
    res.json(element)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch element' })
  }
})

// Create new element
router.post('/', async (req, res) => {
  try {
    const { pageId, type, name, props, styles, parentId, order } = req.body
    
    const element = await prisma.element.create({
      data: {
        pageId,
        type,
        name,
        props: JSON.stringify(props || {}),
        styles: JSON.stringify(styles || {}),
        parentId,
        order: order || 0,
        responsive: JSON.stringify({}),
      },
    })
    
    res.status(201).json(element)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create element' })
  }
})

// Update element
router.put('/:id', async (req, res) => {
  try {
    const { name, props, styles, order, isVisible } = req.body
    
    const element = await prisma.element.update({
      where: { id: req.params.id },
      data: {
        name,
        props: props ? JSON.stringify(props) : undefined,
        styles: styles ? JSON.stringify(styles) : undefined,
        order,
        isVisible,
      },
    })
    
    res.json(element)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update element' })
  }
})

// Delete element
router.delete('/:id', async (req, res) => {
  try {
    await prisma.element.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: 'Element deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete element' })
  }
})

export default router
