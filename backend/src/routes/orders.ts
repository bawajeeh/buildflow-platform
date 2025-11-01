import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateRequest, validateParams } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import {
  orderIdParamsSchema,
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validations/orders'

const router = Router()

// Get all orders
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
    // Regular users can only see orders from their websites
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

  const orders = await getPrismaClient().order.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  logger.debug('Orders fetched', { count: orders.length, userId, websiteId })

  res.json({
    success: true,
    data: orders,
  })
}))

// Get order by ID
router.get('/:id', authMiddleware, validateParams(orderIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const orderId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const order = await getPrismaClient().order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      customer: true,
      items: {
        include: {
          product: true,
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

  if (!order) {
    throw createError('Order not found', 404, 'ORDER_NOT_FOUND')
  }

  // Verify ownership
  if (userRole !== 'ADMIN' && order.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  logger.debug('Order fetched', { orderId, userId })

  res.json({
    success: true,
    data: order,
  })
}))

// Create new order
router.post('/', authMiddleware, validateRequest(createOrderSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const {
    websiteId,
    userId: orderUserId,
    customerId,
    orderNumber,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    shippingAddress,
    billingAddress,
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

  const order = await getPrismaClient().order.create({
    data: {
      websiteId,
      userId: orderUserId || userId,
      customerId,
      orderNumber,
      subtotal: Number(subtotal),
      tax: Number(tax) || 0,
      shipping: Number(shipping) || 0,
      discount: Number(discount) || 0,
      total: Number(total),
      shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
      billingAddress: billingAddress ? JSON.stringify(billingAddress) : null,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
  })

  logger.info('Order created', { orderId: order.id, websiteId, userId })

  res.status(201).json({
    success: true,
    data: order,
  })
}))

// Update order status
router.put('/:id/status', authMiddleware, validateParams(orderIdParamsSchema), validateRequest(updateOrderStatusSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const orderId = req.params.id
  const { status, paymentStatus } = req.body

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const order = await getPrismaClient().order.findUnique({
    where: { id: orderId },
    include: {
      website: {
        select: { userId: true },
      },
    },
  })

  if (!order) {
    throw createError('Order not found', 404, 'ORDER_NOT_FOUND')
  }

  if (userRole !== 'ADMIN' && order.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const updatedOrder = await getPrismaClient().order.update({
    where: { id: orderId },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
  })

  logger.info('Order status updated', { orderId, status, paymentStatus, userId })

  res.json({
    success: true,
    data: updatedOrder,
  })
}))

export default router
