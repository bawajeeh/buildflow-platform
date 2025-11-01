import { z } from 'zod'

export const checkoutSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  successUrl: z.string().url('Invalid success URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional(),
})

