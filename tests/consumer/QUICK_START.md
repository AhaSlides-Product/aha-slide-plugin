# Consumer Tests - Quick Start

## ✅ Phase 1 Complete!

The consumer test infrastructure has been set up. Here's what was created:

### 📁 Structure Created

```
tests/consumer/
├── config/
│   ├── vitest.config.ts      # Vitest configuration
│   └── tsconfig.json          # TypeScript configuration
├── helpers/
│   └── setup.ts               # Test setup (mocks, globals)
├── fixtures/
│   ├── mock-broadcast-channel.ts  # BroadcastChannel mock
│   ├── mock-zoid.ts          # Zoid mock
│   └── test-data.ts          # Test data fixtures
├── ui/
│   └── imports.test.ts       # @aha/ui import tests
└── backend-utils/
    └── imports.test.ts       # @aha/backend-utils import tests
```

## 🚀 Getting Started

### 1. Install Dependencies

From the project root:

```bash
cd tests
npm install
```

This will install:
- `vitest` - Test framework
- `@vitejs/plugin-vue` - Vue plugin for Vitest
- `@vue/test-utils` - Vue component testing utilities
- `jsdom` - DOM environment for tests
- `vue` - Vue runtime

### 2. Build Packages

Before running tests, ensure packages are built:

```bash
# From project root
npm run build
```

### 3. Run Tests

From the project root:

```bash
# Run all consumer tests
npm run test:consumer

# Run in watch mode (for development)
npm run test:consumer:watch

# Run with coverage
npm run test:consumer:coverage

# Run with UI (interactive)
cd tests && npm run test:consumer:ui
```

Or from the `tests/` directory:

```bash
cd tests
npm run test:consumer
npm run test:consumer:watch
npm run test:consumer:coverage
```

## 📝 What's Tested

### Phase 1: Basic Imports ✅

- ✅ All `@aha/ui` exports are importable
- ✅ All `@aha/backend-utils` exports are importable
- ✅ Named imports work
- ✅ Namespace imports work
- ✅ Type-only imports work

### Phase 2: Core Functionality ✅

- ✅ **useSync** – ref, BroadcastChannel name, broadcast, initial state
- ✅ **useSyncReadOnly** – readonly ref, channel name
- ✅ **usePresenterPlugin** – refs from xprops, actions, autoHeight: false
- ✅ **useAudiencePlugin** – base + audience refs
- ✅ **uploadImage** – returns Promise resolving to object
- ✅ **autoReportHeight** – cleanup function, onHeightChange behavior

### Phase 3: Components & Types ✅

- ✅ **AhaIcon** – rendering, props (size, width, height, class), placeholder
- ✅ **Zoid Components** – PresenterSlidePluginIframe, AudienceSlidePluginIframe exports
- ✅ **UI Types** – ImageUploadResult, UseSlidePluginOptions, SlidePluginProps, etc.
- ✅ **Backend Utils Types** – SubmissionResult, CountTotalItem, CountUniqueItem, SyncItem

## 🧪 Test Examples

### Example: Testing Imports

```typescript
// tests/consumer/ui/imports.test.ts
import { describe, it, expect } from 'vitest';

describe('@aha/ui - Imports', () => {
  it('should export useSync', async () => {
    const { useSync } = await import('@aha/ui');
    expect(useSync).toBeDefined();
    expect(typeof useSync).toBe('function');
  });
});
```

## 🔧 Configuration

### Vitest Config

Located at `tests/consumer/config/vitest.config.ts`:
- Uses `jsdom` environment for browser APIs
- Includes Vue plugin for component testing
- Sets up path aliases for `@aha/ui` and `@aha/backend-utils`
- Configures coverage reporting

### TypeScript Config

Located at `tests/consumer/config/tsconfig.json`:
- Extends root tsconfig
- Includes Vitest and Vue Test Utils types
- Configured for ES modules

## 📋 Next Steps (Phase 2)

1. **Test Vue Composables**
   - `useSync` with BroadcastChannel mock
   - `useSyncReadOnly` with BroadcastChannel mock
   - `usePresenterPlugin` with Zoid mock
   - `useAudiencePlugin` with Zoid mock

2. **Test Utility Functions**
   - `autoReportHeight` with ResizeObserver mock
   - `uploadImage` with fetch mock

3. **Test Components**
   - `AhaIcon` component rendering

## 🐛 Troubleshooting

### Tests fail with "Cannot find module '@aha/ui'"

**Solution**: Make sure packages are built:
```bash
npm run build
```

### Tests fail with "BroadcastChannel is not defined"

**Solution**: The setup file should mock this. Check `tests/consumer/helpers/setup.ts` is being loaded.

### TypeScript errors in tests

**Solution**: Make sure you're using the consumer test tsconfig:
```bash
# The vitest config should handle this automatically
# But you can verify by checking tsconfig.json extends
```

## 📚 Documentation

- [Full Consumer Test Plan](../CONSUMER_TEST_PLAN.md) - Detailed planning document
- [Consumer Test Summary](../CONSUMER_TEST_SUMMARY.md) - High-level overview
- [Consumer Tests README](./README.md) - Consumer tests overview
