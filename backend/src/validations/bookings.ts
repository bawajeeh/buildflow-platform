import { z } from 'zod'

export const bookingIdParamsSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
})

export const createBookingSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  serviceId: z.string().uuid('Invalid service ID'),
  staffId: z.string().uuid('Invalid staff ID').optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  customerId: z.string().uuid('Invalid customer ID').optional(),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  totalPrice: z.number().nonnegative('Total price cannot be negative'),
  notes: z.string().optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
})

