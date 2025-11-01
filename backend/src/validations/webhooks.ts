import { z } from 'zod'

export const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

export const setWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
})

