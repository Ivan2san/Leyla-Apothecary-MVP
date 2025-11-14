import { defineConfig } from '@playwright/test'

const defaultBaseURL = 'http://127.0.0.1:3100'
const baseURL = process.env.PLAYWRIGHT_BASE_URL || defaultBaseURL
const shouldStartWebServer = process.env.PLAYWRIGHT_WEB_SERVER !== 'off' && !process.env.PLAYWRIGHT_BASE_URL
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  globalSetup: './tests/e2e/setup/global-setup.ts',
  workers: isCI ? undefined : 1,
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
  },
  reporter: [['list']],
  webServer: shouldStartWebServer
    ? {
        command: 'npm run dev:e2e',
        url: defaultBaseURL,
        reuseExistingServer: true,
        timeout: 120 * 1000,
      }
    : undefined,
})
