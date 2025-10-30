import { Router } from 'express'
import { getRedisClient } from '../services/redis'
import { requireWebsiteAccess } from '../middleware/auth'

const router = Router()

// Set webhook URL for website
router.put('/websites/:websiteId/webhook', requireWebsiteAccess(), async (req, res) => {
  try {
    const { url } = req.body || {}
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' })
    const redis = getRedisClient()
    if (!redis) return res.status(503).json({ error: 'Redis unavailable' })
    await redis.set(`webhook:${req.params.websiteId}`, url)
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to set webhook' })
  }
})

// Get webhook URL
router.get('/websites/:websiteId/webhook', requireWebsiteAccess(), async (req, res) => {
  try {
    const redis = getRedisClient()
    if (!redis) return res.json({ url: null })
    const url = await redis.get(`webhook:${req.params.websiteId}`)
    res.json({ url })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to get webhook' })
  }
})

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


