import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Example Page Object showing the three rules. Replace with the real landing surface. */
export class HomePage extends BasePage {
  protected readonly path = '/';

  // --- getters: locators live here and nowhere else -------------------------
  getRoot(): Locator {
    return this.page.getByTestId('app-root');
  }

  getUserMenuBtn(): Locator {
    return this.page.getByTestId('header-user-menu');
  }

  /** Templated getter, for a testid containing a runtime id. */
  getRowById(id: string): Locator {
    return this.page.getByTestId(`row-${id}`);
  }

  // --- actions: call the getters, assert nothing ----------------------------
  async openUserMenu(): Promise<void> {
    await this.getUserMenuBtn().click();
  }
}
