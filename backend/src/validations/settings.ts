import { z } from 'zod'

export const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

export const userIdParamsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

export const updateWebsiteSettingsSchema = z.object({
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.string().max(255).optional(),
  ogImage: z.string().url().optional(),
  googleAnalyticsId: z.string().max(100).optional(),
  facebookPixelId: z.string().max(100).optional(),
  customTrackingCode: z.string().max(5000).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().max(100).optional(),
  borderRadius: z.number().int().min(0).max(50).optional(),
})

export const updateUserSettingsSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
})

export const updateSubscriptionSchema = z.object({
  plan: z.enum(['FREE', 'BASIC', 'PRO', 'BUSINESS', 'ENTERPRISE']).optional(),
  status: z.enum(['ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIAL']).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
})

