import { z } from 'zod'

/**
 * Validation schemas for website routes
 */

export const createWebsiteSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  subdomain: z.string()
    .min(1, 'Subdomain is required')
    .max(63, 'Subdomain must be less than 63 characters')
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/, 'Invalid subdomain format')
    .toLowerCase()
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
})

export const updateWebsiteSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  subdomain: z.string()
    .min(1, 'Subdomain is required')
    .max(63, 'Subdomain must be less than 63 characters')
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/, 'Invalid subdomain format')
    .toLowerCase()
    .trim()
    .optional(),
  domain: z.string()
    .url('Invalid domain format')
    .max(255, 'Domain must be less than 255 characters')
    .optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
})

export const updateThemeSchema = z.object({
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
})

export const subdomainParamsSchema = z.object({
  subdomain: z.string()
    .min(1, 'Subdomain is required')
    .max(63, 'Subdomain must be less than 63 characters')
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/, 'Invalid subdomain format')
    .toLowerCase(),
})

export const websiteIdParamsSchema = z.object({
  id: z.string().uuid('Invalid website ID format'),
})

