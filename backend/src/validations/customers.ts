import { z } from 'zod'

export const customerIdParamsSchema = z.object({
  id: z.string().uuid('Invalid customer ID'),
})

export const createCustomerSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  address: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
})

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  address: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
})

