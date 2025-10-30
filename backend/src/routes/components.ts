import { Router } from 'express'
import { getPrismaClient } from '../services/database'

const router = Router()

// Get all components for a website
router.get('/website/:websiteId', async (req, res) => {
  try {
    const components = await getPrismaClient().component.findMany({
      where: { websiteId: req.params.websiteId },
      orderBy: { createdAt: 'desc' },
    })

    const parsed = components.map(c => ({
      ...c,
      elements: JSON.parse(c.elements || '[]'),
      variants: c.variants ? JSON.parse(c.variants) : undefined,
    }))

    res.json(parsed)
  } catch (error) {
    console.error('Failed to fetch components:', error)
    res.status(500).json({ error: 'Failed to fetch components' })
  }
})

// Get component by ID
router.get('/:id', async (req, res) => {
  try {
    const component = await getPrismaClient().component.findUnique({
      where: { id: req.params.id },
    })

    if (!component) {
      return res.status(404).json({ error: 'Component not found' })
    }

    res.json({
      ...component,
      elements: JSON.parse(component.elements || '[]'),
      variants: component.variants ? JSON.parse(component.variants) : undefined,
    })
  } catch (error) {
    console.error('Failed to fetch component:', error)
    res.status(500).json({ error: 'Failed to fetch component' })
  }
})

// Create component
router.post('/', async (req, res) => {
  try {
    const { websiteId, name, elements, variants } = req.body

    const component = await getPrismaClient().component.create({
      data: {
        websiteId,
        name,
        elements: JSON.stringify(elements || []),
        variants: variants ? JSON.stringify(variants) : null,
      },
    })

    res.status(201).json({
      ...component,
      elements: JSON.parse(component.elements || '[]'),
      variants: component.variants ? JSON.parse(component.variants) : undefined,
    })
  } catch (error) {
    console.error('Failed to create component:', error)
    res.status(500).json({ error: 'Failed to create component' })
  }
})

// Update component
router.put('/:id', async (req, res) => {
  try {
    const { name, elements, variants } = req.body

    const component = await getPrismaClient().component.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(elements && { elements: JSON.stringify(elements) }),
        ...(variants && { variants: JSON.stringify(variants) }),
      },
    })

    res.json({
      ...component,
      elements: JSON.parse(component.elements || '[]'),
      variants: component.variants ? JSON.parse(component.variants) : undefined,
    })
  } catch (error) {
    console.error('Failed to update component:', error)
    res.status(500).json({ error: 'Failed to update component' })
  }
})

// Delete component
router.delete('/:id', async (req, res) => {
  try {
    await getPrismaClient().component.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Component deleted' })
  } catch (error) {
    console.error('Failed to delete component:', error)
    res.status(500).json({ error: 'Failed to delete component' })
  }
})

export default router

