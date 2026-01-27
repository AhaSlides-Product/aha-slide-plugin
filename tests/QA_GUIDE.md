# QA Testing Guide for AhaSlides Slide Plugin SDK

## 📚 Repository Overview

### What is this SDK?

The **AhaSlides Slide Plugin SDK** is a monorepo that provides tools and utilities for building interactive slide plugins. It enables developers to create custom slide types that integrate with the AhaSlides presentation platform.

### Architecture Overview

This is a **monorepo** managed by **Turborepo** and **npm workspaces**, containing:

1. **Shared Packages** (`packages/`):
   - `@aha/ui`: Core UI components, synchronization utilities, and iframe communication
   - `@aha/backend-utils`: Shared backend DTOs and utilities
   - `@aha/backend-main`: Unified backend aggregator that auto-discovers slide backends

2. **Sample Applications** (`apps/`):
   - `sample-slide`: Example implementation showing how to use the SDK
     - `frontend/`: Vue 3 application with presenter and audience views
     - `backend/`: NestJS backend for handling audience interactions

### Key Technologies

- **Frontend**: Vue 3, TypeScript, Vite, Ant Design Vue
- **Backend**: NestJS, TypeScript
- **Build System**: Turborepo, npm workspaces
- **Communication**: Zoid (cross-domain iframe communication), BroadcastChannel API
- **Testing**: Jest (backend), Vitest (recommended for frontend)

---

## 🎯 What Needs Testing?

### 1. **UI Package (`@aha/ui`)** - Core SDK Functionality

#### Synchronization Utilities (`sync.ts`)
- `useSync<T>`: Bidirectional state sync across browser tabs
- `useSyncReadOnly<T>`: Read-only state sync (listener only)
- **Test Scenarios**:
  - State synchronization between multiple tabs
  - BroadcastChannel message handling
  - Pause/resume functionality to prevent loops
  - Initial state handling

#### Zoid Components (`zoid.ts`)
- `PresenterSlidePluginIframe`: Cross-domain component for presenter view
- `AudienceSlidePluginIframe`: Cross-domain component for audience view
- `usePresenterPlugin`: Vue composable for presenter plugins
- `useAudiencePlugin`: Vue composable for audience plugins
- `autoReportHeight`: Automatic height reporting to parent
- **Test Scenarios**:
  - Component initialization
  - Props passing and validation
  - Height reporting functionality
  - xprops communication
  - Dynamic prop updates

#### Theme & Colors (`theme.ts`, `colors.ts`)
- Theme configuration
- Color utilities
- **Test Scenarios**:
  - Theme object structure
  - Color transformation functions

#### Image Utilities (`image.ts`)
- Image upload functionality
- **Test Scenarios**:
  - Image upload requests
  - Error handling
  - Response parsing

### 2. **Backend Utils Package (`@aha/backend-utils`)**

#### DTOs
- `SubmitAnswerDto`: Answer submission data structure
- `AnswerResult`: Response structure
- **Test Scenarios**:
  - DTO validation
  - Type checking
  - Required field validation

### 3. **Sample Applications**

#### Frontend (`apps/sample-slide/frontend`)
- Vue components (Canvas, Settings, Presenting, Audience)
- Router configuration
- Integration with `@aha/ui` package
- **Test Scenarios**:
  - Component rendering
  - User interactions
  - Route navigation
  - Plugin integration

#### Backend (`apps/sample-slide/backend`)
- NestJS controllers and services
- API endpoints
- **Test Scenarios**:
  - Health check endpoint
  - Answer submission endpoint
  - Request validation
  - Error handling

---

## 🧪 Testing Strategy

### Testing Pyramid

```
        /\
       /  \     E2E Tests (Few)
      /____\    - Full user flows
     /      \   - Cross-browser testing
    /________\  Integration Tests (Some)
   /          \ - API endpoint testing
  /____________\ Unit Tests (Many)
                - Functions, utilities, components
```

### 1. **Unit Tests** (Fast, Isolated)

**Purpose**: Test individual functions, utilities, and components in isolation.

**Tools**:
- **Jest**: For backend and pure TypeScript utilities
- **Vitest**: For Vue components and frontend code (recommended)

**Coverage Target**: 80%+ for core utilities

**Examples**:
- `useSync` function behavior
- DTO validation
- Color transformation functions

### 2. **Integration Tests** (Medium Speed)

**Purpose**: Test interactions between components and modules.

**Examples**:
- Backend API endpoints with real HTTP requests
- Frontend component integration with `@aha/ui` hooks
- BroadcastChannel communication between tabs
- Zoid iframe communication

### 3. **E2E Tests** (Slower, Comprehensive)

**Purpose**: Test complete user workflows across the entire application.

**Tools**:
- **Playwright** (recommended): Modern, fast, supports multiple browsers
- **Cypress**: Alternative option

**Examples**:
- Complete slide presentation flow
- Audience interaction flow
- Cross-tab synchronization
- Iframe communication between parent and child

---

## 🚀 Setting Up Testing Infrastructure

### Current State

- ✅ Backend has Jest configured (`apps/sample-slide/backend`)
- ❌ Frontend has no testing setup
- ❌ UI package has no testing setup
- ❌ No E2E testing framework

### Recommended Setup

1. **Unit Tests for UI Package**: Vitest + Vue Test Utils
2. **Unit Tests for Frontend Apps**: Vitest + Vue Test Utils
3. **Integration Tests**: Supertest (backend), Vitest (frontend)
4. **E2E Tests**: Playwright

---

## 📝 Test File Organization

```
packages/ui/
  src/
    __tests__/          # Unit tests
      sync.test.ts
      iframe.test.ts
      zoid.test.ts
      colors.test.ts
      image.test.ts
    __mocks__/           # Mock files
    components/          # Component tests (if any)

apps/sample-slide/
  frontend/
    src/
      __tests__/         # Unit tests
      components/
        __tests__/       # Component tests
      pages/
        __tests__/      # Page tests
    e2e/                 # E2E tests
      specs/
        presenter.spec.ts
        audience.spec.ts
  backend/
    src/
      *.spec.ts         # Already exists
    test/                # Integration tests
      integration/
        api.test.ts
```

---

## 🎬 Next Steps

1. **Review this guide** and understand the SDK structure
2. **Set up testing frameworks** (see setup scripts below)
3. **Write test examples** for each package
4. **Create test coverage reports**
5. **Set up CI/CD** for automated testing

---

## 📖 Additional Resources

- [Vue Testing Guide](https://vuejs.org/guide/scaling-up/testing.html)
- [Vitest Documentation](https://vitest.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

---

## ❓ Common Testing Scenarios

### Testing BroadcastChannel (useSync)

```typescript
// Challenge: BroadcastChannel requires browser environment
// Solution: Mock BroadcastChannel or use jsdom environment
```

### Testing Cross-Window Communication

```typescript
// Challenge: Testing postMessage between windows
// Solution: Mock window.postMessage and window.addEventListener
```

### Testing Vue Composables

```typescript
// Challenge: Testing reactive Vue composables
// Solution: Use @vue/test-utils or @testing-library/vue
```

### Testing Zoid Components

```typescript
// Challenge: Zoid creates custom elements
// Solution: Mock zoid.create or test in real browser (E2E)
```

---

## 🔍 Key Testing Priorities

1. **Critical Path**: State synchronization (`useSync`, `useSyncReadOnly`)
2. **Security**: Cross-origin communication (Zoid)
3. **Reliability**: Error handling and edge cases
4. **Integration**: Backend API endpoints
5. **User Experience**: E2E flows for presenter and audience

