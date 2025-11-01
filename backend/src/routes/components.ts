import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateRequest, validateParams } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import {
  componentIdParamsSchema,
  websiteIdParamsSchema,
  createComponentSchema,
  updateComponentSchema,
} from '../validations/components'

const router = Router()

// Get all components for a website
router.get('/website/:websiteId', authMiddleware, validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
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

  const components = await getPrismaClient().component.findMany({
    where: { websiteId },
    orderBy: { createdAt: 'desc' },
  })

  // Safely parse JSON fields
  const parsed = components.map(c => {
    try {
      return {
        ...c,
        elements: JSON.parse(c.elements || '[]'),
        variants: c.variants ? JSON.parse(c.variants) : undefined,
      }
    } catch (parseError) {
      logger.error('Failed to parse component JSON', parseError, { componentId: c.id })
      return {
        ...c,
        elements: [],
        variants: undefined,
      }
    }
  })

  logger.debug('Components fetched', { count: parsed.length, websiteId, userId })

  res.json({
    success: true,
    data: parsed,
  })
}))

// Get component by ID
router.get('/:id', authMiddleware, validateParams(componentIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const componentId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const component = await getPrismaClient().component.findUnique({
    where: { id: componentId },
    include: {
      website: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  })

  if (!component) {
    throw createError('Component not found', 404, 'COMPONENT_NOT_FOUND')
  }

  // Verify ownership
  if (userRole !== 'ADMIN' && component.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  // Safely parse JSON fields
  try {
    const parsed = {
      ...component,
      elements: JSON.parse(component.elements || '[]'),
      variants: component.variants ? JSON.parse(component.variants) : undefined,
    }

    logger.debug('Component fetched', { componentId, userId })

    res.json({
      success: true,
      data: parsed,
    })
  } catch (parseError) {
    logger.error('Failed to parse component JSON', parseError, { componentId })
    throw createError('Failed to parse component data', 500, 'PARSE_ERROR')
  }
}))

// Create component
router.post('/', authMiddleware, validateRequest(createComponentSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const { websiteId, name, elements, variants } = req.body

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

  const component = await getPrismaClient().component.create({
    data: {
      websiteId,
      name,
      elements: JSON.stringify(elements || []),
      variants: variants ? JSON.stringify(variants) : null,
    },
  })

  // Safely parse for response
  try {
    const parsed = {
      ...component,
      elements: JSON.parse(component.elements || '[]'),
      variants: component.variants ? JSON.parse(component.variants) : undefined,
    }

    logger.info('Component created', { componentId: component.id, websiteId, userId })

    res.status(201).json({
      success: true,
      data: parsed,
    })
  } catch (parseError) {
    logger.error('Failed to parse created component', parseError, { componentId: component.id })
    // Still return the component, but with safe defaults
    res.status(201).json({
      success: true,
      data: {
        ...component,
        elements: [],
        variants: undefined,
      },
    })
  }
}))

// Update component
router.put('/:id', authMiddleware, validateParams(componentIdParamsSchema), validateRequest(updateComponentSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const componentId = req.params.id
  const { name, elements, variants } = req.body

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const component = await getPrismaClient().component.findUnique({
    where: { id: componentId },
    include: {
      website: {
        select: { userId: true },
      },
    },
  })

  if (!component) {
    throw createError('Component not found', 404, 'COMPONENT_NOT_FOUND')
  }

  if (userRole !== 'ADMIN' && component.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const updatedComponent = await getPrismaClient().component.update({
    where: { id: componentId },
    data: {
      ...(name && { name }),
      ...(elements && { elements: JSON.stringify(elements) }),
      ...(variants && { variants: JSON.stringify(variants) }),
    },
  })

  // Safely parse for response
  try {
    const parsed = {
      ...updatedComponent,
      elements: JSON.parse(updatedComponent.elements || '[]'),
      variants: updatedComponent.variants ? JSON.parse(updatedComponent.variants) : undefined,
    }

    logger.info('Component updated', { componentId, userId })

    res.json({
      success: true,
      data: parsed,
    })
  } catch (parseError) {
    logger.error('Failed to parse updated component', parseError, { componentId })
    throw createError('Failed to parse component data', 500, 'PARSE_ERROR')
  }
}))

// Delete component
router.delete('/:id', authMiddleware, validateParams(componentIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const componentId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const component = await getPrismaClient().component.findUnique({
    where: { id: componentId },
    include: {
      website: {
        select: { userId: true },
      },
    },
  })

  if (!component) {
    throw createError('Component not found', 404, 'COMPONENT_NOT_FOUND')
  }

  if (userRole !== 'ADMIN' && component.website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  await getPrismaClient().component.delete({
    where: { id: componentId },
  })

  logger.info('Component deleted', { componentId, userId })

  res.json({
    success: true,
    message: 'Component deleted',
  })
}))

export default router

