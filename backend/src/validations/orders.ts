import { z } from 'zod'

export const orderIdParamsSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
})

export const createOrderSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  userId: z.string().uuid('Invalid user ID').optional(),
  customerId: z.string().uuid('Invalid customer ID').optional(),
  orderNumber: z.string().min(1, 'Order number is required'),
  subtotal: z.number().nonnegative('Subtotal cannot be negative'),
  tax: z.number().nonnegative('Tax cannot be negative').default(0),
  shipping: z.number().nonnegative('Shipping cannot be negative').default(0),
  discount: z.number().nonnegative('Discount cannot be negative').default(0),
  total: z.number().positive('Total must be positive'),
  shippingAddress: z.record(z.any()).optional(),
  billingAddress: z.record(z.any()).optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
})

