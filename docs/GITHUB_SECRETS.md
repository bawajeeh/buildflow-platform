# GitHub Secrets Setup Guide

This document explains the GitHub Actions secrets required for automated deployments.

## Required Secrets

### Vercel Deployment (Frontend)

Add these secrets in: **GitHub → Settings → Secrets and variables → Actions**

1. **`VERCEL_TOKEN`**
   - Get from: [Vercel → Settings → Tokens](https://vercel.com/account/tokens)
   - Create a new token with full access
   - Used for: Automatically deploying frontend to Vercel

2. **`VERCEL_ORG_ID`**
   - Get from: Vercel → Settings → General → Team ID
   - Or from your Vercel project URL: `https://vercel.com/[ORG_ID]/[PROJECT_NAME]`
   - Used for: Identifying which Vercel account/team to deploy to

3. **`VERCEL_PROJECT_ID`** (optional but recommended)
   - Get from: Your Vercel project → Settings → General → Project ID
   - Used for: Targeting a specific project

4. **`VITE_API_URL`** (optional - can use default `https://api.ain90.online`)
   - Value: `https://api.ain90.online`
   - Used for: Building frontend with correct API endpoint

### Render Deployment (Backend)

1. **`RENDER_API_KEY`**
   - Get from: [Render → Account Settings → API Keys](https://dashboard.render.com/account/api-keys)
   - Create a new API key
   - Used for: Triggering backend deployments on Render

2. **`RENDER_SERVICE_ID`**
   - Get from: Your Render service → Settings → Scroll to bottom → Service ID
   - Format: `srv-xxxxx` (e.g., `srv-d3pbetgdl3ps73b20vvg`)
   - Used for: Identifying which service to deploy

### E2E Testing (Optional)

1. **`PLAYWRIGHT_BASE_URL`**
   - Value: `https://app.ain90.online` (default if not set)
   - Used for: End-to-end testing URL

2. **`E2E_EMAIL`**
   - Value: Test user email for E2E tests
   - Used for: Automated testing login

3. **`E2E_PASSWORD`**
   - Value: Test user password for E2E tests
   - Used for: Automated testing login

## How to Add Secrets

1. Go to: `https://github.com/bawajeeh/buildflow-platform/settings/secrets/actions`
2. Click **"New repository secret"**
3. Enter the name (e.g., `VERCEL_TOKEN`)
4. Enter the value
5. Click **"Add secret"**

## Workflow Behavior

- **CI Workflow**: Runs on every push to `main`
  - Builds backend and frontend
  - Runs tests (continues even if tests fail)
  - No secrets required (optional to skip tests)

- **Deploy Frontend**: Runs on push to `main` (frontend changes only)
  - Only runs if `VERCEL_TOKEN` and `VERCEL_ORG_ID` are set
  - Skips gracefully if secrets are missing

- **Deploy Backend**: Runs on push to `main`
  - Only runs if `RENDER_API_KEY` and `RENDER_SERVICE_ID` are set
  - Skips gracefully if secrets are missing

- **E2E Tests**: Runs on push to `main`
  - Only runs if all E2E secrets are set
  - Skips gracefully if secrets are missing

## Current Status

- ✅ **Backend deployment**: Working (Render auto-deploys on push)
- ✅ **Frontend deployment**: Working manually (add Vercel secrets for automation)
- ⚠️ **E2E tests**: Optional (add secrets if you want automated testing)

## Notes

- All workflows now have `continue-on-error: true` so they won't block other workflows
- Workflows skip automatically if required secrets are missing
- Manual deployments via Render/Vercel dashboards continue to work regardless

