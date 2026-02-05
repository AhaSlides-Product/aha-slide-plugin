# Consumer Tests for AhaSlides Slide Plugin SDK

Consumer tests verify that the SDK's public API works correctly from the perspective of a consumer (someone using the SDK).

## Quick Start

```bash
# Install dependencies
npm install

# Run consumer tests
npm run test:consumer

# Run with coverage
npm run test:consumer:coverage

# Run in watch mode
npm run test:consumer:watch
```

## What Are Consumer Tests?

Consumer tests are different from:
- **Unit Tests**: Test internal implementation details
- **E2E Tests**: Test full user workflows in real environments

Consumer tests focus on:
- ✅ **Public API Contracts**: Does the SDK export what it claims?
- ✅ **Backward Compatibility**: Are breaking changes caught early?
- ✅ **Cross-Environment**: Does it work in different environments?
- ✅ **Documentation Accuracy**: Does it behave as documented?

## Test Structure

```
consumer/
├── ui/
│   ├── imports.test.ts     # Phase 1: import tests
│   ├── composables.test.ts # Phase 2: useSync, usePresenterPlugin, useAudiencePlugin
│   ├── utilities.test.ts   # Phase 2: uploadImage, autoReportHeight
│   ├── components.test.ts # Phase 3: AhaIcon, Zoid components
│   └── types.test.ts       # Phase 3: UI types
├── backend-utils/
│   ├── imports.test.ts     # Phase 1
│   └── types.test.ts       # Phase 3: backend-utils types
├── integration/            # Phase 4: frontend-backend, sample-app patterns
├── environments/           # Phase 4: Node, browser, bundlers
├── fixtures/               # Test fixtures and mocks
└── helpers/                # Test helpers
```

## Adding New Tests

1. **Identify the Public API**: What should consumers be able to use?
2. **Write Test**: Test the API from a consumer's perspective
3. **Mock Dependencies**: Mock browser APIs, external services, etc.
4. **Verify Behavior**: Test what the API does, not how it does it

## Example

```typescript
// Test that useSync can be imported and used
import { useSync } from '@aha/ui';

describe('useSync', () => {
  it('should be importable', () => {
    expect(useSync).toBeDefined();
    expect(typeof useSync).toBe('function');
  });
});
```

## See Also

- [Full Consumer Test Plan](../CONSUMER_TEST_PLAN.md) - Detailed planning document
- [QA Guide](../QA_GUIDE.md) - Overall testing strategy
- [E2E Tests](../e2e/) - End-to-end tests
