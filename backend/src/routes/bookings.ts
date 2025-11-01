import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateRequest, validateParams } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import {
  bookingIdParamsSchema,
  createBookingSchema,
  updateBookingStatusSchema,
} from '../validations/bookings'

const router = Router()

// Get all bookings
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const { websiteId } = req.query as { websiteId?: string }

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Build where clause based on user role
  const where: any = {}
  if (userRole !== 'ADMIN') {
    where.website = {
      userId,
    }
  }
  if (websiteId) {
    // Verify website ownership if not admin
    if (userRole !== 'ADMIN') {
      const website = await getPrismaClient().website.findUnique({
        where: { id: websiteId },
        select: { userId: true },
      })
      if (!website || website.userId !== userId) {
        throw createError('Insufficient permissions', 403, 'FORBIDDEN')
      }
    }
    where.websiteId = websiteId
  }

  const bookings = await getPrismaClient().booking.findMany({
    where,
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

  logger.debug('Bookings fetched', { count: bookings.length, userId, websiteId })

  res.json({
    success: true,
    data: bookings,
  })
}))

// Get booking by ID
router.get('/:id', authMiddleware, validateParams(bookingIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const bookingId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const booking = await getPrismaClient().booking.findUnique({
    where: { id: bookingId },
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
      website: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  })

  if (!booking) {
    throw createError('Booking not found', 404, 'BOOKING_NOT_FOUND')
  }

  // Verify ownership
  if (userRole !== 'ADMIN' && booking.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  logger.debug('Booking fetched', { bookingId, userId })

  res.json({
    success: true,
    data: booking,
  })
}))

// Create new booking
router.post('/', authMiddleware, validateRequest(createBookingSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const {
    websiteId,
    serviceId,
    staffId,
    userId: bookingUserId,
    customerId,
    startTime,
    endTime,
    totalPrice,
    notes,
  } = req.body

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify website ownership
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
    select: { userId: true },
  })

  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }

  if (website.userId !== userId && req.user?.role !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const booking = await getPrismaClient().booking.create({
    data: {
      websiteId,
      serviceId,
      staffId,
      userId: bookingUserId || userId,
      customerId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalPrice: Number(totalPrice),
      depositPaid: 0,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      notes,
    },
  })

  logger.info('Booking created', { bookingId: booking.id, websiteId, userId })

  res.status(201).json({
    success: true,
    data: booking,
  })
}))

// Update booking status
router.put('/:id/status', authMiddleware, validateParams(bookingIdParamsSchema), validateRequest(updateBookingStatusSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const bookingId = req.params.id
  const { status, paymentStatus } = req.body

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const booking = await getPrismaClient().booking.findUnique({
    where: { id: bookingId },
    include: {
      website: {
        select: { userId: true },
      },
    },
  })

  if (!booking) {
    throw createError('Booking not found', 404, 'BOOKING_NOT_FOUND')
  }

  if (userRole !== 'ADMIN' && booking.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const updatedBooking = await getPrismaClient().booking.update({
    where: { id: bookingId },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
  })

  logger.info('Booking status updated', { bookingId, status, paymentStatus, userId })

  res.json({
    success: true,
    data: updatedBooking,
  })
}))

export default router
