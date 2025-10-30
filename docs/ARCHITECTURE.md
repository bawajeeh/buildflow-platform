BuildFlow Architecture (High-Level)

Backend (Node/Express + Prisma + Redis + Socket.IO)
- Entry: src/index.ts
  - Middleware: helmet, cors, compression, morgan, JSON, rateLimiter
  - Auth: authMiddleware attaches req.user (id, email, role)
  - Services: database (Prisma), redis, socket (rooms, collaboration)
  - Swagger docs
  - Routes (auth required unless noted):
    - /api/auth (public for register/login)
    - /api/users, /api/websites, /api/pages, /api/elements
    - /api/templates, /api/products, /api/orders, /api/services
    - /api/bookings, /api/customers, /api/analytics, /api/media, /api/settings
    - /api/components
    - /api/publish, /api/revalidate (publish), /api/versioning (snapshots)
    - /api (public): /websites/:websiteId/sitemap.xml, /robots.txt
    - /api/activity, /api/webhooks, /api/backups, /api/teams, /api/billing

- Persistence:
  - PostgreSQL/SQLite via Prisma models: Website, Page, Element, Template, Product, Service, etc.
  - Template used for snapshots/backups (category + pages JSON)
  - Phase 3 fields serialized under element.props.__p3 (transparent persistence)

- Redis:
  - Caching (templates list, CMS lists), activity logs, lightweight teams store

- Realtime (Socket.IO):
  - Rooms per website; events for element updates, cursor-move, locks
  - Lock map to prevent concurrent edits

Frontend (React + Vite + Zustand + Tailwind)
- Routing: src/App.tsx
  - Public: Landing, Pricing, Features, About, Contact
  - Auth: Login/Register/Forgot/Reset
  - Dashboard: websites, analytics, products, orders, services, bookings, customers, templates, media, settings
  - Builder: /builder/:websiteId with canvas, sidebar, properties, toolbar

- State (Zustand): src/store/index.ts
  - Auth store (user/token)
  - Website store (websites, currentWebsite)
  - Builder store (pages, elements, history, themeTokens, components, cmsData)
  - Phase 3 hydration/serialization under props.__p3
  - Additional stores: modal, comments, plugins

- Builder Core:
  - ElementRenderer merges responsive styles, resolves tokens/data bindings, conditions, animations, interactions, custom CSS/JS
  - BuilderCanvas supports freeform positioning, guides, selection, group ops, remote cursors
  - BuilderProperties: breakpoints, presets, tokens, Phase 3 editors
  - Toolbar: Save, Preview, Publish, Snapshot, Versions, A11y, Comments
  - Snapshots/Versions modal; Accessibility report; Global modal

- Services:
  - api config (endpoints), realTimeService (socket), dataBinding utils

Publishing & SEO
- Backend generates static HTML per page (title, meta, canonical, OG, JSON-LD)
- Sitemap and robots per-website
- Images lazy-loaded in published HTML

Phase 4/5 Integrations
- Versioning via templates, i18n via slug prefixes, RBAC gating, performance cache
- Comments modal and plugin registry (PLUGIN:xyz)
- Activity logs, webhooks on publish, backups, simple teams, billing scaffold


