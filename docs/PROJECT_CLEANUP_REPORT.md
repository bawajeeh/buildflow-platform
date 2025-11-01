# Project Cleanup and Organization Report

## Findings
- Deployment targets: Render (API + Postgres), Vercel (App + Admin) confirmed.
- Frontend API config previously allowed fallback; now enforced `VITE_API_URL` in production.
- Kubernetes config had duplicate `FRONTEND_URL`; corrected to `https://app.ain90.online`.
- Missing public env examples for frontend/admin; added in `docs/ENV_EXAMPLES.md` (git may ignore .env files).
- Multiple deployment docs scattered; added `docs/DEPLOY_RENDER_VERCEL.md` as the primary quickstart.

## Recommended next actions
1) Environment files
   - Ensure `frontend` and `admin-dashboard` have runtime env set in Vercel: `VITE_API_URL=https://api.ain90.online`.
   - Backend (Render): set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.

2) Scripts unification (recommend)
   - Root Makefile or npm scripts to streamline common tasks:
     - build: `npm --workspace backend run build && npm --workspace frontend run build`
     - dev: `npm --workspace backend run dev` and `npm --workspace frontend run dev`
     - test: backend jest + frontend vitest/playwright.

3) CI/CD (recommend)
   - Ensure GitHub token with `workflow` scope for pushing workflow changes.
   - Keep minimal CI: lint, build, backend tests; optional e2e.

4) Docker/K8s (optional)
   - If sticking with Render/Vercel, mark k8s/ as optional and keep values synced (FRONTEND_URL, domains).

5) Cleanup candidates (safe to remove only if unused)
   - Verify `docker-compose.yml` vs `docker-compose.prod.yml` and `docker/nginx/` usage.
   - Confirm `admin-dashboard` API usage; set `VITE_API_URL` only if needed.

## Status
- Completed: API base enforcement, k8s fix, env and deploy docs.
- Pending (if approved): unify scripts/Makefile, prune unused docker bits, CI checks.
