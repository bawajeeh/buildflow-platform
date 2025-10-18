import { Router } from 'express'
import { getPrismaClient } from '../services/database'

const router = Router()

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await getPrismaClient().service.findMany({
      include: {
        staff: true,
        bookings: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })
    res.json(services)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' })
  }
})

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await getPrismaClient().service.findUnique({
      where: { id: req.params.id },
      include: {
        staff: true,
        bookings: {
          include: {
            customer: true,
            user: true,
          },
        },
      },
    })
    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }
    res.json(service)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' })
  }
})

// Create new service
router.post('/', async (req, res) => {
  try {
    const { websiteId, name, description, type, duration, price, capacity, isPublished } = req.body
    
    const service = await getPrismaClient().service.create({
      data: {
        websiteId,
        name,
        description,
        type,
        duration: parseInt(duration),
        price: parseFloat(price),
        capacity: parseInt(capacity) || 1,
        isPublished: isPublished || false,
        availability: JSON.stringify({}),
      },
    })
    
    res.status(201).json(service)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' })
  }
})

// Update service
router.put('/:id', async (req, res) => {
  try {
    const { name, description, duration, price, capacity, isPublished } = req.body
    
    const service = await getPrismaClient().service.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        duration: duration ? parseInt(duration) : undefined,
        price: price ? parseFloat(price) : undefined,
        capacity: capacity ? parseInt(capacity) : undefined,
        isPublished,
      },
    })
    
    res.json(service)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' })
  }
})

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    await getPrismaClient().service.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: 'Service deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' })
  }
})

export default router
