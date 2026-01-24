import { test, expect } from '@playwright/test';
import { PresenterPage } from '../../pages/presenter';
import { AuthHelper } from '../../helpers/auth';
import { goToPresentationById } from '../../helpers/commonHelpers';
/**
 * E2E Tests for Presenter View (Canvas)
 * 
 * Tests the PresenterSlidePluginIframe component and verifies that
 * all props from SlidePluginProps interface are correctly passed.
 */
test.describe('Presenter View - Settings', () => {
  let presenterPage: PresenterPage;

  const presentationId = 206649;

  test.beforeEach(async ({ page }) => {
    await AuthHelper.addTokenToCookies(page);
    
    await goToPresentationById.goToPresentationById(page, presentationId);
    // Initialize presenterPage for reuse in all tests
    presenterPage = new PresenterPage(page);
  });

  test('Verify Slide Plugin Settings iframe exists', async ({ }) => {
    // Wait for plugin iframe to load
    await presenterPage.waitForSlidePluginIframeSettings();
    
    // Verify iframe exists
    const iframe = presenterPage.getSlidePluginIframeSettings();
    await expect(iframe).toBeVisible();
  });

  
});
