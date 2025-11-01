import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { cache } from '../services/redis'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateRequest, validateParams } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import {
  serviceIdParamsSchema,
  websiteIdParamsSchema,
  createServiceSchema,
  updateServiceSchema,
} from '../validations/services'

const router = Router()

// GET /api/websites/:websiteId/services - list services for a website
router.get('/websites/:websiteId/services', authMiddleware, validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const { websiteId } = req.params

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

  const prisma = getPrismaClient()
  const cacheKey = `services:list:${websiteId}`
  const cached = await cache.get(cacheKey)
  if (cached) {
    return res.json({ success: true, data: cached })
  }

  const items = await prisma.service.findMany({
    where: { websiteId },
    orderBy: { createdAt: 'desc' },
  })

  await cache.set(cacheKey, items, 60)
  logger.debug('Services fetched', { count: items.length, websiteId, userId })

  res.json({
    success: true,
    data: items,
  })
}))

// Get all services
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const { websiteId } = req.query as { websiteId?: string }

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Build where clause
  const where: any = {}
  if (userRole !== 'ADMIN') {
    where.website = {
      userId,
    }
  }
  if (websiteId) {
    // Verify ownership if not admin
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

  const services = await getPrismaClient().service.findMany({
    where,
    include: {
      staff: true,
      bookings: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  logger.debug('Services fetched', { count: services.length, userId, websiteId })

  res.json({
    success: true,
    data: services,
  })
}))

// Get service by ID
router.get('/:id', authMiddleware, validateParams(serviceIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const serviceId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const service = await getPrismaClient().service.findUnique({
    where: { id: serviceId },
    include: {
      staff: true,
      bookings: {
        include: {
          customer: true,
          user: true,
        },
      },
      website: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  })

  if (!service) {
    throw createError('Service not found', 404, 'SERVICE_NOT_FOUND')
  }

  // Verify ownership
  if (userRole !== 'ADMIN' && service.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  logger.debug('Service fetched', { serviceId, userId })

  res.json({
    success: true,
    data: service,
  })
}))

// Create new service
router.post('/', authMiddleware, validateRequest(createServiceSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const { websiteId, name, description, type, duration, price, capacity, isPublished } = req.body

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

  const service = await getPrismaClient().service.create({
    data: {
      websiteId,
      name,
      description,
      type,
      duration: duration ? Number(duration) : undefined,
      price: Number(price),
      capacity: Number(capacity) || 1,
      isPublished: isPublished || false,
      availability: JSON.stringify({}),
    },
  })

  // Invalidate cache
  await cache.delete(`services:list:${websiteId}`)

  logger.info('Service created', { serviceId: service.id, websiteId, userId })

  res.status(201).json({
    success: true,
    data: service,
  })
}))

// Update service
router.put('/:id', authMiddleware, validateParams(serviceIdParamsSchema), validateRequest(updateServiceSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const serviceId = req.params.id
  const updates = req.body

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const service = await getPrismaClient().service.findUnique({
    where: { id: serviceId },
    include: {
      website: {
        select: { userId: true, id: true },
      },
    },
  })

  if (!service) {
    throw createError('Service not found', 404, 'SERVICE_NOT_FOUND')
  }

  if (userRole !== 'ADMIN' && service.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const updatedService = await getPrismaClient().service.update({
    where: { id: serviceId },
    data: {
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.duration !== undefined && { duration: Number(updates.duration) }),
      ...(updates.price !== undefined && { price: Number(updates.price) }),
      ...(updates.capacity !== undefined && { capacity: Number(updates.capacity) }),
      ...(updates.isPublished !== undefined && { isPublished: updates.isPublished }),
    },
  })

  // Invalidate cache
  await cache.delete(`services:list:${service.website.id}`)

  logger.info('Service updated', { serviceId, userId })

  res.json({
    success: true,
    data: updatedService,
  })
}))

// Delete service
router.delete('/:id', authMiddleware, validateParams(serviceIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const serviceId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const service = await getPrismaClient().service.findUnique({
    where: { id: serviceId },
    include: {
      website: {
        select: { userId: true, id: true },
      },
    },
  })

  if (!service) {
    throw createError('Service not found', 404, 'SERVICE_NOT_FOUND')
  }

  if (userRole !== 'ADMIN' && service.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  await getPrismaClient().service.delete({
    where: { id: serviceId },
  })

  // Invalidate cache
  await cache.delete(`services:list:${service.website.id}`)

  logger.info('Service deleted', { serviceId, userId })

  res.json({
    success: true,
    message: 'Service deleted successfully',
  })
}))

export default router
