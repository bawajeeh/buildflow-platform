import { z } from 'zod'

export const productIdParamsSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
})

export const websiteIdQuerySchema = z.object({
  websiteId: z.string().uuid('Invalid website ID').optional(),
})

export const createProductSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().max(5000).optional(),
  slug: z.string().max(255).optional(),
  sku: z.string().max(100).optional(),
  price: z.number().positive('Price must be positive').or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive())),
  comparePrice: z.number().positive().or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive())).nullable().optional(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').or(z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(0))),
  isPublished: z.boolean().optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().positive().or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive())).optional(),
  comparePrice: z.number().positive().or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive())).nullable().optional(),
  quantity: z.number().int().min(0).or(z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(0))).optional(),
  isPublished: z.boolean().optional(),
})
