import { test, expect } from '@playwright/test'

const adminEmail = process.env.E2E_ADMIN_EMAIL
const adminPassword = process.env.E2E_ADMIN_PASSWORD

test.describe('Admin Console Smoke', () => {
  test.skip(
    !adminEmail || !adminPassword,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin smoke tests.'
  )

  test('admin can reach dashboard after login', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/email/i).fill(adminEmail!)
    await page.getByLabel(/password/i).fill(adminPassword!)
    await page.getByRole('main').getByRole('button', { name: /sign in/i }).click()

    await page.waitForURL(/(account|admin)/, { timeout: 10000 })

    await page.goto('/admin')
    await expect(page.getByText("Admin Console")).toBeVisible()
    await expect(page.getByRole('navigation')).toContainText('Products')
  })
})
