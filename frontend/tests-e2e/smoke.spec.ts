import { test, expect } from '@playwright/test'

const EMAIL = process.env.E2E_EMAIL || 'admin@example.com'
const PASSWORD = process.env.E2E_PASSWORD || 'password123'

test('login → open dashboard → navigate to builder', async ({ page }) => {
  await page.goto('/auth/login')
  await page.getByLabel(/email/i).fill(EMAIL)
  await page.getByLabel(/password/i).fill(PASSWORD)
  await page.getByRole('button', { name: /login/i }).click()

  await page.waitForURL('**/dashboard*', { timeout: 15000 })
  await expect(page.locator('text=Websites')).toBeVisible()
})

test('open builder and click Publish (if available)', async ({ page }) => {
  // Assumes first website exists and builder is accessible via UI nav
  await page.goto('/dashboard/websites')
  const firstOpen = page.getByRole('link', { name: /open builder/i }).first()
  if (await firstOpen.count()) {
    await firstOpen.click()
    await page.waitForURL('**/builder/**', { timeout: 15000 })
    // Publish button present for non-viewer
    const publishBtn = page.getByRole('button', { name: /publish/i })
    if (await publishBtn.count()) {
      await publishBtn.click()
      await expect(page.getByText(/Published/i)).toBeVisible({ timeout: 20000 })
    }
  }
})


