import { z } from 'zod'

export const orderIdParamsSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
})

export const createOrderSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  userId: z.string().uuid('Invalid user ID').optional(),
  customerId: z.string().uuid('Invalid customer ID').optional(),
  orderNumber: z.string().max(100).optional(),
  subtotal: z.number().min(0).or(z.string().transform((val) => parseFloat(val)).pipe(z.number().min(0))),
  tax: z.number().min(0).or(z.string().transform((val) => parseFloat(val)).pipe(z.number().min(0))).optional(),
  shipping: z.number().min(0).or(z.string().transform((val) => parseFloat(val)).pipe(z.number().min(0))).optional(),
  discount: z.number().min(0).or(z.string().transform((val) => parseFloat(val)).pipe(z.number().min(0))).optional(),
  total: z.number().min(0).or(z.string().transform((val) => parseFloat(val)).pipe(z.number().min(0))),
  shippingAddress: z.record(z.unknown()).optional(),
  billingAddress: z.record(z.unknown()).optional(),
  currency: z.string().max(10).default('USD'),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
})
