import { Router } from 'express'
import { getRedisClient } from '../services/redis'
import { requireWebsiteAccess } from '../middleware/auth'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateParams } from '../middleware/validation'
import { z } from 'zod'

const router = Router()

const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

// Push an activity record (internal helper)
export async function pushActivity(websiteId: string, event: string, payload: Record<string, any> = {}) {
  try {
    const redis = getRedisClient()
    if (!redis) return
    const item = JSON.stringify({ t: Date.now(), event, ...payload })
    const key = `activity:${websiteId}`
    await redis.lPush(key, item)
    await redis.lTrim(key, 0, 199) // keep last 200
  } catch {}
}

// List recent activity for a website
router.get('/websites/:websiteId/activity', requireWebsiteAccess(), validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const { websiteId } = req.params
  
  const redis = getRedisClient()
  if (!redis) {
    logger.warn('Redis unavailable, returning empty activity list', { websiteId })
    return res.json({ success: true, data: [] })
  }
  
  const key = `activity:${websiteId}`
  const items = await redis.lRange(key, 0, 49)
  const parsed = items.map((s) => { 
    try { return JSON.parse(s) } 
    catch (error) { 
      logger.warn('Failed to parse activity item', error, { websiteId })
      return null 
    }
  }).filter(Boolean)
  
  logger.debug('Activity fetched', { websiteId, count: parsed.length })
  
  res.json({ success: true, data: parsed })
}))

export default router


