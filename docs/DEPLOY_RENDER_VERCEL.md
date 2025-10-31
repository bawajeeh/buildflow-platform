# Deploying to Render (API + DB) and Vercel (App + Admin)

## Backend (Render)
- Create PostgreSQL instance → copy DATABASE_URL.
- Create Web Service from backend/:
  - Build: npm ci && npm run build && npx prisma generate
  - Start: node dist/index.js
  - Env vars:
    - NODE_ENV=production
    - PORT=5001
    - DATABASE_URL=<Render Postgres URL>
    - JWT_SECRET=<strong random>
    - FRONTEND_URL=https://app.ain90.online
    - REDIS_URL=<optional>
- After first deploy, run migrations:
  - Shell → npx prisma migrate deploy
- Custom domain:
  - Add api.ain90.online in Render → follow CNAME steps → TLS auto.

## Frontend App (Vercel)
- Import project from frontend/ (Vite preset).
- Env var (Production):
  - VITE_API_URL=https://api.ain90.online
- Add domain app.ain90.online in Vercel and complete DNS.

## Admin Dashboard (Vercel)
- Import project from admin-dashboard/.
- If calling API, set:
  - VITE_API_URL=https://api.ain90.online
- Add domain admin.ain90.online and complete DNS.

## DNS Records
- Vercel provides CNAMEs for app.ain90.online and admin.ain90.online.
- Render provides CNAME for api.ain90.online.
- Optional apex: point ain90.online to Vercel (A 76.76.21.21) or redirect to app.

## Smoke Tests
- https://api.ain90.online/health → status OK.
- https://app.ain90.online loads and calls API.
- https://admin.ain90.online loads.

## Notes
- Docker and Kubernetes files were removed to simplify the Render/Vercel deployment path.
