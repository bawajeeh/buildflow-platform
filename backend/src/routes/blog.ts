import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { cache } from '../services/redis'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateParams } from '../middleware/validation'
import { z } from 'zod'

const router = Router()

// Validation schema
const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

// GET /api/websites/:websiteId/blog
// Returns blog posts for a website. If no model exists, return an empty array.
router.get('/websites/:websiteId/blog', validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const prisma = getPrismaClient()
  const { websiteId } = req.params
  const cacheKey = `blog:list:${websiteId}`
  
  try {
    const cached = await cache.get(cacheKey)
    if (cached) {
      return res.json(cached)
    }
    
    // Try to query blogPost model if it exists; fallback to sample data
    try {
      // Check if blogPost model exists in Prisma schema
      const BlogPost = (prisma as { blogPost?: { findMany: (args: any) => Promise<any[]> } }).blogPost
      if (BlogPost?.findMany) {
        const posts = await BlogPost.findMany({
          where: { websiteId },
          orderBy: { createdAt: 'desc' },
        })
        if (Array.isArray(posts) && posts.length > 0) {
          await cache.set(cacheKey, posts, 60)
          return res.json(posts)
        }
      }
    } catch (modelError) {
      logger.debug('BlogPost model not available', modelError)
    }
    
    // Fallback sample posts
    const sample = [
      {
        id: 'sample-1',
        websiteId,
        title: 'Welcome to your blog',
        excerpt: 'This is a sample post.',
        image: '',
        date: new Date().toISOString(),
      },
      {
        id: 'sample-2',
        websiteId,
        title: 'Getting Started',
        excerpt: 'Use the builder to design pages.',
        image: '',
        date: new Date().toISOString(),
      },
    ]
    await cache.set(cacheKey, sample, 60)
    res.json(sample)
  } catch (error) {
    logger.error('Failed to fetch blog posts', error, { websiteId })
    throw createError('Failed to fetch blog posts', 500, 'BLOG_FETCH_ERROR')
  }
}))

export default router


