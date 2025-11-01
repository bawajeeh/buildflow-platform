import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { pushActivity } from './activity'
import { validateRequest, validateParams } from '../middleware/validation'
import { createPageSchema, updatePageSchema, pageIdParamsSchema, websiteIdParamsSchema } from '../validations/pages'
import { logger } from '../utils/logger'
import { createError, asyncHandler } from '../utils/errorHandler'

const router = Router()

// Get all pages for a website by website ID
router.get('/:websiteId/pages', validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const { locale } = req.query as { locale?: string }
  const websiteId = req.params.websiteId
  
  let pages = await getPrismaClient().page.findMany({
    where: { websiteId },
    include: {
      elements: {
        orderBy: { order: 'asc' },
      },
    },
  })
  
  if (locale && typeof locale === 'string') {
    pages = pages.filter(p => p.slug === locale || p.slug.startsWith(`${locale}/`))
  }
  
  // Safe JSON parsing for elements
  const parseJsonField = (field: string | unknown) => {
    try {
      return typeof field === 'string' ? JSON.parse(field) : field
    } catch {
      return {}
    }
  }
  
  const parsedPages = pages.map(page => ({
    ...page,
    elements: page.elements.map(el => ({
      ...el,
      props: parseJsonField(el.props),
      styles: parseJsonField(el.styles),
      responsive: parseJsonField(el.responsive),
    })),
  }))
  
  res.json({
    success: true,
    data: parsedPages,
  })
}))

// Create page for a website
router.post('/:websiteId/pages', validateParams(websiteIdParamsSchema), validateRequest(createPageSchema), asyncHandler(async (req, res) => {
  const { name, slug, title, description, isHomePage, locale } = req.body
  const websiteId = req.params.websiteId
  
  // Verify website exists
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
  })
  
  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }
  
  // Generate slug if not provided
  const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const finalSlug = (locale ? `${locale}/` : '') + generatedSlug.replace(/^\//, '')
  
  const page = await getPrismaClient().page.create({
    data: {
      websiteId,
      name: name.trim(),
      slug: finalSlug,
      isHome: isHomePage || false,
      isPublished: false,
    },
  })
  
  try {
    pushActivity(websiteId, 'page.created', { pageId: page.id, name: page.name, slug: page.slug })
  } catch (activityError) {
    logger.warn('Failed to push activity', activityError)
  }
  
  logger.info('Page created', { pageId: page.id, websiteId, name: page.name })
  
  res.status(201).json({
    success: true,
    data: page,
  })
}))

// Get all pages for a website
router.get('/website/:websiteId', validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const websiteId = req.params.websiteId
  const userId = req.user?.id
  
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }
  
  // Verify website exists and user has access
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
  })
  
  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }
  
  if (website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }
  
  const pages = await getPrismaClient().page.findMany({
    where: { websiteId },
    include: {
      elements: {
        orderBy: { order: 'asc' },
      },
    },
  })
  
  // Safe JSON parsing helper
  const parseJsonField = (field: string | unknown) => {
    try {
      return typeof field === 'string' ? JSON.parse(field) : field
    } catch {
      return {}
    }
  }
  
  const parsedPages = pages.map(page => ({
    ...page,
    elements: page.elements.map(el => ({
      ...el,
      props: parseJsonField(el.props),
      styles: parseJsonField(el.styles),
      responsive: parseJsonField(el.responsive),
    })),
  }))
  
  res.json({
    success: true,
    data: parsedPages,
  })
}))

// Get page by ID
router.get('/:id', validateParams(pageIdParamsSchema), asyncHandler(async (req, res) => {
  const page = await getPrismaClient().page.findUnique({
    where: { id: req.params.id },
    include: {
      elements: {
        orderBy: { order: 'asc' },
      },
      website: true,
    },
  })
  
  if (!page) {
    throw createError('Page not found', 404, 'PAGE_NOT_FOUND')
  }
  
  // Safe JSON parsing helper
  const parseJsonField = (field: string | unknown) => {
    try {
      return typeof field === 'string' ? JSON.parse(field) : field
    } catch {
      return {}
    }
  }
  
  const parsedPage = {
    ...page,
    elements: page.elements.map(el => ({
      ...el,
      props: parseJsonField(el.props),
      styles: parseJsonField(el.styles),
      responsive: parseJsonField(el.responsive),
    })),
  }
  
  res.json({
    success: true,
    data: parsedPage,
  })
}))

// Create new page
router.post('/', validateRequest(createPageSchema.extend({ websiteId: z.string().uuid() })), asyncHandler(async (req, res) => {
  const { websiteId, name, slug, isHome } = req.body
  
  // Verify website exists
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
  })
  
  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }
  
  const page = await getPrismaClient().page.create({
    data: {
      websiteId,
      name: name.trim(),
      slug: slug.trim(),
      isHome: isHome || false,
      isPublished: false,
    },
  })
  
  logger.info('Page created', { pageId: page.id, websiteId })
  
  res.status(201).json({
    success: true,
    data: page,
  })
}))

// Update page
router.put('/:id', validateParams(pageIdParamsSchema), validateRequest(updatePageSchema), asyncHandler(async (req, res) => {
  const { name, slug, isHome, isPublished } = req.body
  
  // Check if page exists
  const existingPage = await getPrismaClient().page.findUnique({
    where: { id: req.params.id },
  })
  
  if (!existingPage) {
    throw createError('Page not found', 404, 'PAGE_NOT_FOUND')
  }
  
  const updateData: any = {}
  if (name !== undefined) updateData.name = name.trim()
  if (slug !== undefined) updateData.slug = slug.trim()
  if (isHome !== undefined) updateData.isHome = isHome
  if (isPublished !== undefined) updateData.isPublished = isPublished
  
  const page = await getPrismaClient().page.update({
    where: { id: req.params.id },
    data: updateData,
  })
  
  try {
    pushActivity(page.websiteId, 'page.updated', { pageId: page.id, name: page.name })
  } catch (activityError) {
    logger.warn('Failed to push activity', activityError)
  }
  
  logger.info('Page updated', { pageId: page.id })
  
  res.json({
    success: true,
    data: page,
  })
}))

// Delete page
router.delete('/:id', validateParams(pageIdParamsSchema), asyncHandler(async (req, res) => {
  const page = await getPrismaClient().page.findUnique({
    where: { id: req.params.id },
  })
  
  if (!page) {
    throw createError('Page not found', 404, 'PAGE_NOT_FOUND')
  }
  
  await getPrismaClient().page.delete({
    where: { id: req.params.id },
  })
  
  try {
    pushActivity(page.websiteId, 'page.deleted', { pageId: page.id, name: page.name })
  } catch (activityError) {
    logger.warn('Failed to push activity', activityError)
  }
  
  logger.info('Page deleted', { pageId: req.params.id })
  
  res.json({
    success: true,
    message: 'Page deleted successfully',
  })
}))

export default router
