/**
 * The composed `test` object. Specs import from here and from `@pages` — nothing else.
 *
 * Adding a Page Object fixture here is what keeps specs free of `new SomePage(page)`
 * boilerplate and gives one place to change construction.
 */
import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { ENV } from '@config/env';
import { HomePage } from '@pages';

type Fixtures = {
  /** Page Objects, one fixture each. */
  homePage: HomePage;
  /** Authenticated API context, for seeding preconditions without driving the UI. */
  api: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  api: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: ENV.apiBaseURL,
      extraHTTPHeaders: { Accept: 'application/json' },
      // Reuses the session minted by the `setup` project.
      storageState: ENV.storageStatePath,
    });
    await use(context);
    await context.dispose();
  },
});

export { expect };
