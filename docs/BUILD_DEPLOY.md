Build, Dev, Deploy & Env

Frontend (Vite + React)
- Dev: npm run dev
- Build: npm run build → dist/
- Config: src/config/api.ts uses VITE_API_URL (default Render backend)
- Tests: unit test setup present; Playwright e2e scaffold (playwright.config.ts, tests-e2e/)

Backend (Express + Prisma)
- Dev: npm run dev
- Build: npm run build → dist/
- Env: DATABASE_URL, JWT_SECRET, REDIS_URL (optional), CORS origins set in src/index.ts
- Prisma: schema.prisma; migrations under prisma/migrations; seed.cjs
- Tests: Jest config and tests under src/__tests__/

Sockets
- Initialized in src/index.ts with CORS; authentication via JWT in handshake

Docker/K8s
- docker/ includes Dockerfiles for admin/frontend/backend and docker-compose
- k8s/ contains config, database, deployments manifests

CI/CD
- .github/workflows/ci.yml builds and tests backend/frontend
- .github/workflows/e2e.yml runs Playwright e2e (requires secrets: PLAYWRIGHT_BASE_URL, E2E_EMAIL, E2E_PASSWORD)

Publishing Flow
- Frontend triggers POST /api/publish/website/:id
- Backend generates static HTML with SEO tags; marks pages published; emits webhook; logs activity
- Revalidate endpoint available for cache hooks


