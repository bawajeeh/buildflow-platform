import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateParams } from '../middleware/validation'
import { z } from 'zod'

const router = Router()

const websiteIdParamsSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID'),
})

// GET sitemap.xml for a website - Public route (SEO)
router.get('/websites/:websiteId/sitemap.xml', validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const prisma = getPrismaClient()
  const { websiteId } = req.params
  
  const website = await prisma.website.findUnique({ where: { id: websiteId } })
  if (!website) {
    logger.warn('Sitemap requested for non-existent website', { websiteId })
    return res.status(404).send('Website not found')
  }

  const pages = await prisma.page.findMany({
    where: { websiteId },
    orderBy: { updatedAt: 'desc' },
    select: { slug: true, updatedAt: true, isPublished: true },
  })

  const baseUrl = website.domain
    ? `https://${website.domain}`
    : `https://${website.subdomain}.ain90.online`

  const urlset = pages
    .filter(p => p.isPublished !== false)
    .map(p => {
      const loc = `${baseUrl}/${p.slug.replace(/^\//, '')}`
      const lastmod = new Date(p.updatedAt).toISOString()
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`
  res.setHeader('Content-Type', 'application/xml')
  
  logger.debug('Sitemap generated', { websiteId, pageCount: pages.length })
  
  res.send(xml)
}))

// GET robots.txt for a website - Public route (SEO)
router.get('/websites/:websiteId/robots.txt', validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const prisma = getPrismaClient()
  const { websiteId } = req.params
  
  const website = await prisma.website.findUnique({ where: { id: websiteId } })
  if (!website) {
    logger.warn('Robots.txt requested for non-existent website', { websiteId })
    return res.status(404).send('Website not found')
  }

  const baseUrl = website.domain
    ? `https://${website.domain}`
    : `https://${website.subdomain}.ain90.online`

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/api/websites/${websiteId}/sitemap.xml\n`
  res.setHeader('Content-Type', 'text/plain')
  
  logger.debug('Robots.txt generated', { websiteId })
  
  res.send(robots)
}))

export default router


