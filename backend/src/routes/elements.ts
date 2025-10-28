import { Router } from 'express'
import { getPrismaClient } from '../services/database'

const router = Router()

// Get all elements for a page
router.get('/page/:pageId', async (req, res) => {
  try {
    const elements = await getPrismaClient().element.findMany({
      where: { pageId: req.params.pageId },
      orderBy: { order: 'asc' },
    })
    
    // Parse JSON fields for response
    const parsedElements = elements.map(el => ({
      ...el,
      props: JSON.parse(el.props),
      styles: JSON.parse(el.styles),
      responsive: JSON.parse(el.responsive),
    }))
    
    res.json(parsedElements)
  } catch (error) {
    console.error('Failed to fetch elements:', error)
    res.status(500).json({ error: 'Failed to fetch elements' })
  }
})

// Get element by ID
router.get('/:id', async (req, res) => {
  try {
    const element = await getPrismaClient().element.findUnique({
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
    
    // Parse JSON fields for response
    const parsedElement = {
      ...element,
      props: JSON.parse(element.props),
      styles: JSON.parse(element.styles),
      responsive: JSON.parse(element.responsive),
      children: element.children?.map(child => ({
        ...child,
        props: JSON.parse(child.props),
        styles: JSON.parse(child.styles),
        responsive: JSON.parse(child.responsive),
      })),
      parent: element.parent ? {
        ...element.parent,
        props: JSON.parse(element.parent.props),
        styles: JSON.parse(element.parent.styles),
        responsive: JSON.parse(element.parent.responsive),
      } : null,
    }
    
    res.json(parsedElement)
  } catch (error) {
    console.error('Failed to fetch element:', error)
    res.status(500).json({ error: 'Failed to fetch element' })
  }
})

// Create new element
router.post('/', async (req, res) => {
  try {
    const { pageId, type, name, props, styles, parentId, order } = req.body
    
    const element = await getPrismaClient().element.create({
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
    
    // Parse JSON fields for response
    const parsedElement = {
      ...element,
      props: JSON.parse(element.props),
      styles: JSON.parse(element.styles),
      responsive: JSON.parse(element.responsive),
    }
    
    res.status(201).json(parsedElement)
  } catch (error) {
    console.error('Failed to create element:', error)
    res.status(500).json({ error: 'Failed to create element' })
  }
})

// Update element
router.put('/:id', async (req, res) => {
  try {
    const { name, props, styles, order, isVisible } = req.body
    
    const element = await getPrismaClient().element.update({
      where: { id: req.params.id },
      data: {
        name,
        props: props ? JSON.stringify(props) : undefined,
        styles: styles ? JSON.stringify(styles) : undefined,
        order,
        isVisible,
      },
    })
    
    // Parse JSON fields for response
    const parsedElement = {
      ...element,
      props: JSON.parse(element.props),
      styles: JSON.parse(element.styles),
      responsive: JSON.parse(element.responsive),
    }
    
    res.json(parsedElement)
  } catch (error) {
    console.error('Failed to update element:', error)
    res.status(500).json({ error: 'Failed to update element' })
  }
})

// Delete element
router.delete('/:id', async (req, res) => {
  try {
    await getPrismaClient().element.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: 'Element deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete element' })
  }
})

export default router
