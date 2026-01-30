# Phase 2: Core Functionality - Complete ✅

## Summary

Phase 2 adds consumer tests for Vue composables and utility functions from `@aha/ui`.

## What Was Added

### 1. Vue Composables Tests (`consumer/ui/composables.test.ts`)

**useSync**
- Returns a ref with initial state
- Creates BroadcastChannel with the given name
- Broadcasts state changes via postMessage
- Accepts object and primitive initial state

**useSyncReadOnly**
- Returns a readonly ref with initial state
- Creates BroadcastChannel with the given name

**usePresenterPlugin**
- Returns reactive refs from xprops (presentationProps, slideProps, baseUrl)
- Returns getSlideAttributesAction and upsertSlideAttributeAction
- Respects `autoHeight: false` (calls onHeightChange(null), no ResizeObserver)

**useAudiencePlugin**
- Returns base refs and audience-specific refs (slideAttributesProps, audienceName, audienceEmoji, audienceId, audienceEmail, audienceTeam)

### 2. Utility Functions Tests (`consumer/ui/utilities.test.ts`)

**uploadImage**
- Is a function
- Returns a Promise
- Resolves to an object (ImageUploadResult shape)

**autoReportHeight**
- Returns a cleanup function when xprops has onHeightChange
- Returns a no-op cleanup when xprops is missing
- Returns a no-op cleanup when onHeightChange is not a function
- Calls onHeightChange when invoked (initial report)

### 3. Infrastructure Changes

- **Vitest include**: Limited to `consumer/**/*.test.ts` and `consumer/**/*.spec.ts` so Playwright e2e specs are not run by Vitest.
- **BroadcastChannel mock**: Replaced class with a constructor function that works when called with or without `new` (fixes "Class constructor cannot be invoked without 'new'" in some environments).
- **MutationObserver mock**: Added in `helpers/setup.ts` for `autoReportHeight` (it uses MutationObserver).

## How to Run

```bash
cd tests
npm run test:consumer
```

All 36 consumer tests (Phase 1 + Phase 2) should pass.

## Next: Phase 3

- Component tests (AhaIcon, Zoid instantiation)
- Type tests (DTO validation, interface structures)
