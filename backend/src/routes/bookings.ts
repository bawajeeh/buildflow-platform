import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
        staff: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        customer: true,
      },
      orderBy: { startTime: 'desc' },
    })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        service: true,
        staff: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        customer: true,
      },
    })
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    res.json(booking)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' })
  }
})

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { websiteId, serviceId, staffId, userId, customerId, startTime, endTime, totalPrice, notes } = req.body
    
    const booking = await prisma.booking.create({
      data: {
        websiteId,
        serviceId,
        staffId,
        userId,
        customerId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalPrice: parseFloat(totalPrice),
        depositPaid: 0,
        status: 'CONFIRMED',
        paymentStatus: 'PENDING',
        notes,
      },
    })
    
    res.status(201).json(booking)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

// Update booking status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body
    
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status,
        paymentStatus,
      },
    })
    
    res.json(booking)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' })
  }
})

export default router
