import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Load environment variables from config/staging.env file if it exists
 */
function loadEnvFile() {
  const envPath = path.join(__dirname, 'config', 'staging.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
  }
}

// Load staging.env file
loadEnvFile();

/**
 * Playwright E2E Test Configuration for AhaSlides Slide Plugin SDK
 * 
 * This configuration is set up to test the SDK's zoid components and props
 * in both presenter and audience views.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.STAGING_URL || 'https://staging.ahaslide.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: undefined, // No local server needed - testing staging environment
});
