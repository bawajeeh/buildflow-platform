import { z } from 'zod'

export const serviceIdParamsSchema = z.object({
  id: z.string().uuid('Invalid service ID'),
})

export const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

export const createServiceSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  name: z.string().min(1, 'Service name is required').max(255),
  description: z.string().max(5000).optional(),
  type: z.string().max(100).optional(),
  duration: z.number().int().positive('Duration must be positive').or(z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive())),
  price: z.number().min(0, 'Price cannot be negative').or(z.string().transform((val) => parseFloat(val)).pipe(z.number().min(0))),
  capacity: z.number().int().positive().or(z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive())).optional(),
  isPublished: z.boolean().optional(),
})

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  duration: z.number().int().positive().or(z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive())).optional(),
  price: z.number().min(0).or(z.string().transform((val) => parseFloat(val)).pipe(z.number().min(0))).optional(),
  capacity: z.number().int().positive().or(z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive())).optional(),
  isPublished: z.boolean().optional(),
})
