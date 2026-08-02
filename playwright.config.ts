import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests run the real production build in a headless browser and
 * exercise the actual on-device pipelines (Canvas, pdf-lib, ffmpeg.wasm) plus
 * the Pro paywall. Run `npx playwright install chromium` once beforehand.
 *
 * PW_CHROMIUM_PATH lets CI / sandboxes point at a pre-installed browser.
 */
const executablePath = process.env.PW_CHROMIUM_PATH || undefined
// Extra Chromium flags (comma-separated), e.g. PW_CHROMIUM_ARGS=--no-sandbox
// for running headless in a root container / CI sandbox.
const chromiumArgs = process.env.PW_CHROMIUM_ARGS?.split(',').filter(Boolean) || []
const PORT = Number(process.env.PW_PORT || 4330)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'line' : 'list',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    launchOptions: { ...(executablePath ? { executablePath } : {}), args: chromiumArgs },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
})
