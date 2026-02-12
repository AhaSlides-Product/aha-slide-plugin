# Adding New Consumer Tests

Use this guide when adding or extending consumer tests for the SDK.

## Where to add tests

| What you’re testing | File / directory |
|---------------------|-------------------|
| New export from `@aha/ui` | `consumer/ui/imports.test.ts` |
| New export from `@aha/backend-utils` | `consumer/backend-utils/imports.test.ts` |
| New composable or composable behavior | `consumer/ui/composables.test.ts` |
| New utility function | `consumer/ui/utilities.test.ts` |
| New component (Vue or Zoid) | `consumer/ui/components.test.ts` |
| New type/interface (UI) | `consumer/ui/types.test.ts` |
| New type/interface (backend-utils) | `consumer/backend-utils/types.test.ts` |
| Frontend–backend type flow | `consumer/integration/frontend-backend.test.ts` |
| New sample-app-style usage | `consumer/integration/sample-app-patterns.test.ts` |
| New environment (e.g. another bundler) | `consumer/environments/` (new or existing file) |

## Step-by-step

### 1. Run existing tests

From repo root:

```bash
npm run build
npm run test:consumer
```

Ensure all current consumer tests pass before adding new ones.

### 2. Add the test

- **Imports:** Add an `it('should export X', async () => { ... })` that dynamically imports the package and asserts the new export.
- **Composables:** If the composable uses `window.xprops` or lifecycle hooks, set `(window as any).xprops` and use `mount(defineComponent({ setup() { return yourComposable(); }, template: '<div />' }))`. Handle ref unwrapping when reading values from `wrapper.vm`.
- **Types:** Add an `it` that creates an object satisfying the new type and asserts key properties. Use `import type { NewType } from '@aha/ui'`.
- **Integration:** Add an `it` that uses the new type or pattern in a frontend–backend or sample-app flow.

See [TEST_PATTERNS.md](./TEST_PATTERNS.md) for patterns and examples.

### 3. Use the right mocks

- **BroadcastChannel:** Already mocked in `consumer/helpers/setup.ts`. Use a **unique channel name** per test (e.g. `useSync('my-test-channel-name', state)`).
- **window.xprops:** Set in the test or in `beforeEach`. For `useAudiencePlugin`, put audience fields under **`xprops.audience`** (e.g. `xprops.audience.audienceName`).
- **ResizeObserver / MutationObserver:** Mocked in `setup.ts`; no extra setup needed for `autoReportHeight`.

### 4. Run and fix

```bash
cd tests && npm run test:consumer -- --run path/to/your.test.ts
```

Fix any failing or flaky tests (e.g. missing mocks, wrong xprops shape, ref unwrapping).

### 5. Update docs (optional)

- If you introduced a new pattern, add a short section to [TEST_PATTERNS.md](./TEST_PATTERNS.md).
- If you added a new test file or suite, update [README.md](../README.md) (and optionally [QUICK_START.md](../QUICK_START.md)) to mention it.

## Checklist for a new public API

- [ ] Import test: new export is importable and has expected type.
- [ ] If it’s a function/composable: test key behavior with mocks.
- [ ] If it’s a type/interface: type test with at least one valid object.
- [ ] If it’s used in sample-app or backend: add or extend an integration test.
- [ ] Run full consumer suite: `npm run test:consumer`.
