import { z } from 'zod'

export const bookingIdParamsSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
})

export const createBookingSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  serviceId: z.string().uuid('Invalid service ID').optional(),
  staffId: z.string().uuid('Invalid staff ID').optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  customerId: z.string().uuid('Invalid customer ID').optional(),
  startTime: z.string().datetime('Invalid start time').or(z.date()),
  endTime: z.string().datetime('Invalid end time').or(z.date()),
  totalPrice: z.number().min(0).or(z.string().transform((val) => parseFloat(val)).pipe(z.number().min(0))),
  notes: z.string().max(1000).optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
})
