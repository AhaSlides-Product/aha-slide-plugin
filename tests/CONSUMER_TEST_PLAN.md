# Consumer Test Plan for AhaSlides Slide Plugin SDK

## 📋 Overview

Consumer tests (also known as contract tests) verify that the SDK's public API works correctly from the perspective of a consumer (someone using the SDK). These tests ensure:

1. **API Contract Compliance**: The SDK exports what it claims to export
2. **Backward Compatibility**: Breaking changes are caught early
3. **Cross-Environment Compatibility**: SDK works in different environments (Node.js, browser, different bundlers)
4. **Documentation Accuracy**: APIs behave as documented
5. **Integration Readiness**: SDK can be consumed by real applications

## 🎯 Why Consumer Tests for This SDK?

The AhaSlides Slide Plugin SDK is consumed by:
- **Plugin developers** building custom slide types
- **Frontend applications** using `@aha/ui` components and hooks
- **Backend services** using `@aha/backend-utils` DTOs and types

Consumer tests ensure that:
- Plugin developers can reliably use the SDK APIs
- Breaking changes are detected before release
- The SDK works across different build tools (Vite, Webpack, etc.)
- Type definitions match runtime behavior

## 🏗️ Architecture

### Test Structure

```
tests/
├── consumer/                    # Consumer tests directory
│   ├── ui/                      # Tests for @aha/ui package
│   │   ├── imports.test.ts      # Test all exports are importable
│   │   ├── composables.test.ts  # Test Vue composables (useSync, usePresenterPlugin, etc.)
│   │   ├── components.test.ts   # Test Vue components (AhaIcon, etc.)
│   │   ├── zoid.test.ts         # Test Zoid iframe components
│   │   ├── theme.test.ts        # Test theme configuration
│   │   ├── tracking.test.ts     # Test tracking directives and plugin
│   │   ├── utilities.test.ts    # Test utility functions (execRequest, uploadImage, etc.)
│   │   └── types.test.ts        # Test TypeScript type definitions
│   ├── backend-utils/           # Tests for @aha/backend-utils package
│   │   ├── imports.test.ts      # Test all exports are importable
│   │   ├── dtos.test.ts         # Test DTO classes (SubmitAnswerDto)
│   │   ├── types.test.ts        # Test interfaces and type aliases
│   │   └── validation.test.ts   # Test DTO validation
│   ├── common/                  # Tests for @aha/common package
│   │   └── utilities.test.ts    # Test common utilities (getBucket, etc.)
│   ├── integration/             # Cross-package integration tests
│   │   ├── frontend-backend.test.ts  # Test frontend-backend data flow
│   │   └── sample-app.test.ts   # Test using SDK like sample-app does
│   ├── environments/            # Environment-specific tests
│   │   ├── node.test.ts         # Test Node.js compatibility
│   │   ├── browser.test.ts      # Test browser compatibility
│   │   └── bundlers.test.ts     # Test with different bundlers
│   ├── fixtures/                # Test fixtures and mocks
│   │   ├── mock-broadcast-channel.ts
│   │   ├── mock-zoid.ts
│   │   └── test-data.ts
│   ├── helpers/                 # Test helpers
│   │   ├── setup-vue.ts         # Vue test setup
│   │   ├── setup-browser.ts     # Browser environment setup
│   │   └── assertions.ts        # Custom assertions
│   └── config/                  # Test configuration
│       ├── vitest.config.ts     # Vitest config for consumer tests
│       └── tsconfig.json        # TypeScript config
├── e2e/                         # Existing E2E tests (keep as-is)
└── ...
```

## 📦 What to Test

### 1. @aha/ui Package

#### Exports & Imports
- ✅ All documented exports are importable
- ✅ Named exports work correctly
- ✅ Default exports work correctly
- ✅ Re-exports work correctly
- ✅ Type-only imports work correctly

#### Vue Composables
- ✅ `useSync<T>`: Bidirectional state synchronization
  - State updates broadcast to other tabs
  - Initial state handling
  - Channel name changes
  - Cleanup on unmount
- ✅ `useSyncReadOnly<T>`: Read-only state synchronization
  - Receives updates from other tabs
  - Cannot modify state directly
  - Cleanup on unmount
- ✅ `usePresenterPlugin(options)`: Presenter plugin hook
  - Returns correct reactive refs
  - Props are reactive
   - Actions are callable
   - Options are respected (autoHeight, etc.)
   - `presentation.teamPlay` synchronization
   - `currentUser.presenterLanguage` accessibility
   - `accessToken` availability
   - Actions: `showConfirmModal`, `clearSlideData`, `openUploadImageModal`, `openEditImageModal`
- ✅ `useAudiencePlugin(options)`: Audience plugin hook
  - Returns correct reactive refs
  - Props are reactive
   - Options are respected
   - Color palette props are reactive (`presentationColorPaletteProps`, `presentationLighterColorPaletteProps`)
   - `participantInfo` synchronization (reactive via `onProps`)
   - `updateAudienceData` action (including `participantInfo`)
   - `presentation.teamPlay` synchronization (reactive via `onProps`)
   - `slideAttributes` synchronization (reactive via `onProps`)
- ✅ `useReportPlugin`: Hook for report iframes
  - Reactive props (token, currentLanguage, featureFlags, translationMap, etc.)
  - `locale`, `iframePath`, `featureFlags`, `translationMap` synchronization (reactive via `onProps`)
  - Auto-height reporting
  - Event tracking integration (`trackGA4AndMixpanel`)
  - Routing actions: `replaceRoute`, `pushRoute`, `openExportModalForPresentation`
  - Color palette props (inherited from base)
- ✅ `useColors()`: Color utilities
  - Returns color functions
  - Color transformations work
- ✅ `tracking`: User tracking features
  - `vEmitAction`: Simple click tracking directive
  - `emitActionDirective`: Advanced tracking with modifiers (view, hover, etc.)
  - `emitActionPlugin`: Vue plugin registration
  - Reactive props (token, currentLanguage, etc.)
  - Auto-height reporting
  - Event tracking integration
- ✅ `ReportIframe`: Zoid component for reports
  - Can be instantiated with token and currentLanguage

#### Components
- ✅ `AhaIcon`: Icon component
  - Renders SVG correctly
  - Handles missing icons gracefully
  - Size props work correctly
  - Class props work correctly

#### Zoid Components
- ✅ `PresenterSlidePluginIframe`: Can be instantiated
- ✅ `AudienceSlidePluginIframe`: Can be instantiated
- ✅ Props are passed correctly
- ✅ xprops communication works

#### Utilities
- ✅ `execRequest`: Request/response pattern
  - Unique request IDs
  - Timeout handling
  - Error handling
  - Response matching
- ✅ `uploadImage`: Image upload
  - Returns correct format
  - Error handling
- ✅ `autoReportHeight`: Height reporting
  - Reports height changes
  - Cleanup works
- ✅ `accessToken`: User authentication
  - Token is available in presenter hook
- ✅ `updateAudienceData`: Audience management
  - Can update audience name, email, emoji
- ✅ `participantInfo`: Extra participant metadata
  - Support for nickname and other custom fields
- ✅ `showConfirmModal`: Presenter interactions
  - Can trigger confirm modals from iframe
- ✅ `clearSlideData`: Data management
  - Can clear slide-specific data
- ✅ `setSubmissionCount`: Progress tracking
  - Updates submission count UI in parent
- ✅ `getValues`: Data retrieval
  - Fetch values from parent app buckets
- ✅ `uploadImage` & `openUploadImageModal`: Media management
  - Trigger image upload from plugin
- ✅ `onKeyboard` & `emitKeyboardEvent`: Keyboard interactions
  - Sync keyboard events between plugin and parent
- ✅ `showToast`: Feedback notifications
  - Show info, success, and error toasts in parent
- ✅ `openPluginModal` & `closePluginModal`: Modal management
  - Control plugin modals from iframe
- ✅ `routing`: Report navigation
  - `replaceRoute`, `pushRoute`, and `openExportModalForPresentation`
- ✅ `extraData`: Metadata synchronization
  - `featureFlags` and `translationMap` in report plugin

#### Theme & Styles
- ✅ `ahaSlidesDefaultTheme`: Theme object structure
- ✅ CSS variables are available
- ✅ Tailwind config is importable

### 2. @aha/backend-utils Package
...
### 3. @aha/common Package
- ✅ `getBucket`: EMQX/S3 bucket name formatting
  - Consistent naming across services

#### Exports & Imports
- ✅ All documented exports are importable
- ✅ Type definitions are correct

#### DTOs
- ✅ `SubmitAnswerDto`: Class validation
  - Required fields
  - Optional fields
  - Type validation
  - Serialization

#### Types & Interfaces
- ✅ `AnswerResult`: Interface structure
- ✅ `CountTotal`: Type alias
- ✅ `CountUnique`: Type alias
- ✅ `CountTotalItem`: Interface
- ✅ `CountUniqueItem`: Interface

### 3. Integration Tests

#### Frontend-Backend Integration
- ✅ DTOs match between frontend and backend
- ✅ Data serialization/deserialization
- ✅ Type compatibility

#### Sample App Integration
- ✅ SDK can be used like sample-app uses it
- ✅ All sample-app patterns work
- ✅ No missing dependencies

### 4. Environment Tests

#### Node.js Compatibility
- ✅ Can be imported in Node.js
- ✅ Type definitions work
- ✅ No browser-only code in backend-utils

#### Browser Compatibility
- ✅ Works in modern browsers
- ✅ BroadcastChannel support
- ✅ PostMessage support

#### Bundler Compatibility
- ✅ Works with Vite
- ✅ Works with Webpack
- ✅ Works with Rollup
- ✅ Tree-shaking works
- ✅ Code splitting works

## 🛠️ Implementation Plan

### Phase 1: Foundation ✅
1. **Setup Test Infrastructure**
   - [ ] Create `tests/consumer/` directory structure
   - [ ] Setup Vitest configuration
   - [ ] Setup TypeScript configuration
   - [ ] Create test helpers and fixtures
   - [ ] Setup CI/CD integration

2. **Basic Import Tests**
   - [ ] Test all `@aha/ui` exports are importable
   - [ ] Test all `@aha/backend-utils` exports are importable
   - [ ] Test type-only imports work

### Phase 2: Core Functionality (Week 2) ✅
1. **Vue Composables Tests**
   - [x] Test `useSync` with BroadcastChannel mock
   - [x] Test `useSyncReadOnly` with BroadcastChannel mock
   - [x] Test `usePresenterPlugin` with Zoid mock
   - [x] Test `useAudiencePlugin` with Zoid mock
   - (useColors not in package; skipped)

2. **Utility Functions Tests**
   - (execRequest not in package; skipped)
   - [x] Test `uploadImage` with fetch mock
   - [x] Test `autoReportHeight` with ResizeObserver mock

### Phase 3: Components & Types (Week 3) ✅
1. **Component Tests**
   - [x] Test `AhaIcon` component rendering
   - [x] Test Zoid components instantiation

2. **Type Tests**
   - [x] Test TypeScript type definitions match runtime
   - [x] Test DTO validation
   - [x] Test interface structures

### Phase 4: Integration & Environments (Week 4) ✅
1. **Integration Tests**
   - [x] Test frontend-backend data flow
   - [x] Test sample-app patterns

2. **Environment Tests**
   - [x] Test Node.js compatibility
   - [x] Test browser compatibility
   - [x] Test bundler compatibility

### Phase 5: Documentation & Maintenance (Ongoing) ✅
1. **Documentation**
   - [x] Document test patterns
   - [x] Document how to add new consumer tests
   - [x] Document CI/CD integration

2. **Maintenance**
   - [x] Add tests for new features
   - [ ] Update tests for API changes
   - [ ] Monitor test coverage

## 🧪 Test Examples

### Example 1: Import Test

```typescript
// tests/consumer/ui/imports.test.ts
import { describe, it, expect } from 'vitest';

describe('@aha/ui exports', () => {
  it('should export all documented functions', async () => {
    const ui = await import('@aha/ui');
    
    expect(ui.useSync).toBeDefined();
    expect(ui.useSyncReadOnly).toBeDefined();
    expect(ui.usePresenterPlugin).toBeDefined();
    expect(ui.useAudiencePlugin).toBeDefined();
    expect(ui.useColors).toBeDefined();
    expect(ui.execRequest).toBeDefined();
    expect(ui.uploadImage).toBeDefined();
    expect(ui.autoReportHeight).toBeDefined();
  });

  it('should export theme configuration', async () => {
    const ui = await import('@aha/ui');
    expect(ui.ahaSlidesDefaultTheme).toBeDefined();
  });

  it('should export Zoid components', async () => {
    const ui = await import('@aha/ui');
    expect(ui.PresenterSlidePluginIframe).toBeDefined();
    expect(ui.AudienceSlidePluginIframe).toBeDefined();
  });
});
```

### Example 2: Composable Test

```typescript
// tests/consumer/ui/composables.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { useSync, useSyncReadOnly } from '@aha/ui';
import { createApp } from 'vue';

describe('useSync', () => {
  let mockBroadcastChannel: any;
  
  beforeEach(() => {
    mockBroadcastChannel = {
      postMessage: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
    };
    
    global.BroadcastChannel = vi.fn(() => mockBroadcastChannel) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a BroadcastChannel with the correct name', () => {
    const TestComponent = {
      setup() {
        const state = useSync('test-channel', { count: 0 });
        return { state };
      },
      template: '<div>{{ state.count }}</div>',
    };

    mount(TestComponent);
    expect(global.BroadcastChannel).toHaveBeenCalledWith('test-channel');
  });

  it('should broadcast state changes', () => {
    const TestComponent = {
      setup() {
        const state = useSync('test-channel', { count: 0 });
        state.value.count = 1;
        return { state };
      },
      template: '<div>{{ state.count }}</div>',
    };

    mount(TestComponent);
    expect(mockBroadcastChannel.postMessage).toHaveBeenCalled();
  });
});
```

### Example 3: DTO Test

```typescript
// tests/consumer/backend-utils/dtos.test.ts
import { describe, it, expect } from 'vitest';
import { SubmitAnswerDto } from '@aha/backend-utils';

describe('SubmitAnswerDto', () => {
  it('should create instance with required fields', () => {
    const dto = new SubmitAnswerDto({
      slideId: '123',
      answer: { value: 'test' },
    });

    expect(dto.slideId).toBe('123');
    expect(dto.answer).toEqual({ value: 'test' });
  });

  it('should handle optional fields', () => {
    const dto = new SubmitAnswerDto({
      slideId: '123',
      answer: { value: 'test' },
      audienceId: 'audience-1',
    });

    expect(dto.audienceId).toBe('audience-1');
  });

  it('should serialize correctly', () => {
    const dto = new SubmitAnswerDto({
      slideId: '123',
      answer: { value: 'test' },
    });

    const serialized = JSON.stringify(dto);
    const parsed = JSON.parse(serialized);
    
    expect(parsed.slideId).toBe('123');
    expect(parsed.answer).toEqual({ value: 'test' });
  });
});
```

### Example 4: Integration Test

```typescript
// tests/consumer/integration/frontend-backend.test.ts
import { describe, it, expect } from 'vitest';
import { SubmitAnswerDto, AnswerResult } from '@aha/backend-utils';

describe('Frontend-Backend Integration', () => {
  it('should have compatible types between frontend and backend', () => {
    // Frontend creates DTO
    const dto = new SubmitAnswerDto({
      slideId: '123',
      answer: { value: 'test' },
      audienceId: 'audience-1',
    });

    // Backend receives and processes
    const result: AnswerResult = {
      submission: dto,
      count_total: { total: 1 },
      count_unique: { unique: 1 },
    };

    expect(result.submission).toBeInstanceOf(SubmitAnswerDto);
    expect(result.submission.slideId).toBe('123');
  });
});
```

## 📊 Test Coverage Goals

- **@aha/ui**: 80%+ coverage for public APIs
- **@aha/backend-utils**: 90%+ coverage (simpler package)
- **Integration tests**: Cover all major integration points
- **Environment tests**: Cover all supported environments

## 🚀 Running Consumer Tests

```bash
# Run all consumer tests
npm run test:consumer

# Run tests for specific package
npm run test:consumer -- --grep "@aha/ui"
npm run test:consumer -- --grep "@aha/backend-utils"

# Run with coverage
npm run test:consumer:coverage

# Run in watch mode
npm run test:consumer:watch
```

## 🔄 CI/CD Integration

Consumer tests should run:
- ✅ On every PR
- ✅ Before publishing new versions
- ✅ On schedule (daily/weekly) to catch dependency issues
- ✅ As part of release process

## 📝 Best Practices

1. **Test Public APIs Only**: Don't test internal implementation details
2. **Mock External Dependencies**: Mock BroadcastChannel, postMessage, etc.
3. **Test Behavior, Not Implementation**: Focus on what the API does, not how
4. **Keep Tests Fast**: Consumer tests should run quickly
5. **Document Test Patterns**: Make it easy to add new tests
6. **Version Compatibility**: Test against multiple versions of dependencies
7. **Real-World Scenarios**: Test patterns that consumers actually use

## 🎯 Success Criteria

Consumer tests are successful when:
- ✅ All public APIs are tested
- ✅ Breaking changes are caught before release
- ✅ Tests run in CI/CD and prevent bad releases
- ✅ New features include consumer tests
- ✅ Test coverage meets goals
- ✅ Tests are maintainable and well-documented

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)
- [Contract Testing Best Practices](https://docs.pact.io/)
