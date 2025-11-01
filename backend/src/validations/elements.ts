import { z } from 'zod'

/**
 * Validation schemas for element routes
 */

export const createElementSchema = z.object({
  pageId: z.string().uuid('Invalid page ID format'),
  type: z.string()
    .min(1, 'Element type is required')
    .max(50, 'Element type must be less than 50 characters'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  props: z.record(z.unknown()).optional().default({}),
  styles: z.record(z.unknown()).optional().default({}),
  parentId: z.string().uuid('Invalid parent ID format').optional().nullable(),
  order: z.number().int().min(0).optional().default(0),
  isVisible: z.boolean().optional().default(true),
})

export const updateElementSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  props: z.record(z.unknown()).optional(),
  styles: z.record(z.unknown()).optional(),
  order: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
  responsive: z.record(z.unknown()).optional(),
})

export const elementIdParamsSchema = z.object({
  id: z.string().uuid('Invalid element ID format'),
})

export const pageIdParamsSchema = z.object({
  pageId: z.string().uuid('Invalid page ID format'),
})

