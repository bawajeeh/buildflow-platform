import { z } from 'zod'

export const userIdParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['USER', 'ADMIN', 'VIEWER'], { errorMap: () => ({ message: 'Invalid role' }) }).optional(),
})
