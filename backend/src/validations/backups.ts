import { z } from 'zod'

export const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

export const backupIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  backupId: z.string().uuid('Invalid backup ID'),
})

