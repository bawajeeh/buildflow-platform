import { Router } from 'express'
import { getRedisClient } from '../services/redis'
import { requireWebsiteAccess } from '../middleware/auth'

const router = Router()

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
router.get('/websites/:websiteId/activity', requireWebsiteAccess(), async (req, res) => {
  try {
    const redis = getRedisClient()
    if (!redis) return res.json([])
    const key = `activity:${req.params.websiteId}`
    const items = await redis.lRange(key, 0, 49)
    const parsed = items.map((s) => { try { return JSON.parse(s) } catch { return null } }).filter(Boolean)
    res.json(parsed)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load activity' })
  }
})

export default router


