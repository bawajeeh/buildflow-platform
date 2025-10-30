import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { cache } from '../services/redis'

const router = Router()

// GET /api/websites/:websiteId/blog
// Returns blog posts for a website. If no model exists, return an empty array.
router.get('/websites/:websiteId/blog', async (req, res) => {
  try {
    const prisma = getPrismaClient()
    const cacheKey = `blog:list:${req.params.websiteId}`
    const cached = await cache.get(cacheKey)
    if (cached) return res.json(cached)
    // Try to query a hypothetical blogPost model; fallback to sample data
    try {
      // @ts-ignore - model may not exist yet
      const posts = await (prisma as any).blogPost?.findMany?.({ where: { websiteId: req.params.websiteId }, orderBy: { createdAt: 'desc' } })
      if (Array.isArray(posts)) {
        await cache.set(cacheKey, posts, 60)
        return res.json(posts)
      }
    } catch {}
    // Fallback sample posts
    const sample = [
      { id: 'sample-1', websiteId: req.params.websiteId, title: 'Welcome to your blog', excerpt: 'This is a sample post.', image: '', date: new Date().toISOString() },
      { id: 'sample-2', websiteId: req.params.websiteId, title: 'Getting Started', excerpt: 'Use the builder to design pages.', image: '', date: new Date().toISOString() },
    ]
    await cache.set(cacheKey, sample, 60)
    res.json(sample)
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

export default router


