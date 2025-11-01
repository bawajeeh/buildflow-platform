import { z } from 'zod'

export const productIdParamsSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
})

export const websiteIdQuerySchema = z.object({
  websiteId: z.string().uuid('Invalid website ID').optional(),
})

export const createProductSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  sku: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().positive('Compare price must be positive').optional(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').default(0),
  isPublished: z.boolean().default(false),
})

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').optional(),
  comparePrice: z.number().positive('Compare price must be positive').optional(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').optional(),
  isPublished: z.boolean().optional(),
})

