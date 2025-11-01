import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { validateRequest, validateParams } from '../middleware/validation'
import { createElementSchema, updateElementSchema, elementIdParamsSchema, pageIdParamsSchema } from '../validations/elements'
import { logger } from '../utils/logger'
import { createError, asyncHandler } from '../utils/errorHandler'

const router = Router()

// Get all elements for a page
router.get('/page/:pageId', validateParams(pageIdParamsSchema), asyncHandler(async (req, res) => {
  const elements = await getPrismaClient().element.findMany({
    where: { pageId: req.params.pageId },
    orderBy: { order: 'asc' },
  })
  
  // Parse JSON fields for response safely
  const parsedElements = elements.map(el => {
    try {
      return {
        ...el,
        props: typeof el.props === 'string' ? JSON.parse(el.props) : el.props,
        styles: typeof el.styles === 'string' ? JSON.parse(el.styles) : el.styles,
        responsive: typeof el.responsive === 'string' ? JSON.parse(el.responsive) : el.responsive,
      }
    } catch (parseError) {
      logger.warn('Failed to parse element JSON', { elementId: el.id, parseError })
      return {
        ...el,
        props: {},
        styles: {},
        responsive: {},
      }
    }
  })
  
  res.json({
    success: true,
    data: parsedElements,
  })
}))

// Get element by ID
router.get('/:id', validateParams(elementIdParamsSchema), asyncHandler(async (req, res) => {
  const element = await getPrismaClient().element.findUnique({
    where: { id: req.params.id },
    include: {
      children: {
        orderBy: { order: 'asc' },
      },
      parent: true,
    },
  })
  
  if (!element) {
    throw createError('Element not found', 404, 'ELEMENT_NOT_FOUND')
  }
  
  // Safe JSON parsing helper
  const parseJsonField = (field: string | unknown, fieldName: string) => {
    try {
      return typeof field === 'string' ? JSON.parse(field) : field
    } catch (parseError) {
      logger.warn(`Failed to parse ${fieldName}`, { elementId: element.id, parseError })
      return {}
    }
  }
  
  const parsedElement = {
    ...element,
    props: parseJsonField(element.props, 'props'),
    styles: parseJsonField(element.styles, 'styles'),
    responsive: parseJsonField(element.responsive, 'responsive'),
    children: element.children?.map(child => ({
      ...child,
      props: parseJsonField(child.props, 'child.props'),
      styles: parseJsonField(child.styles, 'child.styles'),
      responsive: parseJsonField(child.responsive, 'child.responsive'),
    })),
    parent: element.parent ? {
      ...element.parent,
      props: parseJsonField(element.parent.props, 'parent.props'),
      styles: parseJsonField(element.parent.styles, 'parent.styles'),
      responsive: parseJsonField(element.parent.responsive, 'parent.responsive'),
    } : null,
  }
  
  res.json({
    success: true,
    data: parsedElement,
  })
}))

// Create new element
router.post('/', validateRequest(createElementSchema), asyncHandler(async (req, res) => {
  const { pageId, type, name, props, styles, parentId, order, isVisible } = req.body
  
  // Verify page exists and user has access
  const page = await getPrismaClient().page.findUnique({
    where: { id: pageId },
    include: { website: true },
  })
  
  if (!page) {
    throw createError('Page not found', 404, 'PAGE_NOT_FOUND')
  }
  
  const element = await getPrismaClient().element.create({
    data: {
      pageId,
      type,
      name: name.trim(),
      props: JSON.stringify(props || {}),
      styles: JSON.stringify(styles || {}),
      parentId: parentId || null,
      order: order || 0,
      isVisible: isVisible !== false,
      responsive: JSON.stringify({}),
    },
  })
  
  logger.info('Element created', { elementId: element.id, pageId, type })
  
  // Parse JSON fields for response
  const parsedElement = {
    ...element,
    props: typeof element.props === 'string' ? JSON.parse(element.props) : element.props,
    styles: typeof element.styles === 'string' ? JSON.parse(element.styles) : element.styles,
    responsive: typeof element.responsive === 'string' ? JSON.parse(element.responsive) : element.responsive,
  }
  
  res.status(201).json({
    success: true,
    data: parsedElement,
  })
}))

// Update element
router.put('/:id', validateParams(elementIdParamsSchema), validateRequest(updateElementSchema), asyncHandler(async (req, res) => {
  const { name, props, styles, order, isVisible, responsive } = req.body
  
  // Check if element exists
  const existingElement = await getPrismaClient().element.findUnique({
    where: { id: req.params.id },
  })
  
  if (!existingElement) {
    throw createError('Element not found', 404, 'ELEMENT_NOT_FOUND')
  }
  
  const updateData: any = {}
  if (name !== undefined) updateData.name = name.trim()
  if (props !== undefined) updateData.props = JSON.stringify(props)
  if (styles !== undefined) updateData.styles = JSON.stringify(styles)
  if (order !== undefined) updateData.order = order
  if (isVisible !== undefined) updateData.isVisible = isVisible
  if (responsive !== undefined) updateData.responsive = JSON.stringify(responsive)
  
  const element = await getPrismaClient().element.update({
    where: { id: req.params.id },
    data: updateData,
  })
  
  logger.info('Element updated', { elementId: element.id })
  
  // Parse JSON fields for response
  const parsedElement = {
    ...element,
    props: typeof element.props === 'string' ? JSON.parse(element.props) : element.props,
    styles: typeof element.styles === 'string' ? JSON.parse(element.styles) : element.styles,
    responsive: typeof element.responsive === 'string' ? JSON.parse(element.responsive) : element.responsive,
  }
  
  res.json({
    success: true,
    data: parsedElement,
  })
}))

// Delete element
router.delete('/:id', validateParams(elementIdParamsSchema), asyncHandler(async (req, res) => {
  // Check if element exists
  const element = await getPrismaClient().element.findUnique({
    where: { id: req.params.id },
  })
  
  if (!element) {
    throw createError('Element not found', 404, 'ELEMENT_NOT_FOUND')
  }
  
  await getPrismaClient().element.delete({
    where: { id: req.params.id },
  })
  
  logger.info('Element deleted', { elementId: req.params.id })
  
  res.json({
    success: true,
    message: 'Element deleted successfully',
  })
}))

export default router
