import type { Page, Locator, Response } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Every Page Object extends this.
 *
 * Rules that apply to all subclasses (see CONVENTIONS.md):
 *  - Locators are exposed as `getXxx(): Locator` methods, never as fields.
 *  - Action methods call those getters; they never build a locator inline.
 *  - No `expect()` in an action method. The spec decides what to assert.
 *    The single exception is a `waitFor*` primitive, where waiting IS the definition.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Route this page object owns, relative to baseURL. Override in each subclass. */
  protected abstract readonly path: string;

  async goto(pathSuffix = ''): Promise<Response | null> {
    return this.page.goto(`${this.path}${pathSuffix}`);
  }

  /**
   * Wait until the surface is genuinely interactive.
   *
   * Override in a subclass to wait on a real element. `networkidle` alone is a flake
   * source on apps with polling or websockets.
   */
  async waitForReady(timeout = 15_000): Promise<void> {
    await expect(this.getRoot()).toBeVisible({ timeout });
  }

  /** The element whose presence means "this surface has mounted". Override it. */
  getRoot(): Locator {
    return this.page.locator('body');
  }

  getToast(): Locator {
    return this.page.getByRole('alert');
  }
}
