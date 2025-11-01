import { z } from 'zod'

export const customerIdParamsSchema = z.object({
  id: z.string().uuid('Invalid customer ID'),
})

export const createCustomerSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(20).optional(),
  address: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
})

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
})
