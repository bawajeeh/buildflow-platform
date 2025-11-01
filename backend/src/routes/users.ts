import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateParams } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import { userIdParamsSchema } from '../validations/users'

const router = Router()

// Get all users (Admin only)
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Only admins can list all users
  if (userRole !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const users = await getPrismaClient().user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  logger.info('Users list fetched', { count: users.length, requestedBy: userId })

  res.json({
    success: true,
    data: users,
  })
}))

// Get user by ID
router.get('/:id', authMiddleware, validateParams(userIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const requestedId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Users can only view their own profile, unless they're admin
  if (userRole !== 'ADMIN' && userId !== requestedId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const user = await getPrismaClient().user.findUnique({
    where: { id: requestedId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      websites: {
        select: {
          id: true,
          name: true,
          subdomain: true,
          status: true,
          createdAt: true,
        },
      },
    },
  })

  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND')
  }

  logger.debug('User fetched', { userId: requestedId, requestedBy: userId })

  res.json({
    success: true,
    data: user,
  })
}))

export default router
