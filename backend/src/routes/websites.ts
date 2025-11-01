import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { validateRequest, validateParams } from '../middleware/validation'
import { createWebsiteSchema, updateWebsiteSchema, updateThemeSchema, subdomainParamsSchema, websiteIdParamsSchema } from '../validations/websites'
import { logger } from '../utils/logger'
import { createError, asyncHandler } from '../utils/errorHandler'
import { z } from 'zod'

const router = Router()

// Get website by subdomain (public route for serving published websites)
router.get('/subdomain/:subdomain', validateParams(subdomainParamsSchema), async (req, res, next) => {
  try {
    const { subdomain } = req.params
    
    const website = await getPrismaClient().website.findUnique({
      where: { subdomain },
      include: {
        pages: {
          where: { isPublished: true },
          include: {
            elements: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        settings: true,
      },
    })
    
    if (!website) {
      return res.status(404).json({ 
        success: false,
        error: 'Website not found',
        code: 'WEBSITE_NOT_FOUND'
      })
    }
    
    if (website.status !== 'PUBLISHED') {
      return res.status(404).json({ 
        success: false,
        error: 'Website not published',
        code: 'WEBSITE_NOT_PUBLISHED'
      })
    }
    
    // Parse JSON fields for elements safely
    const parsedPages = website.pages.map(page => ({
      ...page,
      elements: page.elements.map(el => {
        try {
          return {
            ...el,
            props: typeof el.props === 'string' ? JSON.parse(el.props) : el.props,
            styles: typeof el.styles === 'string' ? JSON.parse(el.styles) : el.styles,
            responsive: typeof el.responsive === 'string' ? JSON.parse(el.responsive) : el.responsive,
          }
        } catch (parseError) {
          logger.warn('Failed to parse element JSON', { elementId: el.id, parseError })
          return {
            ...el,
            props: {},
            styles: {},
            responsive: {},
          }
        }
      }),
    }))
    
    res.json({
      success: true,
      data: {
        ...website,
        pages: parsedPages,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch website by subdomain', error, {
      subdomain: req.params.subdomain,
    })
    next(error)
  }
})

// Get all websites
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }
  
  const websites = await getPrismaClient().website.findMany({
    where: { userId }, // Only return user's websites
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      pages: true,
      _count: {
        select: {
          pages: true,
          products: true,
          orders: true,
        },
      },
    },
  })
  
  res.json({
    success: true,
    data: websites,
  })
}))

// Get website by ID
router.get('/:id', validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const websiteId = req.params.id
  const userId = req.user?.id
  
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }
  
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      pages: {
        include: {
          elements: {
            orderBy: { order: 'asc' },
          },
        },
      },
      settings: true,
      products: true,
      services: true,
    },
  })
  
  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }
  
  // Verify user owns the website
  if (website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }
  
  // Safe JSON parsing for elements
  const parseJsonField = (field: string | unknown) => {
    try {
      return typeof field === 'string' ? JSON.parse(field) : field
    } catch {
      return {}
    }
  }
  
  const parsedPages = website.pages.map(page => ({
    ...page,
    elements: page.elements.map(el => ({
      ...el,
      props: parseJsonField(el.props),
      styles: parseJsonField(el.styles),
      responsive: parseJsonField(el.responsive),
    })),
  }))
  
  res.json({
    success: true,
    data: {
      ...website,
      pages: parsedPages,
    },
  })
}))

// Create new website
router.post('/', validateRequest(createWebsiteSchema), async (req, res, next) => {
  try {
    const { name, subdomain } = req.body
    
    // Get userId from authenticated user
    const userId = req.user?.id
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED')
    }
    
    // Check if subdomain is already taken
    const existing = await getPrismaClient().website.findUnique({
      where: { subdomain: subdomain.trim().toLowerCase() }
    })
    
    if (existing) {
      throw createError('Subdomain already taken', 409, 'SUBDOMAIN_TAKEN', { subdomain })
    }
    
    const prisma = getPrismaClient()
    
    // Create website
    const website = await prisma.website.create({
      data: {
        userId,
        name: name.trim(),
        subdomain: subdomain.trim().toLowerCase(),
        status: 'DRAFT',
      },
      include: {
        pages: true,
        settings: true,
      },
    })
    
    // Automatically create a default homepage
    try {
      await prisma.page.create({
        data: {
          websiteId: website.id,
          name: 'Home',
          slug: 'home',
          isHome: true,
          isPublished: false,
        },
      })
    } catch (pageError) {
      logger.warn('Failed to create default homepage', pageError, { websiteId: website.id })
      // Continue - homepage creation is not critical
    }
    
    // Create default website settings
    try {
      await prisma.websiteSettings.create({
        data: {
          websiteId: website.id,
          seoTitle: `${website.name} - Built with BuildFlow`,
          seoDescription: `A website created with BuildFlow`,
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
        },
      })
    } catch (settingsError) {
      logger.warn('Failed to create default settings', settingsError, { websiteId: website.id })
      // Continue - settings creation is not critical
    }
    
    // Fetch website with all relations
    const websiteWithPages = await prisma.website.findUnique({
      where: { id: website.id },
      include: {
        pages: true,
        settings: true,
      },
    })
    
    logger.info('Website created successfully', { websiteId: website.id, subdomain })
    
    res.status(201).json({
      success: true,
      data: websiteWithPages || website,
    })
  } catch (error) {
    logger.error('Create website error', error, { userId: req.user?.id })
    next(error)
  }
})

// Update website
router.put('/:id', async (req, res) => {
  try {
    const { name, subdomain, status, domain } = req.body
    
    const website = await getPrismaClient().website.update({
      where: { id: req.params.id },
      data: {
        name,
        subdomain,
        status,
        domain,
      },
    })
    
    res.json(website)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update website' })
  }
})

// Delete website
router.delete('/:id', async (req, res) => {
  try {
    await getPrismaClient().website.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: 'Website deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete website' })
  }
})

// Theme tokens per-website
router.get('/:id/theme', validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const websiteId = req.params.id
  const userId = req.user?.id
  
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }
  
  // Verify website exists and user has access
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
  })
  
  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }
  
  if (website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }
  
  const prisma = getPrismaClient()
  const settings = await prisma.websiteSettings.findUnique({ where: { websiteId } })
  let tokens: Record<string, unknown> | null = null
  
  // Reuse customTrackingCode to store theme JSON if available, otherwise map from existing fields
  if (settings?.customTrackingCode) {
    try {
      tokens = JSON.parse(settings.customTrackingCode) as Record<string, unknown>
    } catch {
      tokens = null
    }
  }
  
  if (!tokens && settings) {
    tokens = {
      colors: {
        primary: settings.primaryColor || '#3b82f6',
        secondary: settings.secondaryColor || '#64748b',
        text: '#111827',
        background: '#ffffff',
      },
      typography: { fontFamily: settings.fontFamily || 'Inter', baseSize: 16 },
      spacing: { base: 8, radius: settings.borderRadius || 8 },
    }
  }
  
  if (!tokens) {
    tokens = {
      colors: { primary: '#3b82f6', secondary: '#8b5cf6', text: '#111827', background: '#ffffff' },
      typography: { fontFamily: 'Inter', baseSize: 16 },
      spacing: { base: 8, radius: 8 },
    }
  }
  
  res.json({
    success: true,
    data: tokens,
  })
}))

router.put('/:id/theme', validateParams(websiteIdParamsSchema), validateRequest(updateThemeSchema.partial().extend({
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    text: z.string().optional(),
    background: z.string().optional(),
  }).optional(),
  typography: z.object({
    fontFamily: z.string().optional(),
    baseSize: z.number().optional(),
  }).optional(),
  spacing: z.object({
    base: z.number().optional(),
    radius: z.number().optional(),
  }).optional(),
})), asyncHandler(async (req, res) => {
  const websiteId = req.params.id
  const userId = req.user?.id
  
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }
  
  // Verify website exists and user has access
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
  })
  
  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }
  
  if (website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }
  
  const prisma = getPrismaClient()
  const payload = req.body || {}
  const json = JSON.stringify(payload)
  
  // upsert settings row
  const settings = await prisma.websiteSettings.upsert({
    where: { websiteId },
    update: { customTrackingCode: json },
    create: {
      websiteId,
      customTrackingCode: json,
      primaryColor: (payload as any)?.colors?.primary || '#3b82f6',
      secondaryColor: (payload as any)?.colors?.secondary || '#64748b',
      fontFamily: (payload as any)?.typography?.fontFamily || 'Inter',
      borderRadius: (payload as any)?.spacing?.radius || 8,
    },
  })
  
  logger.info('Theme saved', { websiteId, settingsId: settings.id })
  
  res.json({
    success: true,
    data: { settingsId: settings.id },
  })
}))

// Get services for a website
router.get('/:id/services', validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const websiteId = req.params.id
  const userId = req.user?.id
  
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }
  
  // Verify website exists and user has access
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
  })
  
  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }
  
  if (website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }
  
  const services = await getPrismaClient().service.findMany({
    where: { websiteId },
    orderBy: { createdAt: 'desc' },
  })
  
  res.json({
    success: true,
    data: services,
  })
}))

// Get products for a website
router.get('/:id/products', validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const websiteId = req.params.id
  const userId = req.user?.id
  
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }
  
  // Verify website exists and user has access
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
  })
  
  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }
  
  if (website.userId !== userId) {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }
  
  const products = await getPrismaClient().product.findMany({
    where: { websiteId },
    include: {
      images: true,
      variants: true,
      categories: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  
  res.json({
    success: true,
    data: products,
  })
}))

// Publish website (alternative endpoint - forwards to publish service)
router.post('/:id/publish', async (req, res) => {
  try {
    // Import publish service dynamically to avoid circular dependencies
    const { default: publishRouter } = await import('./publish')
    
    // Forward to publish service
    const websiteId = req.params.id
    req.params.websiteId = websiteId
    
    // Create a mock request for the publish router
    const publishHandler = publishRouter.stack.find((layer: any) => 
      layer.route?.path === '/publish/website/:websiteId' && layer.route?.methods.post
    )
    
    if (publishHandler) {
      return publishHandler.route.stack[0].handle(req, res)
    }
    
    // Fallback: call publish service directly
    const prisma = getPrismaClient()
    const website = await prisma.website.findUnique({ where: { id: websiteId } })
    if (!website) return res.status(404).json({ error: 'Website not found' })

    const settings = await prisma.websiteSettings.findUnique({ where: { websiteId } }).catch(() => null as any)
    const baseUrl = website.domain ? `https://${website.domain}` : `https://${website.subdomain}.ain90.online`

    const pages = await prisma.page.findMany({ where: { websiteId }, orderBy: { createdAt: 'asc' } })

    // Load elements for each page
    const pageWithElements = await Promise.all(
      pages.map(async (p) => {
        const elements = await prisma.element.findMany({ where: { pageId: p.id }, orderBy: { order: 'asc' } })
        const parsed = elements.map((el: any) => ({
          ...el,
          props: safeParse(el.props),
          styles: safeParse(el.styles),
          responsive: safeParse(el.responsive),
        }))
        return { ...p, elements: parsed }
      })
    )

    // Simple HTML renderer
    function renderElement(el: any): string {
      const type = (el.type || '').toUpperCase()
      const props = el.props || {}
      const childrenHtml = Array.isArray(el.children) ? el.children.map(renderElement).join('') : ''
      switch (type) {
        case 'SECTION': return `<section>${childrenHtml}</section>`
        case 'CONTAINER': return `<div class="container">${childrenHtml}</div>`
        case 'ROW': return `<div class="row">${childrenHtml}</div>`
        case 'COLUMN': return `<div class="column">${childrenHtml}</div>`
        case 'HEADING': {
          const level = Math.min(Math.max(Number(props.level) || 1, 1), 6)
          const text = props.text || 'Heading'
          return `<h${level}>${escapeHtml(String(text))}</h${level}>`
        }
        case 'TEXT': {
          const text = props.text || ''
          return `<p>${escapeHtml(String(text))}</p>`
        }
        case 'IMAGE': {
          const src = props.src || ''
          const alt = props.alt || ''
          return src ? `<img src="${escapeAttr(src)}" alt="${escapeAttr(String(alt))}" loading="lazy"/>` : ''
        }
        case 'BUTTON': {
          const text = props.text || 'Button'
          const href = props.href || '#'
          return `<a href="${escapeAttr(href)}" class="btn">${escapeHtml(String(text))}</a>`
        }
        default: return childrenHtml ? `<div>${childrenHtml}</div>` : ''
      }
    }

    function escapeHtml(s: string): string {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    function escapeAttr(s: string): string {
      return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    }

    function safeParse(value: any) {
      if (!value) return {}
      if (typeof value === 'object') return value
      try { return JSON.parse(value) } catch { return {} }
    }

    function renderPageHtml(page: any, opts: { baseUrl: string; websiteName: string; ogImage?: string }): string {
      const title = page?.seo?.title || page?.name || opts.websiteName || 'Page'
      const description = page?.seo?.description || `Page on ${opts.websiteName}`
      const url = `${opts.baseUrl}/${String(page.slug || '').replace(/^\//, '')}`
      const ogImage = opts.ogImage || ''
      const elements = Array.isArray(page.elements) ? page.elements : []
      const bodyHtml = elements.map(renderElement).join('')
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url,
      }
      return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>${escapeHtml(String(title))}</title>
    <link rel="canonical" href="${escapeAttr(url)}"/>
    <meta name="description" content="${escapeAttr(String(description))}"/>
    <meta property="og:title" content="${escapeAttr(String(title))}"/>
    <meta property="og:description" content="${escapeAttr(String(description))}"/>
    <meta property="og:type" content="website"/>
    <meta property="og:url" content="${escapeAttr(url)}"/>
    ${ogImage ? `<meta property="og:image" content="${escapeAttr(ogImage)}"/>` : ''}
    <script type="application/ld+json">${escapeHtml(JSON.stringify(jsonLd))}</script>
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`
    }

    // Render HTML per page
    const output = pageWithElements.map((p) => ({
      id: p.id,
      slug: p.slug,
      isHome: (p as any).isHome === true,
      html: renderPageHtml(p, { baseUrl, websiteName: website.name, ogImage: settings?.ogImage }),
    }))

    // Mark pages as published
    await prisma.page.updateMany({ where: { websiteId }, data: { isPublished: true } })
    await prisma.website.update({ where: { id: websiteId }, data: { status: 'PUBLISHED' } })
    
    // Log activity
    try {
      const { pushActivity } = await import('./activity')
      pushActivity(websiteId, 'website.published', { pages: output.length })
    } catch {}
    
    try {
      const { emitWebhook } = await import('./webhooks')
      await emitWebhook(websiteId, 'website.published', { pages: output.map(p => ({ id: p.id, slug: p.slug })) })
    } catch {}

    res.json({ websiteId, pages: output })
  } catch (error) {
    logger.error('Publish failed', error, { websiteId: req.params.id })
    res.status(500).json({ error: 'Failed to publish website' })
  }
})

export default router
