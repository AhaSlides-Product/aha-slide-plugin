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

## Documentation

- **[docs/TEST_PATTERNS.md](./docs/TEST_PATTERNS.md)** – Test patterns (imports, composables, types, integration, environments)
- **[docs/ADDING_TESTS.md](./docs/ADDING_TESTS.md)** – How to add new consumer tests


## 📋 Next Steps (Maintenance)


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
