import { z } from 'zod'

export const serviceIdParamsSchema = z.object({
  id: z.string().uuid('Invalid service ID'),
})

export const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

export const createServiceSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  type: z.string().optional(),
  duration: z.number().int().positive('Duration must be positive').optional(),
  price: z.number().nonnegative('Price cannot be negative'),
  capacity: z.number().int().positive('Capacity must be positive').default(1),
  isPublished: z.boolean().default(false),
})

export const updateServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').optional(),
  description: z.string().optional(),
  duration: z.number().int().positive('Duration must be positive').optional(),
  price: z.number().nonnegative('Price cannot be negative').optional(),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  isPublished: z.boolean().optional(),
})

