import { Router } from 'express'
import { getRedisClient } from '../services/redis'
import { requireWebsiteAccess } from '../middleware/auth'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateParams, validateRequest } from '../middleware/validation'
import { websiteIdParamsSchema, setWebhookSchema } from '../validations/webhooks'

const router = Router()

// Set webhook URL for website
router.put('/websites/:websiteId/webhook', requireWebsiteAccess(), validateParams(websiteIdParamsSchema), validateRequest(setWebhookSchema), asyncHandler(async (req, res) => {
  const { websiteId } = req.params
  const { url } = req.body
  
  const redis = getRedisClient()
  if (!redis) {
    throw createError('Redis unavailable', 503, 'REDIS_UNAVAILABLE')
  }
  
  await redis.set(`webhook:${websiteId}`, url)
  
  logger.info('Webhook URL set', { websiteId, url })
  
  res.json({ success: true })
}))

// Get webhook URL
router.get('/websites/:websiteId/webhook', requireWebsiteAccess(), validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const { websiteId } = req.params
  
  const redis = getRedisClient()
  if (!redis) {
    logger.warn('Redis unavailable, returning null webhook URL', { websiteId })
    return res.json({ success: true, data: { url: null } })
  }
  
  const url = await redis.get(`webhook:${websiteId}`)
  
  logger.debug('Webhook URL fetched', { websiteId, hasUrl: !!url })
  
  res.json({ success: true, data: { url } })
}))

export async function emitWebhook(websiteId: string, event: string, payload: any) {
  try {
    const redis = getRedisClient()
    if (!redis) return
    const url = await redis.get(`webhook:${websiteId}`)
    if (!url) return
    // Fire-and-forget
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, websiteId, payload, ts: Date.now() }),
    }).catch(() => {})
  } catch {}
}

export default router


