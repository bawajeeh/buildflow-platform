import { Router } from 'express'
import { getRedisClient } from '../services/redis'
import { getPrismaClient } from '../services/database'
import { requireWebsiteAccess } from '../middleware/auth'

const router = Router()

// List collaborators
router.get('/websites/:websiteId/collaborators', requireWebsiteAccess(), async (req, res) => {
  const redis = getRedisClient()
  if (!redis) return res.json([])
  const key = `collab:${req.params.websiteId}`
  const items = await redis.lRange(key, 0, -1)
  const list = items.map((s) => { try { return JSON.parse(s) } catch { return null } }).filter(Boolean)
  res.json(list)
})

// Add collaborator by email with role
router.post('/websites/:websiteId/collaborators', requireWebsiteAccess(), async (req, res) => {
  try {
    const { email, role } = req.body || {}
    if (!email || !role) return res.status(400).json({ error: 'email and role are required' })
    const prisma = getPrismaClient()
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, firstName: true, lastName: true } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    const redis = getRedisClient()
    if (!redis) return res.status(503).json({ error: 'Redis unavailable' })
    const key = `collab:${req.params.websiteId}`
    const item = { userId: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, role }
    await redis.lPush(key, JSON.stringify(item))
    res.status(201).json(item)
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to add collaborator' })
  }
})

// Remove collaborator by userId
router.delete('/websites/:websiteId/collaborators/:userId', requireWebsiteAccess(), async (req, res) => {
  const redis = getRedisClient()
  if (!redis) return res.status(503).json({ error: 'Redis unavailable' })
  const key = `collab:${req.params.websiteId}`
  const items = await redis.lRange(key, 0, -1)
  for (const s of items) {
    try {
      const obj = JSON.parse(s)
      if (obj.userId === req.params.userId) {
        await redis.lRem(key, 1, s)
        return res.json({ success: true })
      }
    } catch {}
  }
  res.json({ success: true })
})

export default router


