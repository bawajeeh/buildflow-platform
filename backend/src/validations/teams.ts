import { z } from 'zod'

export const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

export const collaboratorUserIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
  userId: z.string().uuid('Invalid user ID'),
})

export const addCollaboratorSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'EDITOR', 'VIEWER'], {
    errorMap: () => ({ message: 'Role must be OWNER, EDITOR, or VIEWER' }),
  }),
})

