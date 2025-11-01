import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import { pushActivity } from './activity'
import { emitWebhook } from './webhooks'
import { logger } from '../utils/logger'

const router = Router()

// Very small HTML renderer from elements → HTML string (minimal)
function renderElement(el: any): string {
  const type = (el.type || '').toUpperCase()
  const props = el.props || {}
  const childrenHtml = Array.isArray(el.children) ? el.children.map(renderElement).join('') : ''
  switch (type) {
    case 'SECTION':
      return `<section>${childrenHtml}</section>`
    case 'CONTAINER':
      return `<div class="container">${childrenHtml}</div>`
    case 'ROW':
      return `<div class="row">${childrenHtml}</div>`
    case 'COLUMN':
      return `<div class="column">${childrenHtml}</div>`
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
      const width = props.width ? ` width="${Number(props.width)}"` : ''
      const height = props.height ? ` height="${Number(props.height)}"` : ''
      return src ? `<img src="${escapeAttr(src)}" alt="${escapeAttr(String(alt))}" loading="lazy" decoding="async"${width}${height}/>` : ''
    }
    case 'BUTTON': {
      const text = props.text || 'Button'
      const href = props.href || '#'
      return `<a href="${escapeAttr(href)}" class="btn">${escapeHtml(String(text))}</a>`
    }
    default:
      return childrenHtml ? `<div>${childrenHtml}</div>` : ''
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
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

// POST /api/publish/website/:websiteId
// Generates static HTML for all pages of a website and marks pages as published
router.post('/publish/website/:websiteId', async (req, res) => {
  try {
    const prisma = getPrismaClient()
    const websiteId = req.params.websiteId

    const website = await prisma.website.findUnique({ where: { id: websiteId } })
    if (!website) return res.status(404).json({ error: 'Website not found' })

    const settings = await prisma.websiteSettings.findUnique({ where: { websiteId } }).catch(() => null as any)
    const baseUrl = website.domain ? `https://${website.domain}` : `https://${website.subdomain}.ain90.online`

    const pages = await prisma.page.findMany({ where: { websiteId }, orderBy: { createdAt: 'asc' } })

    // Load elements for each page
    const pageWithElements = await Promise.all(
      pages.map(async (p) => {
        const elements = await prisma.element.findMany({ where: { pageId: p.id }, orderBy: { order: 'asc' } })
        // Parse stringified json fields if necessary
        const parsed = elements.map((el: any) => ({
          ...el,
          props: safeParse(el.props),
          styles: safeParse(el.styles),
          responsive: safeParse(el.responsive),
        }))
        return { ...p, elements: parsed }
      })
    )

    // Render HTML per page
    const output = pageWithElements.map((p) => ({
      id: p.id,
      slug: p.slug,
      isHome: (p as any).isHome === true,
      html: renderPageHtml(p, { baseUrl, websiteName: website.name, ogImage: settings?.ogImage }),
    }))

    // Mark pages as published
    await prisma.page.updateMany({ where: { websiteId }, data: { isPublished: true } })
    try { pushActivity(websiteId, 'website.published', { pages: output.length }) } catch {}
    try { await emitWebhook(websiteId, 'website.published', { pages: output.map(p => ({ id: p.id, slug: p.slug })) }) } catch {}

    res.json({ websiteId, pages: output })
  } catch (error) {
    logger.error('Publish failed', error, { websiteId: req.params.id })
    res.status(500).json({ error: 'Failed to publish website' })
  }
})

// POST /api/revalidate  (hook for revalidation)
router.post('/revalidate', async (req, res) => {
  try {
    // No-op placeholder: integrate with Vercel/Render cache purge if needed
    // Accepts { paths: string[] }
    res.json({ revalidated: true, paths: req.body?.paths || [] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to revalidate' })
  }
})

function safeParse(value: any) {
  if (!value) return {}
  if (typeof value === 'object') return value
  try { return JSON.parse(value) } catch { return {} }
}

export default router


