import { Router } from 'express'
import { z } from 'zod'
import { getPrismaClient } from '../services/database'
import { cache } from '../services/redis'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateRequest, validateParams, validateQuery } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import {
  productIdParamsSchema,
  websiteIdQuerySchema,
  createProductSchema,
  updateProductSchema,
} from '../validations/products'

const router = Router()

// Get all products
router.get('/', authMiddleware, validateQuery(websiteIdQuerySchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const { websiteId } = req.query as { websiteId?: string }

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // If websiteId provided, verify ownership
  if (websiteId) {
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
  }

  const cacheKey = websiteId ? `products:list:${websiteId}` : `products:list:all:${userId}`
  const cached = await cache.get(cacheKey)
  if (cached) {
    return res.json({ success: true, data: cached })
  }

  const products = await getPrismaClient().product.findMany({
    where: websiteId
      ? { websiteId }
      : {
          website: {
            userId,
          },
        },
    include: {
      images: true,
      variants: true,
      categories: true,
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  await cache.set(cacheKey, products, 60)
  logger.debug('Products fetched', { count: products.length, websiteId, userId })

  res.json({
    success: true,
    data: products,
  })
}))

// Get product by ID
router.get('/:id', authMiddleware, validateParams(productIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const productId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const product = await getPrismaClient().product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      variants: true,
      categories: true,
      website: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  })

  if (!product) {
    throw createError('Product not found', 404, 'PRODUCT_NOT_FOUND')
  }

  // Verify ownership
  if (product.website.userId !== userId && req.user?.role !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  logger.debug('Product fetched', { productId, userId })

  res.json({
    success: true,
    data: product,
  })
}))

// Create new product
router.post('/', authMiddleware, validateRequest(createProductSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const { websiteId, name, description, slug, sku, price, comparePrice, quantity, isPublished } = req.body

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

  const product = await getPrismaClient().product.create({
    data: {
      websiteId,
      name,
      description,
      slug,
      sku,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      quantity: Number(quantity) || 0,
      isPublished: isPublished || false,
    },
  })

  // Invalidate cache
  await cache.delete(`products:list:${websiteId}`)

  logger.info('Product created', { productId: product.id, websiteId, userId })

  res.status(201).json({
    success: true,
    data: product,
  })
}))

// Update product
router.put('/:id', authMiddleware, validateParams(productIdParamsSchema), validateRequest(updateProductSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const productId = req.params.id
  const updates = req.body

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const product = await getPrismaClient().product.findUnique({
    where: { id: productId },
    include: {
      website: {
        select: { userId: true, id: true },
      },
    },
  })

  if (!product) {
    throw createError('Product not found', 404, 'PRODUCT_NOT_FOUND')
  }

  if (product.website.userId !== userId && req.user?.role !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const updatedProduct = await getPrismaClient().product.update({
    where: { id: productId },
    data: {
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.price !== undefined && { price: Number(updates.price) }),
      ...(updates.comparePrice !== undefined && {
        comparePrice: updates.comparePrice ? Number(updates.comparePrice) : null,
      }),
      ...(updates.quantity !== undefined && { quantity: Number(updates.quantity) }),
      ...(updates.isPublished !== undefined && { isPublished: updates.isPublished }),
    },
  })

  // Invalidate cache
  await cache.delete(`products:list:${product.website.id}`)

  logger.info('Product updated', { productId, userId })

  res.json({
    success: true,
    data: updatedProduct,
  })
}))

// Delete product
router.delete('/:id', authMiddleware, validateParams(productIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const productId = req.params.id

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Verify ownership
  const product = await getPrismaClient().product.findUnique({
    where: { id: productId },
    include: {
      website: {
        select: { userId: true, id: true },
      },
    },
  })

  if (!product) {
    throw createError('Product not found', 404, 'PRODUCT_NOT_FOUND')
  }

  if (product.website.userId !== userId && req.user?.role !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  await getPrismaClient().product.delete({
    where: { id: productId },
  })

  // Invalidate cache
  await cache.delete(`products:list:${product.website.id}`)

  logger.info('Product deleted', { productId, userId })

  res.json({
    success: true,
    message: 'Product deleted successfully',
  })
}))

export default router
