import { Router } from 'express'
import { getRedisClient } from '../services/redis'
import { getPrismaClient } from '../services/database'
import { requireWebsiteAccess } from '../middleware/auth'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateParams, validateRequest } from '../middleware/validation'
import { websiteIdParamsSchema, collaboratorUserIdParamsSchema, addCollaboratorSchema } from '../validations/teams'

const router = Router()

// List collaborators
router.get('/websites/:websiteId/collaborators', requireWebsiteAccess(), validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const redis = getRedisClient()
  if (!redis) {
    logger.warn('Redis unavailable, returning empty collaborators list', { websiteId: req.params.websiteId })
    return res.json({ success: true, data: [] })
  }
  
  const key = `collab:${req.params.websiteId}`
  const items = await redis.lRange(key, 0, -1)
  const list = items.map((s) => { try { return JSON.parse(s) } catch { return null } }).filter(Boolean)
  
  logger.debug('Collaborators listed', { websiteId: req.params.websiteId, count: list.length })
  
  res.json({ success: true, data: list })
}))

// Add collaborator by email with role
router.post('/websites/:websiteId/collaborators', requireWebsiteAccess(), validateParams(websiteIdParamsSchema), validateRequest(addCollaboratorSchema), asyncHandler(async (req, res) => {
  const { websiteId } = req.params
  const { email, role } = req.body
  
  const prisma = getPrismaClient()
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, firstName: true, lastName: true } })
  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND')
  }
  
  const redis = getRedisClient()
  if (!redis) {
    throw createError('Redis unavailable', 503, 'REDIS_UNAVAILABLE')
  }
  
  const key = `collab:${websiteId}`
  const item = { userId: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, role }
  await redis.lPush(key, JSON.stringify(item))
  
  logger.info('Collaborator added', { websiteId, userId: user.id, email, role })
  
  res.status(201).json({ success: true, data: item })
}))

// Remove collaborator by userId
router.delete('/websites/:websiteId/collaborators/:userId', requireWebsiteAccess(), validateParams(collaboratorUserIdParamsSchema), asyncHandler(async (req, res) => {
  const { websiteId, userId } = req.params
  
  const redis = getRedisClient()
  if (!redis) {
    throw createError('Redis unavailable', 503, 'REDIS_UNAVAILABLE')
  }
  
  const key = `collab:${websiteId}`
  const items = await redis.lRange(key, 0, -1)
  for (const s of items) {
    try {
      const obj = JSON.parse(s)
      if (obj.userId === userId) {
        await redis.lRem(key, 1, s)
        logger.info('Collaborator removed', { websiteId, userId })
        return res.json({ success: true })
      }
    } catch (error) {
      logger.warn('Failed to parse collaborator item', error, { websiteId, userId })
    }
  }
  
  logger.debug('Collaborator not found to remove', { websiteId, userId })
  res.json({ success: true })
}))

export default router


