# Quick Start Guide - E2E Tests

## 🚀 Setup in 3 Steps

### Step 1: Install Dependencies

```bash
# From project root
npm install

# Or from e2e directory
cd e2e
npm install
npx playwright install
```

### Step 2: Configure Environment

Create a `.env` file in the `e2e` directory:

```bash
cd e2e
cp env.example .env
```

Edit `.env` and add your authentication token:

```bash
AUTH_TOKEN=your_actual_token_here
STAGING_URL=https://staging.ahaslide.com
PRESENTATION_ID=206649
```

**How to get AUTH_TOKEN:**
1. Open browser and go to staging.ahaslide.com
2. Login manually
3. Open DevTools (F12)
4. Go to Application → Local Storage
5. Find `authToken` or `token` key
6. Copy the value to your `.env` file

### Step 3: Run Tests

```bash
# From project root
npm run test:e2e

# Or from e2e directory
cd e2e
npm test
```

## 📝 Test Commands

```bash
# Run all tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Run specific test file
npx playwright test tests/presenter-view.spec.ts
npx playwright test tests/audience-view.spec.ts
```

## ✅ What Gets Tested

The tests verify that props from `zoid.d.ts` are correctly passed to plugin iframes:

### Presenter View
- ✅ Presentation props (id, language, fontFamily, etc.)
- ✅ Slide props (id, version, timeToAnswer, etc.)
- ✅ Functions (getSlideAttributesAction, upsertSlideAttributeAction, etc.)
- ✅ Height reporting
- ✅ Base URL

### Audience View
- ✅ Presentation props
- ✅ Slide props
- ✅ Audience-specific props (name, emoji, ID, email, team)
- ✅ Slide attributes
- ✅ Audience functions
- ✅ Presenter-only functions are NOT available

## 🐛 Troubleshooting

### "AUTH_TOKEN environment variable is not set"
- Make sure you created `.env` file in `e2e/` directory
- Check that `.env` file contains `AUTH_TOKEN=...`
- Verify token is not expired

### "Plugin iframe not found"
- Check if presentation ID 206649 exists in staging
- Verify the URL structure matches your staging environment
- Update selectors in `tests/helpers/navigation.ts` if needed

### "Props not found"
- Verify zoid is correctly exposing props via `xprops`
- Check browser console for errors
- Update `tests/helpers/props-assertions.ts` if props are accessed differently

## 📚 Next Steps

- Read [README.md](./README.md) for detailed documentation
- Read [ZOID_QA_GUIDE.md](../packages/ui/dist/ZOID_QA_GUIDE.md) to understand the props structure
- Customize tests in `tests/` directory for your specific needs
