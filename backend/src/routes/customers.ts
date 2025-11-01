import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateRequest, validateParams } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import {
  customerIdParamsSchema,
  createCustomerSchema,
  updateCustomerSchema,
} from '../validations/customers'

const router = Router()

// Get all customers
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

  const customers = await getPrismaClient().customer.findMany({
    where,
    include: {
      bookings: true,
      orders: true,
      _count: {
        select: {
          bookings: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  logger.debug('Customers fetched', { count: customers.length, userId, websiteId })

  res.json({
    success: true,
    data: customers,
  })
}))

// Get customer by ID
router.get('/:id', authMiddleware, validateParams(customerIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const customerId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const customer = await getPrismaClient().customer.findUnique({
    where: { id: customerId },
    include: {
      bookings: {
        include: {
          service: true,
          staff: true,
        },
      },
      orders: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
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

  if (!customer) {
    throw createError('Customer not found', 404, 'CUSTOMER_NOT_FOUND')
  }

  // Verify ownership
  if (userRole !== 'ADMIN' && customer.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  logger.debug('Customer fetched', { customerId, userId })

  res.json({
    success: true,
    data: customer,
  })
}))

// Create new customer
router.post('/', authMiddleware, validateRequest(createCustomerSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const { websiteId, email, firstName, lastName, phone, address, tags } = req.body

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

  const customer = await getPrismaClient().customer.create({
    data: {
      websiteId,
      email,
      firstName,
      lastName,
      phone,
      address: address ? JSON.stringify(address) : null,
      tags: tags ? tags.join(',') : null,
      totalSpent: 0,
      totalOrders: 0,
    },
  })

  logger.info('Customer created', { customerId: customer.id, websiteId, userId })

  res.status(201).json({
    success: true,
    data: customer,
  })
}))

// Update customer
router.put('/:id', authMiddleware, validateParams(customerIdParamsSchema), validateRequest(updateCustomerSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const customerId = req.params.id
  const { firstName, lastName, phone, address, tags } = req.body

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const customer = await getPrismaClient().customer.findUnique({
    where: { id: customerId },
    include: {
      website: {
        select: { userId: true },
      },
    },
  })

  if (!customer) {
    throw createError('Customer not found', 404, 'CUSTOMER_NOT_FOUND')
  }

  if (userRole !== 'ADMIN' && customer.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const updatedCustomer = await getPrismaClient().customer.update({
    where: { id: customerId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address: address ? JSON.stringify(address) : null }),
      ...(tags !== undefined && { tags: tags ? tags.join(',') : undefined }),
    },
  })

  logger.info('Customer updated', { customerId, userId })

  res.json({
    success: true,
    data: updatedCustomer,
  })
}))

// Delete customer
router.delete('/:id', authMiddleware, validateParams(customerIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const customerId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const customer = await getPrismaClient().customer.findUnique({
    where: { id: customerId },
    include: {
      website: {
        select: { userId: true },
      },
    },
  })

  if (!customer) {
    throw createError('Customer not found', 404, 'CUSTOMER_NOT_FOUND')
  }

  if (userRole !== 'ADMIN' && customer.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  await getPrismaClient().customer.delete({
    where: { id: customerId },
  })

  logger.info('Customer deleted', { customerId, userId })

  res.json({
    success: true,
    message: 'Customer deleted successfully',
  })
}))

// Get customer analytics
router.get('/:id/analytics', authMiddleware, validateParams(customerIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const customerId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const customer = await getPrismaClient().customer.findUnique({
    where: { id: customerId },
    include: {
      bookings: {
        select: {
          totalPrice: true,
          createdAt: true,
          status: true,
        },
      },
      orders: {
        select: {
          total: true,
          createdAt: true,
          status: true,
        },
      },
      website: {
        select: {
          userId: true,
        },
      },
    },
  })

  if (!customer) {
    throw createError('Customer not found', 404, 'CUSTOMER_NOT_FOUND')
  }

  // Verify ownership
  if (userRole !== 'ADMIN' && customer.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const analytics = {
    totalSpent: customer.totalSpent,
    totalOrders: customer.totalOrders,
    totalBookings: customer.bookings.length,
    averageOrderValue: customer.orders.length > 0
      ? customer.orders.reduce((sum, order) => sum + order.total, 0) / customer.orders.length
      : 0,
    lastOrderDate: customer.lastOrderDate,
    bookingHistory: customer.bookings,
    orderHistory: customer.orders,
  }

  logger.debug('Customer analytics fetched', { customerId, userId })

  res.json({
    success: true,
    data: analytics,
  })
}))

export default router
