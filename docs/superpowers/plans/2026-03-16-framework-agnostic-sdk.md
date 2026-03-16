# Framework-Agnostic Plugin SDK Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a framework-agnostic vanilla JS/TS SDK (`@aha/core`) from the Vue-specific `@aha/ui`, then rewire `@aha/ui` composables as deprecated wrappers.

**Architecture:** New `packages/core` with Observable-based state, factory functions for each plugin type (presenter, audience, report, participant-report), and BroadcastChannel sync. `@aha/ui` keeps its public API but delegates to `@aha/core` internally.

**Tech Stack:** TypeScript, Vitest, Turborepo (npm workspaces)

**Spec:** `docs/superpowers/specs/2026-03-16-framework-agnostic-sdk-design.md`

---

## File Map

### New files (packages/core/)

| File | Responsibility |
|------|---------------|
| `packages/core/package.json` | Package config, zero deps |
| `packages/core/tsconfig.json` | TS config, ESNext target |
| `packages/core/vitest.config.ts` | Test config |
| `packages/core/src/types.ts` | All shared interfaces & type exports |
| `packages/core/src/observable.ts` | Internal `Observable<T>` class |
| `packages/core/src/utils.ts` | `throttle` (internal) |
| `packages/core/src/height.ts` | `reportHeight`, `autoReportHeight` |
| `packages/core/src/sync.ts` | `createSync`, `createSyncReadOnly` |
| `packages/core/src/plugin-base.ts` | `createPluginBase` factory |
| `packages/core/src/presenter-plugin.ts` | `createPresenterPlugin` factory |
| `packages/core/src/audience-plugin.ts` | `createAudiencePlugin` factory |
| `packages/core/src/report-plugin.ts` | `createReportPlugin` factory |
| `packages/core/src/participant-report-plugin.ts` | `createParticipantReportPlugin` factory |
| `packages/core/src/tracker.ts` | `createTracker` factory |
| `packages/core/src/index.ts` | Public API barrel |
| `packages/core/src/__tests__/observable.test.ts` | Observable unit tests |
| `packages/core/src/__tests__/sync.test.ts` | Sync unit tests |
| `packages/core/src/__tests__/height.test.ts` | Height utility tests |
| `packages/core/src/__tests__/plugin-base.test.ts` | PluginBase tests |
| `packages/core/src/__tests__/presenter-plugin.test.ts` | PresenterPlugin tests |
| `packages/core/src/__tests__/audience-plugin.test.ts` | AudiencePlugin tests |
| `packages/core/src/__tests__/report-plugin.test.ts` | ReportPlugin tests |
| `packages/core/src/__tests__/participant-report-plugin.test.ts` | ParticipantReportPlugin tests |
| `packages/core/src/__tests__/tracker.test.ts` | Tracker tests |

### Modified files (packages/ui/)

| File | Change |
|------|--------|
| `packages/ui/package.json` | Add `@aha/core` dependency |
| `packages/ui/src/sync.ts` | Rewrite to wrap `@aha/core` createSync, mark deprecated |
| `packages/ui/src/zoid/base.ts` | Move types to core, keep zoid components, rewrite `useBaseSlidePlugin` to wrap core |
| `packages/ui/src/zoid/presenter.ts` | Rewrite `usePresenterPlugin` to wrap core, keep zoid `PresenterSlidePluginIframe` |
| `packages/ui/src/zoid/audience.ts` | Rewrite `useAudiencePlugin` to wrap core, keep zoid `AudienceSlidePluginIframe` |
| `packages/ui/src/zoid/report.ts` | Rewrite `useReportPlugin` to wrap core, keep zoid `ReportIframe` |
| `packages/ui/src/zoid/participantReport.ts` | Rewrite `useParticipantReportPlugin` to wrap core, keep zoid component |

---

## Chunk 1: Package Scaffolding & Foundation Primitives

### Task 1: Scaffold `@aha/core` package

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/vitest.config.ts`
- Create: `packages/core/src/index.ts` (empty barrel for now)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@aha/core",
  "version": "1.0.0",
  "description": "Framework-agnostic plugin SDK for AhaSlides slide plugins",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist *.tsbuildinfo",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "typescript": "~5.9.3",
    "vitest": "^4.0.18"
  }
}
```

Write to `packages/core/package.json`.

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ESNext", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "src/__tests__"]
}
```

Write to `packages/core/tsconfig.json`.

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.ts'],
  },
})
```

Write to `packages/core/vitest.config.ts`.

- [ ] **Step 4: Create empty barrel index.ts**

```ts
// @aha/core — Framework-agnostic plugin SDK
// Exports will be added as modules are implemented
```

Write to `packages/core/src/index.ts`.

- [ ] **Step 5: Run npm install to register the new workspace**

Run: `npm install` (from repo root)
Expected: `@aha/core` appears in workspace list, no errors.

- [ ] **Step 6: Verify build works**

Run: `cd packages/core && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add packages/core/
git commit -m "feat: scaffold @aha/core package with build and test config"
```

---

### Task 2: Implement Observable (internal primitive)

**Files:**
- Create: `packages/core/src/observable.ts`
- Create: `packages/core/src/__tests__/observable.test.ts`

- [ ] **Step 1: Write failing tests for Observable**

```ts
// packages/core/src/__tests__/observable.test.ts
import { describe, it, expect, vi } from 'vitest'
import { Observable } from '../observable'

describe('Observable', () => {
  it('stores and returns initial value', () => {
    const obs = new Observable(42)
    expect(obs.get()).toBe(42)
  })

  it('updates value on set', () => {
    const obs = new Observable('hello')
    obs.set('world')
    expect(obs.get()).toBe('world')
  })

  it('notifies subscribers on set', () => {
    const obs = new Observable(0)
    const fn = vi.fn()
    obs.subscribe(fn)
    obs.set(1)
    expect(fn).toHaveBeenCalledWith(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('supports multiple subscribers', () => {
    const obs = new Observable('a')
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    obs.subscribe(fn1)
    obs.subscribe(fn2)
    obs.set('b')
    expect(fn1).toHaveBeenCalledWith('b')
    expect(fn2).toHaveBeenCalledWith('b')
  })

  it('unsubscribes correctly', () => {
    const obs = new Observable(0)
    const fn = vi.fn()
    const unsub = obs.subscribe(fn)
    unsub()
    obs.set(1)
    expect(fn).not.toHaveBeenCalled()
  })

  it('destroy clears all subscribers', () => {
    const obs = new Observable(0)
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    obs.subscribe(fn1)
    obs.subscribe(fn2)
    obs.destroy()
    obs.set(1)
    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).not.toHaveBeenCalled()
  })

  it('works with object values', () => {
    const obs = new Observable<{ name: string }>({ name: 'Alice' })
    const fn = vi.fn()
    obs.subscribe(fn)
    obs.set({ name: 'Bob' })
    expect(obs.get()).toEqual({ name: 'Bob' })
    expect(fn).toHaveBeenCalledWith({ name: 'Bob' })
  })

  it('works with undefined initial value', () => {
    const obs = new Observable<string | undefined>(undefined)
    expect(obs.get()).toBeUndefined()
    obs.set('value')
    expect(obs.get()).toBe('value')
  })
})
```

Write to `packages/core/src/__tests__/observable.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && npx vitest run src/__tests__/observable.test.ts`
Expected: FAIL — cannot find module `../observable`

- [ ] **Step 3: Implement Observable**

```ts
// packages/core/src/observable.ts
export type Unsubscribe = () => void

export class Observable<T> {
  private value: T
  private listeners: Set<(value: T) => void> = new Set()

  constructor(initialValue: T) {
    this.value = initialValue
  }

  get(): T {
    return this.value
  }

  set(newValue: T): void {
    this.value = newValue
    this.listeners.forEach(fn => fn(newValue))
  }

  subscribe(fn: (value: T) => void): Unsubscribe {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  destroy(): void {
    this.listeners.clear()
  }
}
```

Write to `packages/core/src/observable.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run src/__tests__/observable.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/observable.ts packages/core/src/__tests__/observable.test.ts
git commit -m "feat(core): add Observable internal primitive with tests"
```

---

### Task 3: Implement types.ts

**Files:**
- Create: `packages/core/src/types.ts`

- [ ] **Step 1: Create types file**

Consolidate all shared interfaces from `packages/ui/src/zoid/base.ts`, `presenter.ts`, `audience.ts`, `report.ts`, `participantReport.ts`, and `image.ts`. Reference the spec sections 3-10.

Key types to include:
- `Unsubscribe` (re-export from observable)
- `PluginBaseOptions`
- `PluginKeyboardEvent`
- `ConfirmModalPayload`
- `ImageUploadResult`
- `ParticipantInfo`
- `SyncChannel<T>`, `SyncReadOnlyChannel<T>`
- `PluginBase`, `PresenterPlugin`, `AudiencePlugin`, `ReportPlugin`, `ParticipantReportPlugin`
- `TrackerOptions`, `Tracker`
- Existing xprops interfaces: `BaseSlidePluginProps`, `SlidePluginProps`, `AudienceSlidePluginProps`, `ReportProps`, `ParticipantReportPluginProps`

Copy all interface definitions from the spec verbatim. For the xprops interfaces, copy from the current `@aha/ui` source but fix the known issues (add `participantInfo` to audience, add `upsertSlideAttributeAction` to presenter props).

Write to `packages/core/src/types.ts`.

- [ ] **Step 2: Export from barrel**

Add to `packages/core/src/index.ts`:
```ts
export * from './types'
```

- [ ] **Step 3: Verify types compile**

Run: `cd packages/core && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/types.ts packages/core/src/index.ts
git commit -m "feat(core): add all shared type definitions"
```

---

### Task 4: Implement utils.ts (throttle) and height.ts

**Files:**
- Create: `packages/core/src/utils.ts`
- Create: `packages/core/src/height.ts`
- Create: `packages/core/src/__tests__/height.test.ts`

- [ ] **Step 1: Copy throttle from @aha/ui**

Copy `packages/ui/src/utils.ts` to `packages/core/src/utils.ts` unchanged. This is internal-only, not exported from the barrel.

- [ ] **Step 2: Write failing tests for height utilities**

```ts
// packages/core/src/__tests__/height.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reportHeight, autoReportHeight } from '../height'

describe('reportHeight', () => {
  beforeEach(() => {
    // Reset xprops
    ;(window as any).xprops = undefined
  })

  afterEach(() => {
    delete (window as any).xprops
  })

  it('does nothing if window.xprops is undefined', () => {
    expect(() => reportHeight()).not.toThrow()
  })

  it('does nothing if onHeightChange is not a function', () => {
    ;(window as any).xprops = {}
    expect(() => reportHeight()).not.toThrow()
  })

  it('reports scrollHeight of #app element', () => {
    const onHeightChange = vi.fn()
    ;(window as any).xprops = { onHeightChange }

    const app = document.createElement('div')
    app.id = 'app'
    Object.defineProperty(app, 'scrollHeight', { value: 500 })
    document.body.appendChild(app)

    reportHeight()
    expect(onHeightChange).toHaveBeenCalledWith(500)

    document.body.removeChild(app)
  })
})

describe('autoReportHeight', () => {
  beforeEach(() => {
    ;(window as any).xprops = undefined
  })

  afterEach(() => {
    delete (window as any).xprops
  })

  it('returns cleanup function when xprops is undefined', () => {
    const cleanup = autoReportHeight()
    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('returns cleanup function when onHeightChange is not present', () => {
    ;(window as any).xprops = {}
    const cleanup = autoReportHeight()
    expect(typeof cleanup).toBe('function')
    cleanup()
  })
})
```

Write to `packages/core/src/__tests__/height.test.ts`.

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd packages/core && npx vitest run src/__tests__/height.test.ts`
Expected: FAIL — cannot find module `../height`

- [ ] **Step 4: Implement height.ts**

Copy `reportHeight`, `autoReportHeight`, and the `sharedReportingState` from `packages/ui/src/zoid/base.ts` (lines 144-256). Import `throttle` from `./utils`. No other changes needed — this code is already vanilla JS.

Write to `packages/core/src/height.ts`.

- [ ] **Step 5: Export from barrel**

Add to `packages/core/src/index.ts`:
```ts
export { reportHeight, autoReportHeight } from './height'
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run src/__tests__/height.test.ts`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/utils.ts packages/core/src/height.ts packages/core/src/__tests__/height.test.ts packages/core/src/index.ts
git commit -m "feat(core): add height utilities and throttle"
```

---

### Task 5: Implement createSync / createSyncReadOnly

**Files:**
- Create: `packages/core/src/sync.ts`
- Create: `packages/core/src/__tests__/sync.test.ts`

- [ ] **Step 1: Write failing tests for createSync**

```ts
// packages/core/src/__tests__/sync.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSync, createSyncReadOnly } from '../sync'

// Mock BroadcastChannel for jsdom
class MockBroadcastChannel {
  name: string
  onmessage: ((event: MessageEvent) => void) | null = null
  static instances: MockBroadcastChannel[] = []
  closed = false

  constructor(name: string) {
    this.name = name
    MockBroadcastChannel.instances.push(this)
  }

  postMessage(data: any) {
    // Simulate broadcasting to other instances with same name
    MockBroadcastChannel.instances
      .filter(i => i !== this && i.name === this.name && !i.closed)
      .forEach(i => {
        if (i.onmessage) {
          i.onmessage(new MessageEvent('message', { data }))
        }
      })
  }

  close() {
    this.closed = true
  }
}

beforeEach(() => {
  MockBroadcastChannel.instances = []
  ;(globalThis as any).BroadcastChannel = MockBroadcastChannel
})

afterEach(() => {
  delete (globalThis as any).BroadcastChannel
})

describe('createSync', () => {
  it('returns initial state', () => {
    const sync = createSync('test', 42)
    expect(sync.getState()).toBe(42)
    sync.destroy()
  })

  it('updates state via setState', () => {
    const sync = createSync('test', 'hello')
    sync.setState('world')
    expect(sync.getState()).toBe('world')
    sync.destroy()
  })

  it('notifies subscribers on local setState', () => {
    // Note: onStateChange fires on BOTH local and remote changes.
    // The spec JSDoc says "changes from other tabs" but local notification
    // is required for framework adapters (e.g., Vue wrapper watches this).
    const sync = createSync('test', 0)
    const fn = vi.fn()
    sync.onStateChange(fn)
    sync.setState(1)
    expect(fn).toHaveBeenCalledWith(1)
    sync.destroy()
  })

  it('broadcasts setState to other channels with same name', () => {
    const sync1 = createSync('shared', 'a')
    const sync2 = createSync('shared', 'a')
    const fn = vi.fn()
    sync2.onStateChange(fn)

    sync1.setState('b')
    expect(fn).toHaveBeenCalledWith('b')
    expect(sync2.getState()).toBe('b')

    sync1.destroy()
    sync2.destroy()
  })

  it('does not echo back received messages as broadcasts', () => {
    const sync1 = createSync('shared', 0)
    const sync2 = createSync('shared', 0)

    // Count how many times sync1's BroadcastChannel.postMessage is called
    const bc1 = MockBroadcastChannel.instances[0]
    const originalPost = bc1.postMessage.bind(bc1)
    const postSpy = vi.fn(originalPost)
    bc1.postMessage = postSpy

    // sync2 sets state → broadcasts to sync1 → sync1 should NOT re-broadcast
    sync2.setState(99)

    // sync1's postMessage should NOT have been called (no echo)
    expect(postSpy).not.toHaveBeenCalled()

    sync1.destroy()
    sync2.destroy()
  })

  it('unsubscribes correctly', () => {
    const sync = createSync('test', 0)
    const fn = vi.fn()
    const unsub = sync.onStateChange(fn)
    unsub()
    sync.setState(1)
    expect(fn).not.toHaveBeenCalled()
    sync.destroy()
  })

  it('destroy closes BroadcastChannel', () => {
    const sync = createSync('test', 0)
    const bc = MockBroadcastChannel.instances[0]
    expect(bc.closed).toBe(false)
    sync.destroy()
    expect(bc.closed).toBe(true)
  })

  it('handles object values with deep clone', () => {
    const sync = createSync('test', { count: 0 })
    const fn = vi.fn()
    sync.onStateChange(fn)

    sync.setState({ count: 1 })
    expect(sync.getState()).toEqual({ count: 1 })
    sync.destroy()
  })
})

describe('createSyncReadOnly', () => {
  it('returns initial state', () => {
    const sync = createSyncReadOnly('test', 42)
    expect(sync.getState()).toBe(42)
    sync.destroy()
  })

  it('receives updates from other channels', () => {
    const writer = createSync('shared', 'a')
    const reader = createSyncReadOnly('shared', 'a')
    const fn = vi.fn()
    reader.onStateChange(fn)

    writer.setState('b')
    expect(fn).toHaveBeenCalledWith('b')
    expect(reader.getState()).toBe('b')

    writer.destroy()
    reader.destroy()
  })

  it('does not have setState method', () => {
    const sync = createSyncReadOnly('test', 0)
    expect((sync as any).setState).toBeUndefined()
    sync.destroy()
  })

  it('destroy closes BroadcastChannel', () => {
    const sync = createSyncReadOnly('test', 0)
    const bc = MockBroadcastChannel.instances[0]
    sync.destroy()
    expect(bc.closed).toBe(true)
  })
})
```

Write to `packages/core/src/__tests__/sync.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && npx vitest run src/__tests__/sync.test.ts`
Expected: FAIL — cannot find module `../sync`

- [ ] **Step 3: Implement createSync and createSyncReadOnly**

```ts
// packages/core/src/sync.ts
import { Observable, type Unsubscribe } from './observable'
import type { SyncChannel, SyncReadOnlyChannel } from './types'

export function createSync<T>(name: string, initialState: T): SyncChannel<T> {
  const observable = new Observable<T>(initialState)
  const bc = new BroadcastChannel(name)
  // Flag to distinguish remote updates from local ones.
  // When true, setState skips broadcasting (the message came FROM BroadcastChannel).
  let isReceiving = false

  bc.onmessage = (event: MessageEvent) => {
    if (event.data !== undefined) {
      const current = observable.get()
      if (JSON.stringify(event.data) !== JSON.stringify(current)) {
        isReceiving = true
        // Use setState (not observable.set) so subscribers are notified
        // and the isReceiving guard prevents re-broadcasting.
        setState(event.data)
        isReceiving = false
      }
    }
  }

  function setState(value: T): void {
    observable.set(value)
    if (!isReceiving) {
      bc.postMessage(JSON.parse(JSON.stringify(value)))
    }
  }

  return {
    getState(): T {
      return observable.get()
    },
    setState,
    onStateChange(fn: (value: T) => void): Unsubscribe {
      return observable.subscribe(fn)
    },
    destroy(): void {
      bc.close()
      observable.destroy()
    },
  }
}

export function createSyncReadOnly<T>(name: string, initialState: T): SyncReadOnlyChannel<T> {
  const observable = new Observable<T>(initialState)
  const bc = new BroadcastChannel(name)

  bc.onmessage = (event: MessageEvent) => {
    if (event.data !== undefined) {
      observable.set(event.data)
    }
  }

  return {
    getState(): T {
      return observable.get()
    },
    onStateChange(fn: (value: T) => void): Unsubscribe {
      return observable.subscribe(fn)
    },
    destroy(): void {
      bc.close()
      observable.destroy()
    },
  }
}
```

Write to `packages/core/src/sync.ts`.

- [ ] **Step 4: Export from barrel**

Add to `packages/core/src/index.ts`:
```ts
export { createSync, createSyncReadOnly } from './sync'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run src/__tests__/sync.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/sync.ts packages/core/src/__tests__/sync.test.ts packages/core/src/index.ts
git commit -m "feat(core): add createSync and createSyncReadOnly with tests"
```

---

## Chunk 2: Plugin Factories

### Task 6: Implement createPluginBase

**Files:**
- Create: `packages/core/src/plugin-base.ts`
- Create: `packages/core/src/__tests__/plugin-base.test.ts`

- [ ] **Step 1: Write failing tests**

Tests should cover:
- Reading initial xprops values into getters
- `init()` registers `xprops.onProps` and routes updates to correct subscriptions
- `init()` with `autoHeight: true` calls `autoReportHeight`
- `init()` with `autoHeight: false` calls `xprops.onHeightChange(null)`
- Action pass-throughs (`subscribeTopic`, `unsubscribeTopic`, `trackGA4AndMixpanel`, `getValues`) call the xprops functions
- Actions are no-ops when xprops functions are not provided
- `destroy()` cleans up

Mock `window.xprops` before each test:
```ts
beforeEach(() => {
  ;(window as any).xprops = {
    presentation: { id: '123', language: 'en' },
    slide: { id: '1', version: 1 },
    baseUrl: 'https://api.example.com',
    presentationColorPalette: ['#ff0000'],
    presentationLighterColorPalette: ['#ff9999'],
    onHeightChange: vi.fn(),
    onProps: vi.fn(),
    subscribeTopic: vi.fn(),
    unsubscribeTopic: vi.fn(),
    trackGA4AndMixpanel: vi.fn(),
    getValues: vi.fn(),
  }
})
```

Write to `packages/core/src/__tests__/plugin-base.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && npx vitest run src/__tests__/plugin-base.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement createPluginBase**

Implementation reads `window.xprops` and creates Observables for each state property. `init()`:
1. Registers `xprops.onProps()` callback that routes `newProps.presentation` → presentation observable, etc.
2. Sets up auto-height if configured
3. Stores cleanup function from `autoReportHeight`

`destroy()`:
1. Calls height cleanup
2. Calls `destroy()` on all observables

Action methods are direct pass-throughs to xprops functions with undefined guards.

Write to `packages/core/src/plugin-base.ts`.

- [ ] **Step 4: Export from barrel**

Add to `packages/core/src/index.ts`:
```ts
export { createPluginBase } from './plugin-base'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run src/__tests__/plugin-base.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/plugin-base.ts packages/core/src/__tests__/plugin-base.test.ts packages/core/src/index.ts
git commit -m "feat(core): add createPluginBase with xprops state management"
```

---

### Task 7: Implement createPresenterPlugin

**Files:**
- Create: `packages/core/src/presenter-plugin.ts`
- Create: `packages/core/src/__tests__/presenter-plugin.test.ts`

- [ ] **Step 1: Write failing tests**

Tests should cover:
- Inherits all PluginBase behavior (can test a subset — getPresentation, onSlideChange)
- `getCurrentUser()` reads from `xprops.currentUser`
- `onCurrentUserChange()` fires when xprops.onProps delivers `currentUser`
- `getSlideAttributes()` calls `xprops.getSlideAttributesAction` and reduces array to object
- `getSlideAttributes()` returns response as-is if not an array
- `setSubmissionCount({ count: 5, tooltip: 'hi' })` calls `xprops.sendVoteOutcome({ voteCount: 5, tooltip: 'hi' })`
- `getAccessToken()` reads `xprops.token`
- Action pass-throughs: `uploadImage`, `openUploadImageModal`, `openEditImageModal`, `onKeyboard`, `emitKeyboardEvent`, `showToastInfo/Success/Error`, `openPluginModal`, `closePluginModal`, `showConfirmModal`, `clearSlideData`, `allowPDFRender`, `upsertSlideAttribute`
- Default `autoHeight: false`

Mock xprops with presenter-specific props:
```ts
;(window as any).xprops = {
  ...baseXprops,
  currentUser: { presenterLanguage: 'en' },
  getSlideAttributesAction: vi.fn(),
  upsertSlideAttributeAction: vi.fn(),
  uploadImage: vi.fn(),
  openUploadImageModal: vi.fn(),
  openEditImageModal: vi.fn(),
  onKeyboard: vi.fn(),
  emitKeyboardEvent: vi.fn(),
  showToastInfo: vi.fn(),
  showToastSuccess: vi.fn(),
  showToastError: vi.fn(),
  sendVoteOutcome: vi.fn(),
  openPluginModal: vi.fn(),
  closePluginModal: vi.fn(),
  showConfirmModal: vi.fn(),
  clearSlideData: vi.fn(),
  allowPDFRender: vi.fn(),
  token: 'abc-token',
}
```

Write to `packages/core/src/__tests__/presenter-plugin.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && npx vitest run src/__tests__/presenter-plugin.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement createPresenterPlugin**

Calls `createPluginBase(options)` internally. Adds:
- `currentUser` Observable, populated from `xprops.currentUser`, updated in extended `onProps` callback
- `getSlideAttributes()` with array-to-object reduction
- All action pass-throughs from xprops

Write to `packages/core/src/presenter-plugin.ts`.

- [ ] **Step 4: Export from barrel**

Add to `packages/core/src/index.ts`:
```ts
export { createPresenterPlugin } from './presenter-plugin'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run src/__tests__/presenter-plugin.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/presenter-plugin.ts packages/core/src/__tests__/presenter-plugin.test.ts packages/core/src/index.ts
git commit -m "feat(core): add createPresenterPlugin with tests"
```

---

### Task 8: Implement createAudiencePlugin

**Files:**
- Create: `packages/core/src/audience-plugin.ts`
- Create: `packages/core/src/__tests__/audience-plugin.test.ts`

- [ ] **Step 1: Write failing tests**

Tests should cover:
- Inherits PluginBase behavior
- Audience-specific state: `getSlideAttributes`, `getAudienceName`, `getAudienceEmoji`, `getAudienceId`, `getAudienceEmail`, `getAudienceTeam`, `getParticipantInfo`, `getTimeLimit`
- Subscriptions fire correctly when `onProps` delivers audience data
- Default `autoHeight: true`
- Action pass-throughs: `uploadImage`, `showToast*`, `updateAudienceData`, `openPluginModal`, `closePluginModal`, `onSubmitButtonHeightChange`, `scrollTo`

Mock xprops:
```ts
;(window as any).xprops = {
  ...baseXprops,
  audience: {
    audienceName: 'Alice',
    audienceEmoji: '😀',
    audienceId: 42,
    audienceEmail: 'alice@test.com',
    audienceTeam: 'Team A',
    participantInfo: [{ type: 'email', value: 'alice@test.com' }],
  },
  slideAttributes: { key1: 'val1' },
  timeLimit: 30,
  uploadImage: vi.fn(),
  showToastInfo: vi.fn(),
  showToastSuccess: vi.fn(),
  showToastError: vi.fn(),
  updateAudienceData: vi.fn(),
  openPluginModal: vi.fn(),
  closePluginModal: vi.fn(),
  onSubmitButtonHeightChange: vi.fn(),
  scrollTo: vi.fn(),
}
```

Write to `packages/core/src/__tests__/audience-plugin.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && npx vitest run src/__tests__/audience-plugin.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement createAudiencePlugin**

Calls `createPluginBase({ autoHeight: options?.autoHeight ?? true })` and extends with audience-specific Observables. The `onProps` callback routes `audience.*`, `slideAttributes`, and `timeLimit` to their observables.

Write to `packages/core/src/audience-plugin.ts`.

- [ ] **Step 4: Export from barrel**

Add to `packages/core/src/index.ts`:
```ts
export { createAudiencePlugin } from './audience-plugin'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run src/__tests__/audience-plugin.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/audience-plugin.ts packages/core/src/__tests__/audience-plugin.test.ts packages/core/src/index.ts
git commit -m "feat(core): add createAudiencePlugin with tests"
```

---

### Task 9: Implement createReportPlugin

**Files:**
- Create: `packages/core/src/report-plugin.ts`
- Create: `packages/core/src/__tests__/report-plugin.test.ts`

- [ ] **Step 1: Write failing tests**

Tests should cover:
- State: `getToken`, `getCurrentLanguage`, `getLocale`, `getTranslationMap`, `getFeatureFlags`, `getIframePath`, `getCurrentUser`
- Subscriptions fire on `onProps` delivery
- Default `autoHeight: true`
- Action pass-throughs: `trackGA4AndMixpanel` (**two-arg version** `(eventName, payload)` for report — different from PluginBase's single-arg version), `replaceRoute`, `pushRoute`, `openExportModalForPresentation`, `reportHeight`
- **Does NOT** have presentation/slide/baseUrl (no PluginBase)
- Test must verify `trackGA4AndMixpanel` passes both args to xprops:
  ```ts
  plugin.trackGA4AndMixpanel('event_name', { key: 'value' })
  expect(xprops.trackGA4AndMixpanel).toHaveBeenCalledWith('event_name', { key: 'value' })
  ```

Mock xprops:
```ts
;(window as any).xprops = {
  token: 'report-token',
  currentLanguage: 'en',
  locale: 'en-US',
  translationMap: { hello: 'Hello' },
  featureFlags: { flagA: 'true' },
  iframePath: '/report/123',
  currentUser: { name: 'Admin' },
  onHeightChange: vi.fn(),
  onProps: vi.fn(),
  trackGA4AndMixpanel: vi.fn(),
  replaceRoute: vi.fn(),
  pushRoute: vi.fn(),
  openExportModalForPresentation: vi.fn(),
}
```

Write to `packages/core/src/__tests__/report-plugin.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && npx vitest run src/__tests__/report-plugin.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement createReportPlugin**

Standalone implementation (NOT extending createPluginBase). Creates Observables for each prop, registers `xprops.onProps` in `init()`, handles auto-height.

Write to `packages/core/src/report-plugin.ts`.

- [ ] **Step 4: Export from barrel**

Add to `packages/core/src/index.ts`:
```ts
export { createReportPlugin } from './report-plugin'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run src/__tests__/report-plugin.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/report-plugin.ts packages/core/src/__tests__/report-plugin.test.ts packages/core/src/index.ts
git commit -m "feat(core): add createReportPlugin with tests"
```

---

### Task 10: Implement createParticipantReportPlugin

**Files:**
- Create: `packages/core/src/participant-report-plugin.ts`
- Create: `packages/core/src/__tests__/participant-report-plugin.test.ts`

- [ ] **Step 1: Write failing tests**

Tests should cover:
- State: `getAnswers`, `getImageUrl`, `getPresentationColorPalette`
- Subscriptions fire on `onProps`
- Default `autoHeight: true`
- `reportHeight` works

Mock xprops:
```ts
;(window as any).xprops = {
  answers: [{ id: 1, text: 'Answer 1' }],
  imageUrl: 'https://example.com/img.png',
  presentationColorPalette: { primary: '#ff0000' },
  onHeightChange: vi.fn(),
  onProps: vi.fn(),
}
```

Write to `packages/core/src/__tests__/participant-report-plugin.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && npx vitest run src/__tests__/participant-report-plugin.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement createParticipantReportPlugin**

Standalone implementation. Observables for answers, imageUrl, presentationColorPalette. `init()` registers `onProps` and auto-height.

Write to `packages/core/src/participant-report-plugin.ts`.

- [ ] **Step 4: Export from barrel**

Add to `packages/core/src/index.ts`:
```ts
export { createParticipantReportPlugin } from './participant-report-plugin'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run src/__tests__/participant-report-plugin.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/participant-report-plugin.ts packages/core/src/__tests__/participant-report-plugin.test.ts packages/core/src/index.ts
git commit -m "feat(core): add createParticipantReportPlugin with tests"
```

---

### Task 11: Implement createTracker

**Files:**
- Create: `packages/core/src/tracker.ts`
- Create: `packages/core/src/__tests__/tracker.test.ts`

- [ ] **Step 1: Write failing tests**

Tests should cover:
- Attaches click listener by default
- Constructs event name: `{action}_{name}_{otherInfo}`
- Calls `xprops.trackGA4AndMixpanel` with event name and custom props
- Supports multiple event types
- `updateProps()` changes custom props for subsequent events
- `destroy()` removes all listeners
- `view` event uses IntersectionObserver

**Note:** jsdom does not provide `IntersectionObserver`. Add a mock in the test setup:
```ts
beforeEach(() => {
  const mockObserve = vi.fn()
  const mockUnobserve = vi.fn()
  const mockDisconnect = vi.fn()
  ;(globalThis as any).IntersectionObserver = vi.fn(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }))
})
```

Write to `packages/core/src/__tests__/tracker.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && npx vitest run src/__tests__/tracker.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement createTracker**

Port the event name construction logic from `packages/ui/src/tracking.ts` (the `EVENT_ACTIONS` mapping, `_getTrackingEventName` pattern). For `view` events, use `IntersectionObserver`. All other events use `addEventListener`.

Write to `packages/core/src/tracker.ts`.

- [ ] **Step 4: Export from barrel**

Add to `packages/core/src/index.ts`:
```ts
export { createTracker } from './tracker'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run src/__tests__/tracker.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/tracker.ts packages/core/src/__tests__/tracker.test.ts packages/core/src/index.ts
git commit -m "feat(core): add createTracker for vanilla action tracking"
```

---

### Task 12: Final @aha/core build verification

- [ ] **Step 1: Run all core tests**

Run: `cd packages/core && npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Build the package**

Run: `cd packages/core && npx tsc`
Expected: `dist/` directory created with all .js and .d.ts files, no errors

- [ ] **Step 3: Verify Turborepo integration**

Run: `npm run build --filter=@aha/core` (from repo root)
Expected: Build succeeds

- [ ] **Step 4: Commit if any changes needed**

```bash
git add -A && git commit -m "chore(core): finalize @aha/core package build"
```

---

## Chunk 3: @aha/ui Backward Compatibility Layer

### Task 13: Add @aha/core dependency to @aha/ui

**Files:**
- Modify: `packages/ui/package.json`

- [ ] **Step 1: Add dependency**

Add `"@aha/core": "*"` to the `dependencies` object in `packages/ui/package.json`.

- [ ] **Step 2: Run npm install**

Run: `npm install` (from repo root)
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/ui/package.json package-lock.json
git commit -m "chore(ui): add @aha/core as dependency"
```

---

### Task 14: Rewrite @aha/ui sync.ts as deprecated wrapper

**Files:**
- Modify: `packages/ui/src/sync.ts`

- [ ] **Step 1: Rewrite sync.ts**

Replace contents with the wrapper implementation from the spec (section "Example: useSync wrapping createSync"). Both `useSync` and `useSyncReadOnly` wrap `@aha/core`'s `createSync` / `createSyncReadOnly`.

Key differences from current implementation:
- Adds `onUnmounted` cleanup (bug fix — see spec Known Issues #1)
- Delegates BroadcastChannel management to `@aha/core`
- Handles dynamic channel names (Ref) by watching and recreating core sync

Both functions get `@deprecated` JSDoc tags pointing to `@aha/core`.

Write to `packages/ui/src/sync.ts`.

- [ ] **Step 2: Verify @aha/ui builds**

Run: `npm run build --filter=@aha/ui` (from repo root)
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/sync.ts
git commit -m "refactor(ui): rewrite useSync/useSyncReadOnly as @aha/core wrappers"
```

---

### Task 15: Rewrite @aha/ui base.ts — move types, keep zoid, wrap hook

**Files:**
- Modify: `packages/ui/src/zoid/base.ts`

- [ ] **Step 1: Rewrite base.ts**

1. Remove `reportHeight`, `autoReportHeight`, `sharedReportingState`, `throttle` import — these now come from `@aha/core`
2. Re-export types from `@aha/core`: `export type { PluginKeyboardEvent, ImageUploadResult, PluginBaseOptions } from '@aha/core'`. Keep `BaseSlidePluginProps` and `BaseSlidePluginReturn` defined locally since `BaseSlidePluginReturn` uses Vue `Ref` types.
3. Re-export height functions: `export { reportHeight, autoReportHeight } from '@aha/core'`
4. Keep `UseSlidePluginOptions` as a deprecated alias: `/** @deprecated Use PluginBaseOptions from @aha/core */ export type UseSlidePluginOptions = PluginBaseOptions`
5. Rewrite `useBaseSlidePlugin` to wrap `createPluginBase` from `@aha/core`:
   - Create core plugin base
   - Create refs from initial getters
   - In `onMounted`, call `plugin.init()` and subscribe to changes
   - In `onUnmounted`, unsubscribe and call `plugin.destroy()`
   - Pass `onPropsExtension` callback by subscribing to the core plugin's observables
6. Keep the `BaseSlidePluginReturn` interface (uses Vue `Ref`) but mark `useBaseSlidePlugin` as `@deprecated`

Write to `packages/ui/src/zoid/base.ts`.

- [ ] **Step 2: Verify build**

Run: `npm run build --filter=@aha/ui`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/zoid/base.ts
git commit -m "refactor(ui): rewrite useBaseSlidePlugin as @aha/core wrapper"
```

---

### Task 16: Rewrite @aha/ui presenter.ts — wrap hook, keep zoid component

**Files:**
- Modify: `packages/ui/src/zoid/presenter.ts`

- [ ] **Step 1: Rewrite presenter.ts**

1. Keep `PresenterSlidePluginIframe` zoid component definition unchanged
2. Keep `SlidePluginProps` interface but re-export types from core where applicable
3. Keep `PresenterPluginReturn` interface (uses Vue `Ref`)
4. Rewrite `usePresenterPlugin` to wrap `createPresenterPlugin` from `@aha/core`:
   - Create core plugin
   - Create refs from initial getters (presentationProps, slideProps, currentUserProps, baseUrl, etc.)
   - In `onMounted`, call `plugin.init()` and subscribe to all changes
   - In `onUnmounted`, unsubscribe and destroy
   - Map action pass-throughs
   - Mark with `@deprecated`

Write to `packages/ui/src/zoid/presenter.ts`.

- [ ] **Step 2: Verify build**

Run: `npm run build --filter=@aha/ui`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/zoid/presenter.ts
git commit -m "refactor(ui): rewrite usePresenterPlugin as @aha/core wrapper"
```

---

### Task 17: Rewrite @aha/ui audience.ts — wrap hook, keep zoid component

**Files:**
- Modify: `packages/ui/src/zoid/audience.ts`

- [ ] **Step 1: Rewrite audience.ts**

Same pattern as Task 16 but for `useAudiencePlugin`:
1. Keep `AudienceSlidePluginIframe` zoid component
2. Keep `AudienceSlidePluginProps` (fix: add `participantInfo` to the `audience` type)
3. Rewrite `useAudiencePlugin` to wrap `createAudiencePlugin` from `@aha/core`
4. Create refs for all audience-specific state
5. Mark with `@deprecated`

Write to `packages/ui/src/zoid/audience.ts`.

- [ ] **Step 2: Verify build**

Run: `npm run build --filter=@aha/ui`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/zoid/audience.ts
git commit -m "refactor(ui): rewrite useAudiencePlugin as @aha/core wrapper"
```

---

### Task 18: Rewrite @aha/ui report.ts and participantReport.ts

**Files:**
- Modify: `packages/ui/src/zoid/report.ts`
- Modify: `packages/ui/src/zoid/participantReport.ts`

- [ ] **Step 1: Rewrite report.ts**

Same pattern: keep `ReportIframe` zoid component, rewrite `useReportPlugin` to wrap `createReportPlugin` from `@aha/core`. Mark deprecated.

- [ ] **Step 2: Rewrite participantReport.ts**

Keep `ParticipantReportPluginIframe` zoid component, rewrite `useParticipantReportPlugin` to wrap `createParticipantReportPlugin`. Mark deprecated.

- [ ] **Step 3: Verify build**

Run: `npm run build --filter=@aha/ui`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/zoid/report.ts packages/ui/src/zoid/participantReport.ts
git commit -m "refactor(ui): rewrite useReportPlugin and useParticipantReportPlugin as @aha/core wrappers"
```

---

### Task 18b: Verify @aha/ui barrel re-exports core types

**Files:**
- Verify: `packages/ui/src/index.ts`

- [ ] **Step 1: Check that @aha/core types are re-exported**

Ensure `packages/ui/src/index.ts` (which exports `* from './zoid'`, `* from './sync'`, etc.) transitively re-exports all types that consumers may import from `@aha/ui`. The key types that must be accessible via `import { ... } from '@aha/ui'`:

- `BaseSlidePluginProps`, `SlidePluginProps`, `AudienceSlidePluginProps`, `ReportProps`, `ParticipantReportPluginProps` — re-exported from respective zoid files
- `PluginKeyboardEvent`, `ImageUploadResult`, `ConfirmModalPayload`, `ParticipantInfo` — must be re-exported from base.ts or presenter.ts
- `UseSlidePluginOptions` (deprecated alias for `PluginBaseOptions`) — from base.ts

If any are missing, add explicit re-exports to the appropriate file in `packages/ui/src/zoid/`.

- [ ] **Step 2: Verify with tsc**

Run: `npm run build --filter=@aha/ui`
Expected: Build succeeds, all re-exported types appear in `dist/index.d.ts`

- [ ] **Step 3: Commit if changes needed**

```bash
git add packages/ui/src/
git commit -m "chore(ui): ensure all @aha/core types are re-exported for backward compat"
```

**Assumption:** Turborepo builds `@aha/core` before `@aha/ui` automatically because `@aha/ui` declares `@aha/core` as a dependency. The `turbo.json` `build.dependsOn: ["^build"]` config handles this. No `turbo.json` changes needed.

---

## Chunk 4: Integration Verification

### Task 19: Full build verification

- [ ] **Step 1: Build all packages**

Run: `npm run build` (from repo root)
Expected: All packages build successfully via Turborepo, including @aha/core → @aha/ui dependency chain

- [ ] **Step 2: Commit if any fixes needed**

### Task 20: Run existing tests

- [ ] **Step 1: Run @aha/core tests**

Run: `cd packages/core && npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Run all workspace tests**

Run: `npm run test` (from repo root)
Expected: All existing tests PASS (ranking frontend/backend, pinOnImage frontend, etc.)

- [ ] **Step 3: Run consumer tests**

Run: `npm run test:consumer` (from repo root)
Expected: All consumer contract tests PASS

- [ ] **Step 4: Fix any failures**

If tests fail, investigate and fix. The most likely issues:
- Import paths that changed
- Type mismatches in the backward-compat wrappers
- Missing re-exports

- [ ] **Step 5: Commit fixes if any**

```bash
git add -A && git commit -m "fix: resolve integration test failures"
```

### Task 21: Run E2E tests

- [ ] **Step 1: Run Playwright E2E tests**

Run: `npm run test:e2e`
Expected: All E2E tests PASS

- [ ] **Step 2: Fix any failures and commit**

### Task 22: Final commit and summary

- [ ] **Step 1: Verify clean git status**

Run: `git status`
Expected: No uncommitted changes

- [ ] **Step 2: Review the full diff since start**

Run: `git log --oneline` to verify all commits are clean and well-described
