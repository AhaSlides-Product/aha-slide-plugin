import { Page, Locator, Frame } from '@playwright/test';

/**
 * Page Object Model for Presenter Page
 * 
 * Defines locators and methods for interacting with the presenter page
 */
export class PresenterPage {
  constructor(private page: Page) {}

  getSlidePluginIframeSettings(): Locator {
    return this.page.getByTestId('slide-plugin-iframe-settings');
  }

  getSlidePluginIframeCanvas(): Locator {
    return this.page.getByTestId('slide-plugin-iframe-canvas');
  }

  async waitForSlidePluginIframeCanvas(): Promise<void> {
    const iframeLocator = this.getSlidePluginIframeCanvas();
    await iframeLocator.waitFor({ state: 'visible', timeout: 25000 });
  }

  async waitForSlidePluginIframeSettings(): Promise<void> {
    const iframeLocator = this.getSlidePluginIframeSettings();
    await iframeLocator.waitFor({ state: 'visible', timeout: 25000 });
  }



}
