import { z } from 'zod'

/**
 * Validation schemas for page routes
 */

export const createPageSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be less than 200 characters')
    .regex(/^[a-z0-9]([a-z0-9-/]*[a-z0-9])?$/, 'Invalid slug format')
    .toLowerCase()
    .trim(),
  title: z.string()
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  isHomePage: z.boolean().optional(),
  locale: z.string().max(10).optional(),
})

export const updatePageSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be less than 200 characters')
    .regex(/^[a-z0-9]([a-z0-9-/]*[a-z0-9])?$/, 'Invalid slug format')
    .toLowerCase()
    .trim()
    .optional(),
  isHome: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
})

export const pageIdParamsSchema = z.object({
  id: z.string().uuid('Invalid page ID format'),
})

export const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID format'),
})

