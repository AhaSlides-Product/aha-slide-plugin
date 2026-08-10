// Canonical AhaSlides Playwright config.
// Placeholders: {{REPO_NAME}}, {{HAS_AUTH}} (drop the setup project + storageState when false)
import { defineConfig, devices } from '@playwright/test';
import { ENV } from './config/env';

export default defineConfig({
  testDir: './specs',
  // Fail the build if a spec was committed with test.only.
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
  ],

  use: {
    baseURL: ENV.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
  },

  projects: [
    // Runs once, mints the storage state every e2e test reuses.
    // Delete this project (and the dependency/storageState below) if the app needs no auth.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // API layer: no browser, so it is fast enough to run on every PR. Go broad here.
    {
      name: 'api',
      testDir: './specs/api',
      use: { baseURL: ENV.apiBaseURL },
    },

    // E2E layer: browser-driven. Keep this suite narrow — one golden path per feature
    // plus behaviour that genuinely cannot be proven below the UI.
    {
      name: 'e2e',
      testDir: './specs/e2e',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: ENV.storageStatePath,
      },
    },
  ],
});
