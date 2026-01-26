# E2E Testing Guide for AhaSlides Slide Plugin SDK

This directory contains End-to-End (E2E) tests using **Playwright** to verify that the SDK's zoid components (Presenter and Audience plugin iframes) work correctly in the AhaSlides staging environment.

## 📁 Directory Structure

```
tests/
├── config/
│   └── staging.env           # Staging environment config (PRESENTATION_ID, URLs, etc.)
├── e2e/
│   ├── presenter/
│   │   ├── presenter-canvas-iframe.spec.ts   # Canvas iframe visibility tests
│   │   └── presenter-settings-iframe.spec.ts # Settings iframe visibility tests
│   └── audience/
│       └── audience-view.spec.ts             # Audience view tests (placeholder)
├── fixtures/                 # Test fixtures (e.g. assets)
├── helpers/
│   ├── auth.ts               # Authentication (add ahaToken cookie)
│   └── commonHelpers.ts      # Navigation (goToPresentationById)
├── pages/
│   └── presenter.ts          # Page Object Model for presenter page
├── playwright.config.ts      # Playwright configuration
├── package.json
├── tsconfig.json
├── QA_GUIDE.md               # QA strategy & what to test
├── QUICK_START.md            # Minimal setup & run instructions
└── README.md                 # This file
```

## 🚀 Setup

### 1. Install Dependencies

From **project root**:

```bash
npm install
cd tests && npm install
npx playwright install
```

Or from **`tests/`** only:

```bash
cd tests
npm install
npx playwright install
```

### 2. Configure Environment

Copy and edit `config/staging.env` (or ensure it exists). Playwright loads it automatically via `playwright.config.ts`.

**Example `config/staging.env`:**

```bash
# Staging Environment Configuration
PRESENTER_API_URL=https://presenter.dev.ahaslide.com
AUDIENCE_API_URL=https://audience.dev.ahaslide.com
BASE_URL=https://presenter.dev.ahaslide.com
EMAIL=qa.ahaslides+2@gmail.com
PASSWORD=123123123
PRESENTATION_ID=206649
USER_ID=1635
```

- Tests use **`PRESENTATION_ID`** (e.g. `206649`) to open a specific presentation.
- Auth is currently handled via **`ahaToken`** cookie in `helpers/auth.ts` (see below).

### 3. Authentication

Tests use **cookie-based auth**: `AuthHelper.addTokenToCookies(page)` adds an `ahaToken` cookie for the staging domain. The token is maintained in `helpers/auth.ts`.

To use your own token:

1. Log in to `presenter.dev.ahaslide.com` (or your staging URL) in a browser.
2. Open DevTools → Application → Cookies (or Local Storage if your app stores it there).
3. Copy the `ahaToken` (or equivalent) value.
4. Update `helpers/auth.ts` to use your token when calling `addTokenToCookies`.

## 🧪 Running Tests

### From Project Root

```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI
npm run test:e2e:debug    # Run in debug mode
npm run test:e2e:report   # Open HTML report (after a run)
```

### From `tests/` Directory

```bash
npm test                  # Run all tests
npm run test:ui           # UI mode
npm run test:debug        # Debug mode
npm run test:report       # Show report
```

### Run Specific Test Files

```bash
# From project root (paths relative to tests/)
npm run test:e2e -- e2e/presenter/presenter-canvas-iframe.spec.ts
npm run test:e2e -- e2e/presenter/presenter-settings-iframe.spec.ts
npm run test:e2e -- e2e/audience/audience-view.spec.ts

# From tests/
npx playwright test e2e/presenter/presenter-canvas-iframe.spec.ts
npx playwright test e2e/presenter/presenter-settings-iframe.spec.ts
npx playwright test e2e/audience/audience-view.spec.ts
```

### Run with Specific Browser

Playwright is configured for **Chromium** by default. To use other browsers, uncomment the corresponding project in `playwright.config.ts`, then:

```bash
npx playwright test --project=chromium
# npx playwright test --project=firefox
# npx playwright test --project=webkit
```

## 📋 Test Scenarios

### Presenter View – Canvas (`presenter-canvas-iframe.spec.ts`)

- Logs in via `ahaToken` and navigates to a presentation by ID.
- Uses **PresenterPage** to wait for and assert the **Canvas** plugin iframe:
  - **Test**: “Verify Slide Plugin Canvas iframe exists” — iframe with `data-testid="slide-plugin-iframe-canvas"` is visible.

### Presenter View – Settings (`presenter-settings-iframe.spec.ts`)

- Same auth and navigation as above.
- Uses **PresenterPage** to wait for and assert the **Settings** plugin iframe:
  - **Test**: “Verify Slide Plugin Settings iframe exists” — iframe with `data-testid="slide-plugin-iframe-settings"` is visible.

### Audience View (`audience-view.spec.ts`)

- Placeholder suite for **AudienceSlidePluginIframe** tests. No scenarios implemented yet.

## 🔍 Page Object Model

**`pages/presenter.ts`** defines **PresenterPage**:

- `getSlidePluginIframeCanvas()` — locator for canvas iframe (`data-testid="slide-plugin-iframe-canvas"`).
- `getSlidePluginIframeSettings()` — locator for settings iframe (`data-testid="slide-plugin-iframe-settings"`).
- `waitForSlidePluginIframeCanvas()` / `waitForSlidePluginIframeSettings()` — wait for the corresponding iframe to be visible (timeout 25s).

## 🛠️ Customization

### Change Presentation ID

- Set `PRESENTATION_ID` in `config/staging.env`, or  
- Update the `presentationId` constant in each spec (e.g. `presenter-canvas-iframe.spec.ts`, `presenter-settings-iframe.spec.ts`).

### Change Staging URL

- Update `PRESENTER_API_URL`, `BASE_URL`, etc. in `config/staging.env`.
- `playwright.config.ts` uses `process.env.STAGING_URL` for `baseURL` if set; otherwise it defaults to `https://staging.ahaslide.com`.
- **Note**: `helpers/commonHelpers.ts` uses `https://presenter.dev.ahaslide.com` for `goToPresentationById`. Align this with your staging URL if you change environments.

### Adjust Timeouts

In `playwright.config.ts`:

```typescript
use: {
  actionTimeout: 15000,
  navigationTimeout: 30000,
}
```

Page-object wait timeouts (e.g. 25s for iframes) are in `pages/presenter.ts`.

## 📊 Test Reports

After a run, the HTML report is written under `tests/test-results/`. Open it with:

```bash
npm run test:e2e:report   # from root
# or
npm run test:report       # from tests/
```

JSON results are written to `tests/test-results/results.json`.

## 🐛 Troubleshooting

### Iframe not found / not visible

1. Confirm the presentation exists (e.g. `PRESENTATION_ID=206649` in staging).
2. Check that the app uses `data-testid="slide-plugin-iframe-canvas"` and `data-testid="slide-plugin-iframe-settings"`. If not, update `pages/presenter.ts` to match your markup.
3. Increase wait timeouts in `PresenterPage` if the iframes load slowly.

### Authentication fails

1. Ensure `AuthHelper.addTokenToCookies` runs in `beforeEach` before navigation.
2. Verify the token in `helpers/auth.ts` is valid and not expired.
3. Confirm cookie domain (e.g. `.ahaslide.com`) and `BASE_URL` / presenter URL match your environment.

### Navigation / wrong URL

1. Check `config/staging.env` and `helpers/commonHelpers.ts` use the same base URL (e.g. `presenter.dev.ahaslide.com`).
2. Ensure `PRESENTATION_ID` is correct for your staging data.

### Timeouts

- Increase `actionTimeout` / `navigationTimeout` in `playwright.config.ts`.
- Increase iframe wait timeouts in `pages/presenter.ts` if the app or network is slow.

## 📝 Adding New Tests

1. Add a new spec under `e2e/` (e.g. `e2e/presenter/` or `e2e/audience/`).
2. Reuse **AuthHelper**, **goToPresentationById**, and **PresenterPage** (or add new page objects under `pages/`).
3. Follow the existing pattern: `beforeEach` → auth → navigate → run assertions.

Example:

```typescript
import { test, expect } from '@playwright/test';
import { PresenterPage } from '../../pages/presenter';
import { AuthHelper } from '../../helpers/auth';
import { goToPresentationById } from '../../helpers/commonHelpers';

test.describe('My New Suite', () => {
  const presentationId = 206649;

  test.beforeEach(async ({ page }) => {
    await AuthHelper.addTokenToCookies(page);
    await goToPresentationById.goToPresentationById(page, presentationId);
  });

  test('my new case', async ({ page }) => {
    const presenterPage = new PresenterPage(page);
    await presenterPage.waitForSlidePluginIframeCanvas();
    await expect(presenterPage.getSlidePluginIframeCanvas()).toBeVisible();
  });
});
```

## 🔗 Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [QA_GUIDE.md](./QA_GUIDE.md) — QA strategy, what to test, testing pyramid.
- [QUICK_START.md](./QUICK_START.md) — Minimal setup and run commands.

## ⚠️ Notes

- Tests run against the **staging** environment (e.g. `presenter.dev.ahaslide.com` / `staging.ahaslide.com`).
- A valid **ahaToken** (or equivalent) is required; see `helpers/auth.ts`.
- Tests assume a presentation with `PRESENTATION_ID` (e.g. `206649`) exists in staging.
- Update selectors in `pages/presenter.ts` and URLs in `config/staging.env` / `commonHelpers.ts` to match your AhaSlides deployment.
