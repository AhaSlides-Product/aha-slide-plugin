// Runs once as the `setup` project; every e2e test reuses the storage state it writes.
// Delete this file and the `setup` project if the app under test needs no auth.
import { test as setup, expect } from '@playwright/test';
import { ENV } from '../config/env';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(ENV.user.email);
  await page.getByTestId('login-password').fill(ENV.user.password);
  await page.getByTestId('login-submit').click();

  // Assert the session really exists before saving it — writing an unauthenticated
  // storage state makes every downstream test fail in a way that looks unrelated.
  await expect(page.getByTestId('app-root')).toBeVisible({ timeout: 30_000 });

  mkdirSync(dirname(ENV.storageStatePath), { recursive: true });
  await page.context().storageState({ path: ENV.storageStatePath });
});
