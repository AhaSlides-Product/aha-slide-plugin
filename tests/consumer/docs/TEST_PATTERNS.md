# Consumer Test Patterns

This document describes the patterns used across consumer tests so you can follow them when adding or changing tests.

## 1. Import tests

**Purpose:** Verify that all public exports are importable and have the expected type (function, object, etc.).

**Pattern:**
- Use dynamic `await import('@aha/ui')` or `await import('@aha/backend-utils')` to avoid cross-test pollution.
- Assert each export with `expect(ui.useSync).toBeDefined()` and `expect(typeof ui.useSync).toBe('function')`.
- For type-only exports (interfaces), the module may have no runtime keys; that’s expected.

**Files:** `consumer/ui/imports.test.ts`, `consumer/backend-utils/imports.test.ts`

---

## 2. Vue composables (with mocks)

**Purpose:** Test composables that depend on browser or host APIs (BroadcastChannel, `window.xprops`).

**Pattern:**
- Mock globals in `helpers/setup.ts` (e.g. `BroadcastChannel`, `ResizeObserver`, `window.xprops`).
- For composables that use `onMounted` (e.g. `usePresenterPlugin`, `useAudiencePlugin`), **call them inside a component and use `mount()`** so lifecycle hooks run.
- Set `(window as any).xprops = { ... }` **before** mounting. For `useAudiencePlugin`, audience data lives under **`xprops.audience`** (e.g. `xprops.audience.audienceName`), not on `xprops` directly.
- Refs may be unwrapped on the component instance. Use:  
  `const value = hook.audienceName?.value ?? (hook as any).audienceName`  
  to support both ref and unwrapped value.

**Files:** `consumer/ui/composables.test.ts`, `consumer/helpers/setup.ts`

---

## 3. Utility functions

**Purpose:** Test pure or mostly-pure utilities (e.g. `uploadImage`, `autoReportHeight`).

**Pattern:**
- Set required mocks (e.g. `window.xprops` for `autoReportHeight`) in `beforeEach` or inside the test.
- Test return type and shape (e.g. Promise, cleanup function).
- Use `vi.fn()` for callbacks and assert they were called when relevant.

**Files:** `consumer/ui/utilities.test.ts`

---

## 4. Component tests (Vue)

**Purpose:** Test Vue components (e.g. AhaIcon) and Zoid components (exports / tags).

**Pattern:**
- Use `mount(Component, { props: { ... } })` from `@vue/test-utils`.
- For AhaIcon, icons are loaded dynamically; in tests they often fail to load, so assert the **placeholder** (e.g. `.icon-placeholder`) or that the component accepts props.
- For Zoid components, only assert that the export exists and is a function or object (no DOM in Node/jsdom).

**Files:** `consumer/ui/components.test.ts`

---

## 5. Type tests

**Purpose:** Ensure TypeScript types match runtime usage (interfaces, DTOs, type aliases).

**Pattern:**
- Use `import type { ... } from '@aha/ui'` (or backend-utils).
- Create objects that satisfy the type and assert property values.
- Test optional vs required fields and type compatibility (e.g. `BaseSlidePluginProps` where `SlidePluginProps` is expected).

**Files:** `consumer/ui/types.test.ts`, `consumer/backend-utils/types.test.ts`

---

## 6. Integration tests

**Purpose:** Test cross-package and app-level usage (frontend–backend types, sample-app patterns).

**Pattern:**
- Use **types** from both packages in one test (e.g. `SubmissionRequest` payload → `SubmissionResult` response).
- For sample-app patterns, mirror real imports and usage (theme, useSync, usePresenterPlugin, useAudiencePlugin) inside mounted components.

**Files:** `consumer/integration/frontend-backend.test.ts`, `consumer/integration/sample-app-patterns.test.ts`

---

## 7. Environment tests

**Purpose:** Ensure packages work in Node, browser-like, and bundler contexts.

**Pattern:**
- **Node:** Only test `@aha/backend-utils` (no DOM). Use `await import('@aha/backend-utils')` and assert the module loads; don’t rely on runtime type exports.
- **Browser:** Assert globals (`BroadcastChannel`, `window`, `document`, `ResizeObserver`) and that `@aha/ui` exports are usable.
- **Bundlers:** Use dynamic `await import('@aha/ui')` and assert named/default/namespace imports; test subpath exports (e.g. `@aha/ui/AhaIcon.vue`).

**Files:** `consumer/environments/node.test.ts`, `consumer/environments/browser.test.ts`, `consumer/environments/bundlers.test.ts`

---

## Shared conventions

- **One logical assertion per test** where possible; multiple related checks in one test are fine when they form a single behavior.
- **Unique channel names** for `useSync` / `useSyncReadOnly` per test to avoid cross-test BroadcastChannel interference.
- **Restore mocks** in `afterEach` or rely on Vitest’s isolation; avoid mutating shared globals across files.
- **Prefer type-safe assertions**; use `(x as any)` only when dealing with ref unwrapping or internal shapes.
