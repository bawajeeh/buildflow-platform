import { z } from 'zod'

export const componentIdParamsSchema = z.object({
  id: z.string().uuid('Invalid component ID'),
})

export const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

export const createComponentSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  name: z.string().min(1, 'Component name is required'),
  elements: z.array(z.any()).optional(),
  variants: z.record(z.array(z.any())).optional(),
})

export const updateComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required').optional(),
  elements: z.array(z.any()).optional(),
  variants: z.record(z.array(z.any())).optional(),
})

