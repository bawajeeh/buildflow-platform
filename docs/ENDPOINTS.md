Backend Endpoints (Selected)

Auth (public)
- POST /api/auth/register, /login, /forgot-password, /reset-password
- GET /api/auth/profile (auth), POST /api/auth/refresh (auth)

Websites/Pages/Elements (auth)
- GET/POST /api/websites, GET/PUT/DELETE /api/websites/:id
- GET /api/websites/:websiteId/pages?locale=xx, POST /api/websites/:websiteId/pages
- GET/PUT/DELETE /api/pages/:id, GET /api/elements/page/:pageId
- POST /api/elements, PUT /api/elements/:id, DELETE /api/elements/:id

Templates/Components (auth)
- GET /api/templates, GET /api/templates/:id
- POST /api/templates/export/website/:websiteId
- POST /api/templates/import { websiteId, templateId }
- GET /api/components/website/:websiteId, CRUD /api/components/:id

CMS & Media (auth)
- GET /api/websites/:websiteId/products|services|blog
- PATCH /api/media/:id, DELETE /api/media/:id

Publish & SEO
- POST /api/publish/website/:websiteId (auth)
- POST /api/revalidate (auth)
- GET /api/websites/:websiteId/sitemap.xml (public)
- GET /api/websites/:websiteId/robots.txt (public)

Versioning & Backups (auth)
- GET/POST /api/websites/:websiteId/snapshots
- POST /api/websites/:websiteId/snapshots/:snapshotId/restore
- GET /api/websites/:websiteId/backups, POST /api/websites/:websiteId/backups
- POST /api/websites/:websiteId/backups/:backupId/restore

Activity, Webhooks, Teams, Billing (auth unless noted)
- GET /api/websites/:websiteId/activity
- PUT/GET /api/websites/:websiteId/webhook
- GET /api/websites/:websiteId/collaborators, POST /api/websites/:websiteId/collaborators, DELETE /api/websites/:websiteId/collaborators/:userId
- GET /api/billing/plans (public), POST /api/billing/checkout (admin), POST /api/billing/webhook (public)

Middleware
- authMiddleware (JWT); requireRole, requireAdmin, requireWebsiteAccess
- rateLimiter; validation; errorHandler, notFound


