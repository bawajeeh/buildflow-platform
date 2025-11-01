import { z } from 'zod'

export const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  period: z.enum(['7d', '30d', '90d']).optional(),
})

export const createAnalyticsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  date: z.string().datetime().or(z.date()),
  visitors: z.number().int().min(0).optional(),
  pageViews: z.number().int().min(0).optional(),
  sessions: z.number().int().min(0).optional(),
  bounceRate: z.number().min(0).max(100).optional(),
  avgSessionDuration: z.number().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
  revenue: z.number().min(0).optional(),
})

