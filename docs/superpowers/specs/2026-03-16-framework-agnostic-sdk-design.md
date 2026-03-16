# Framework-Agnostic Plugin SDK (`@aha/core`)

## Problem

The AhaSlides slide plugin SDK (`@aha/ui`) is tightly coupled to Vue 3. Plugin authors must use Vue to build plugins, even though the underlying communication layer (zoid xprops + BroadcastChannel) is framework-agnostic. This limits the ecosystem to Vue developers only.

## Goals

1. **New `@aha/core` package** — vanilla JS/TS SDK with zero framework dependencies. Plugin authors using React, Svelte, or vanilla JS import from `@aha/core` directly.
2. **Backward compatibility** — existing Vue 3 plugins (ranking, pinOnImage, ideaBoard) continue to work with `import { ... } from '@aha/ui'` unchanged. Vue composables in `@aha/ui` are marked `@deprecated` and internally delegate to `@aha/core`.
3. **No framework-specific adapter packages** — `@aha/core`'s vanilla API is ergonomic enough to use directly from any framework. No `@aha/react` or `@aha/vue` needed.

## Scope

**Plugin-side SDK only** — what runs inside the plugin iframe. Host-side zoid iframe wrappers (`PresenterSlidePluginIframe`, `AudienceSlidePluginIframe`, etc.) remain in `@aha/ui` unchanged.

**Out of scope**: `@aha/common`, `@aha/api`, `@aha/db`, `@aha/backend-utils` — already framework-agnostic.

## Architecture

### Package Dependency Graph

```
@aha/core          ← NEW: vanilla JS, zero framework deps (no dependencies)

@aha/ui            ← MODIFIED: Vue adapter, re-exports deprecated composables
  ├── @aha/core    ← NEW dependency
  ├── vue          ← (existing)
  ├── zoid         ← (existing, host-side only)
  └── ant-design-vue ← (existing, theme only)

@aha/api           ← unchanged
@aha/db            ← unchanged
@aha/common        ← unchanged
@aha/backend-utils ← unchanged
```

### `@aha/core` File Structure

```
packages/core/
  src/
    index.ts                ← public API barrel
    types.ts                ← all shared interfaces
    observable.ts           ← internal Observable<T> primitive
    sync.ts                 ← createSync, createSyncReadOnly
    plugin-base.ts          ← createPluginBase (shared xprops state management)
    presenter-plugin.ts     ← createPresenterPlugin
    audience-plugin.ts      ← createAudiencePlugin
    report-plugin.ts        ← createReportPlugin
    participant-report-plugin.ts ← createParticipantReportPlugin
    height.ts               ← autoReportHeight, reportHeight
    tracker.ts              ← createTracker (vanilla action tracking)
    utils.ts                ← throttle
  package.json
  tsconfig.json
```

## Detailed Design

### 1. Observable (Internal Primitive)

Not exported publicly. Used by all plugin factories and sync to manage state + subscriptions.

```ts
// observable.ts
type Unsubscribe = () => void

class Observable<T> {
  private value: T
  private listeners: Set<(value: T) => void> = new Set()

  constructor(initialValue: T) {
    this.value = initialValue
  }

  get(): T {
    return this.value
  }

  set(newValue: T) {
    this.value = newValue
    this.listeners.forEach(fn => fn(newValue))
  }

  subscribe(fn: (value: T) => void): Unsubscribe {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  destroy() {
    this.listeners.clear()
  }
}
```

### 2. createSync / createSyncReadOnly

Replaces Vue's `useSync` / `useSyncReadOnly`. Same BroadcastChannel mechanism, vanilla interface.

```ts
// sync.ts
interface SyncChannel<T> {
  /** Get current value */
  getState(): T
  /** Update value and broadcast to other tabs */
  setState(value: T): void
  /** Subscribe to changes from other tabs */
  onStateChange(fn: (value: T) => void): Unsubscribe
  /** Close the BroadcastChannel and clean up */
  destroy(): void
}

interface SyncReadOnlyChannel<T> {
  getState(): T
  onStateChange(fn: (value: T) => void): Unsubscribe
  destroy(): void
}

function createSync<T>(name: string, initialState: T): SyncChannel<T>
function createSyncReadOnly<T>(name: string, initialState: T): SyncReadOnlyChannel<T>
```

**Implementation notes:**
- Uses `Observable<T>` internally
- BroadcastChannel `onmessage` calls `observable.set()` with guard to prevent echo loops
- `setState()` updates the observable AND posts to BroadcastChannel
- JSON serialization round-trip for deep clone (same as current)
- No support for dynamic channel names (unlike Vue version which watches a Ref). For dynamic names, destroy and recreate. This is simpler and the Vue adapter can handle the reactive name watching itself.

### 3. createPluginBase (Shared Foundation)

Shared logic extracted from `useBaseSlidePlugin`. Reads `window.xprops`, manages state via Observables, listens for prop updates.

```ts
// plugin-base.ts
interface PluginBaseOptions {
  /** Auto-report height to parent. Pass string for custom wrapper ID. */
  autoHeight?: boolean | string
}

interface PluginBase {
  // State accessors
  getPresentation(): Record<string, any> | undefined
  getSlide(): Record<string, any> | undefined
  getBaseUrl(): string | undefined
  getPresentationColorPalette(): string[] | undefined
  getPresentationLighterColorPalette(): string[] | undefined

  // State subscriptions
  onPresentationChange(fn: (val: Record<string, any> | undefined) => void): Unsubscribe
  onSlideChange(fn: (val: Record<string, any> | undefined) => void): Unsubscribe
  onBaseUrlChange(fn: (val: string | undefined) => void): Unsubscribe
  onPresentationColorPaletteChange(fn: (val: string[] | undefined) => void): Unsubscribe
  onPresentationLighterColorPaletteChange(fn: (val: string[] | undefined) => void): Unsubscribe

  // Actions (pass-through from xprops)
  reportHeight(): void
  subscribeTopic(options: { type?: string; topic: string; callback: (topic: string, message: any) => void }): void
  unsubscribeTopic(topic: string): void
  /**
   * Track events to GA4 and Mixpanel via the host app.
   * Note: The presenter/audience host xprop accepts a single payload argument `(payload: any) => void`.
   * This wrapper normalizes the call — if the host only accepts one arg, the payload is passed as-is.
   */
  trackGA4AndMixpanel(payload: any): void
  getValues(params: { bucket: string; key?: string }): Promise<{ key: string; path: string; value: string }[]>

  // Lifecycle
  /** Start listening to xprops changes. Call once after DOM is ready. */
  init(): void
  /** Clean up all subscriptions and observers */
  destroy(): void
}

function createPluginBase(options?: PluginBaseOptions): PluginBase
```

**Implementation notes:**
- Constructor reads initial values from `window.xprops` into Observables
- `init()` registers `xprops.onProps()` listener that routes updates to the correct Observable
- `init()` also sets up `autoReportHeight` if configured, or sends `onHeightChange(null)` for full height
- `destroy()` disconnects observers and clears subscriptions
- Actions like `subscribeTopic`, `trackGA4AndMixpanel` are simple pass-throughs — return `undefined` if xprops doesn't provide them
- **Why `init()` is separate from construction**: In Vue, `onMounted` ensures DOM is ready. For vanilla JS, the consumer calls `init()` after their app has mounted. This replaces the implicit `onMounted` lifecycle hook.

### 4. createPresenterPlugin

```ts
// presenter-plugin.ts
interface PresenterPlugin extends PluginBase {
  // Additional state
  getCurrentUser(): Record<string, any> | undefined
  onCurrentUserChange(fn: (val: Record<string, any> | undefined) => void): Unsubscribe

  // Presenter-specific actions
  getSlideAttributes(slideId?: string | number): Promise<Record<string, any>>
  upsertSlideAttribute(payload: { slideId?: string | number; attributeKey: string; attributeValue: any }): Promise<any>
  uploadImage(file: File): Promise<ImageUploadResult>
  openUploadImageModal(): Promise<ImageUploadResult>
  openEditImageModal(currentImageUrl: string): Promise<ImageUploadResult>
  onKeyboard(callback: (event: PluginKeyboardEvent) => void): void
  emitKeyboardEvent(event: PluginKeyboardEvent): void
  showToastInfo(text: string, uniqName?: string, action?: any, options?: any): void
  showToastSuccess(text: string, uniqName?: string, action?: any, options?: any): void
  showToastError(text: string, uniqName?: string, action?: any, options?: any): void
  setSubmissionCount(payload: { count: number; tooltip?: string }): void
  openPluginModal(path?: string): void
  closePluginModal(): void
  showConfirmModal(payload: ConfirmModalPayload): Promise<boolean>
  clearSlideData(slideId: string): Promise<void>
  allowPDFRender(): void
  getAccessToken(): string | undefined
}

function createPresenterPlugin(options?: PluginBaseOptions): PresenterPlugin
```

**Implementation notes:**
- Internally calls `createPluginBase(options)` and extends it
- Default `autoHeight: false` (matching current `usePresenterPlugin` default)
- `getSlideAttributes` includes the array-to-object reduction logic currently in `usePresenterPlugin`
- `setSubmissionCount` maps to `xprops.sendVoteOutcome({ voteCount: payload.count, tooltip: payload.tooltip })` — intentionally does NOT spread the full payload to avoid sending `count` redundantly
- `uploadImage`: The `SlidePluginProps` xprop declares this as `() => Promise<ImageUploadResult>` (zero args, opens a modal). However, the hook return type casts it as `(file: File) => ...`. The core API will match the xprop reality — see `openUploadImageModal()` for the zero-arg variant and `uploadImage(file)` for the file-based variant, both passed through from xprops as-is.
- All actions return `undefined` / are no-ops if the corresponding xprop is not provided

### 5. createAudiencePlugin

```ts
// audience-plugin.ts
interface AudiencePlugin extends PluginBase {
  // Additional state
  getSlideAttributes(): Record<string, any> | undefined
  getAudienceName(): string | undefined
  getAudienceEmoji(): string | undefined
  getAudienceId(): string | number | undefined
  getAudienceEmail(): string | undefined
  getAudienceTeam(): string | undefined
  getParticipantInfo(): ParticipantInfo[] | undefined
  getTimeLimit(): number | null | undefined

  // Subscriptions
  onSlideAttributesChange(fn: (val: Record<string, any> | undefined) => void): Unsubscribe
  onAudienceNameChange(fn: (val: string | undefined) => void): Unsubscribe
  onAudienceEmojiChange(fn: (val: string | undefined) => void): Unsubscribe
  onAudienceIdChange(fn: (val: string | number | undefined) => void): Unsubscribe
  onAudienceEmailChange(fn: (val: string | undefined) => void): Unsubscribe
  onAudienceTeamChange(fn: (val: string | undefined) => void): Unsubscribe
  onParticipantInfoChange(fn: (val: ParticipantInfo[] | undefined) => void): Unsubscribe
  onTimeLimitChange(fn: (val: number | null | undefined) => void): Unsubscribe

  // Actions
  uploadImage(): Promise<any>
  showToastInfo(text: string, uniqName?: string, action?: any, options?: any): void
  showToastSuccess(text: string, uniqName?: string, action?: any, options?: any): void
  showToastError(text: string, uniqName?: string, action?: any, options?: any): void
  updateAudienceData(payload: { audienceName?: string; audienceEmail?: string; audienceEmoji?: string; participantInfo?: ParticipantInfo[] }): void
  openPluginModal(path?: string, data?: any): void
  closePluginModal(): void
  onSubmitButtonHeightChange(height: number): void
  scrollTo(yOffset: number): void
}

function createAudiencePlugin(options?: PluginBaseOptions): AudiencePlugin
```

**Implementation notes:**
- Default `autoHeight: true` (matching current `useAudiencePlugin` default)
- Audience-specific xprops (`audience.audienceName`, `slideAttributes`, `timeLimit`) are routed to their own Observables in the `onProps` listener

### 6. createReportPlugin

```ts
// report-plugin.ts
interface ReportPlugin {
  // State
  getToken(): string | undefined
  getCurrentLanguage(): string | undefined
  getLocale(): string | undefined
  getTranslationMap(): Record<string, string> | undefined
  getFeatureFlags(): Record<string, string> | undefined
  getIframePath(): string | undefined
  getCurrentUser(): object | undefined

  // Subscriptions
  onTokenChange(fn: (val: string | undefined) => void): Unsubscribe
  onCurrentLanguageChange(fn: (val: string | undefined) => void): Unsubscribe
  onLocaleChange(fn: (val: string | undefined) => void): Unsubscribe
  onTranslationMapChange(fn: (val: Record<string, string> | undefined) => void): Unsubscribe
  onFeatureFlagsChange(fn: (val: Record<string, string> | undefined) => void): Unsubscribe
  onIframePathChange(fn: (val: string | undefined) => void): Unsubscribe
  onCurrentUserChange(fn: (val: object | undefined) => void): Unsubscribe

  // Actions
  trackGA4AndMixpanel(eventName: string, payload: any): void
  replaceRoute(location: any, onComplete?: Function, onAbort?: Function): void
  pushRoute(location: any, onComplete?: Function, onAbort?: Function): void
  openExportModalForPresentation(presentation: any): void
  reportHeight(): void

  // Lifecycle
  init(): void
  destroy(): void
}

function createReportPlugin(options?: PluginBaseOptions): ReportPlugin
```

**Implementation notes:**
- Does NOT extend `createPluginBase` because ReportPlugin has a completely different prop set (no presentation/slide/baseUrl). It has its own standalone implementation with the same pattern (Observables + xprops.onProps listener).

### 7. createParticipantReportPlugin

```ts
// participant-report-plugin.ts
interface ParticipantReportPlugin {
  getAnswers(): any[] | undefined
  getImageUrl(): string | undefined
  getPresentationColorPalette(): object | undefined
  onAnswersChange(fn: (val: any[] | undefined) => void): Unsubscribe
  onImageUrlChange(fn: (val: string | undefined) => void): Unsubscribe
  onPresentationColorPaletteChange(fn: (val: object | undefined) => void): Unsubscribe
  reportHeight(): void
  init(): void
  destroy(): void
}

function createParticipantReportPlugin(options?: PluginBaseOptions): ParticipantReportPlugin
```

**Implementation notes:**
- Default `autoHeight: true` (matching current `useParticipantReportPlugin` default)
- `imageUrl` and `presentationColorPalette` are included — they exist in the zoid prop definition and host passes them

### 8. Height Utilities

Moved from `@aha/ui` base.ts. Already vanilla JS — just relocated.

```ts
// height.ts
function reportHeight(): void
function autoReportHeight(wrapperId?: string): () => void
```

No changes to implementation.

### 9. createTracker (Action Tracking)

Replaces the Vue `vEmitAction` directive with a vanilla JS function-based API.

```ts
// tracker.ts
interface TrackerOptions {
  /** Element to attach event listeners to */
  element: HTMLElement
  /** Events to track. Default: ['click'] */
  events?: ('click' | 'mouseenter' | 'dblclick' | 'focus' | 'blur' | 'change' | 'submit' | 'view')[]
  /** The object name for the tracking event */
  name?: string
  /** Additional info appended to event name */
  otherInfo?: string
  /** Custom properties sent with each event */
  customProps?: Record<string, any>
}

interface Tracker {
  /** Update custom props dynamically */
  updateProps(props: Record<string, any>): void
  /** Stop tracking and remove event listeners */
  destroy(): void
}

function createTracker(options: TrackerOptions): Tracker
```

**Implementation notes:**
- Reuses the event name construction logic from `tracking.ts` (`action_objectName_otherInfo` pattern)
- For `view` events, uses `IntersectionObserver` (same as current directive)
- Calls `window.xprops.trackGA4AndMixpanel` directly
- The Vue `vEmitAction` directive in `@aha/ui` will be kept as-is (deprecated) since it needs VNode access for auto-detecting element names. The vanilla `createTracker` requires explicit `name` instead.

### 10. Types

All interfaces move to `@aha/core/types.ts`:

- `BaseSlidePluginProps`
- `SlidePluginProps` (presenter)
- `AudienceSlidePluginProps`
- `ReportProps`
- `ParticipantReportPluginProps`
- `PluginKeyboardEvent`
- `ConfirmModalPayload`
- `ImageUploadResult`
- `ParticipantInfo`
- `Unsubscribe`
- `SyncChannel<T>`
- `SyncReadOnlyChannel<T>`
- `PluginBaseOptions` (renamed from `UseSlidePluginOptions`)

`@aha/ui` will re-export these types from `@aha/core` for backward compatibility.

### 11. Public API (`index.ts`)

```ts
// index.ts — what consumers see
export { createSync, createSyncReadOnly } from './sync'
export { createPluginBase } from './plugin-base'
export { createPresenterPlugin } from './presenter-plugin'
export { createAudiencePlugin } from './audience-plugin'
export { createReportPlugin } from './report-plugin'
export { createParticipantReportPlugin } from './participant-report-plugin'
export { createTracker } from './tracker'
export { reportHeight, autoReportHeight } from './height'
export * from './types'
// Note: throttle is internal-only (used by autoReportHeight), not exported
```

## `@aha/ui` Changes (Backward Compatibility Layer)

### Strategy

1. All Vue composables (`useSync`, `useSyncReadOnly`, `usePresenterPlugin`, `useAudiencePlugin`, `useReportPlugin`, `useParticipantReportPlugin`) stay exported but are marked `@deprecated`.
2. Internally, they wrap `@aha/core` factories:
   - Create the core plugin in the composable
   - Call `plugin.init()` in `onMounted`
   - Call `plugin.destroy()` in `onUnmounted`
   - Map each Observable subscription to a Vue `ref` that auto-updates
3. Types are re-exported from `@aha/core` (e.g., `export type { BaseSlidePluginProps } from '@aha/core'`)
4. Vue-specific items stay in `@aha/ui` without deprecation:
   - `vEmitAction`, `emitActionDirective`, `emitActionPlugin` (Vue directives)
   - `AhaIcon.vue` (Vue component)
   - `ahaSlidesDefaultTheme` (Ant Design Vue config)
   - Host-side zoid iframe components (`PresenterSlidePluginIframe`, etc.)
   - CSS exports (`ahaslides-vars.css`, etc.)
   - Tailwind config
   - Vite icon config

### Example: `useSync` wrapping `createSync`

```ts
// @aha/ui src/sync.ts (updated)
import { ref, watch, readonly, unref, onUnmounted, type Ref, type DeepReadonly } from 'vue'
import { createSync as coreCreateSync, createSyncReadOnly as coreCreateSyncReadOnly } from '@aha/core'

/**
 * @deprecated Use `createSync` from `@aha/core` instead.
 */
export function useSync<T>(name: string | Ref<any>, initialState: T): Ref<T> {
  const state = ref(initialState) as Ref<T>
  let sync = coreCreateSync<T>(unref(name), initialState)
  let unsub: (() => void) | null = null
  let isExternalUpdate = false

  const setup = (channelName: string) => {
    unsub?.()
    sync.destroy()
    if (!channelName) return
    sync = coreCreateSync<T>(channelName, state.value as T)
    unsub = sync.onStateChange((val) => {
      isExternalUpdate = true
      state.value = val as any
      isExternalUpdate = false
    })
  }

  // Watch for local state changes → push to sync
  watch(state, (newValue) => {
    if (isExternalUpdate) return
    sync.setState(newValue as T)
  }, { deep: true })

  // Handle dynamic channel name
  watch(() => unref(name), (newName) => setup(newName), { immediate: true })

  onUnmounted(() => {
    unsub?.()
    sync.destroy()
  })

  return state
}
```

### Example: `usePresenterPlugin` wrapping `createPresenterPlugin`

```ts
// @aha/ui src/zoid/presenter.ts (updated, composable portion)
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { createPresenterPlugin as coreCreate, type PresenterPlugin } from '@aha/core'

/**
 * @deprecated Use `createPresenterPlugin` from `@aha/core` instead.
 */
export function usePresenterPlugin(options = {}): PresenterPluginReturn {
  const plugin = coreCreate(options)

  // Create refs from initial state
  const presentationProps = ref(plugin.getPresentation())
  const slideProps = ref(plugin.getSlide())
  const currentUserProps = ref(plugin.getCurrentUser())
  const baseUrl = ref(plugin.getBaseUrl())
  // ... etc

  const unsubs: (() => void)[] = []

  onMounted(() => {
    plugin.init()
    unsubs.push(plugin.onPresentationChange(v => presentationProps.value = v))
    unsubs.push(plugin.onSlideChange(v => slideProps.value = v))
    unsubs.push(plugin.onCurrentUserChange(v => currentUserProps.value = v))
    unsubs.push(plugin.onBaseUrlChange(v => baseUrl.value = v))
    // ... etc
  })

  onUnmounted(() => {
    unsubs.forEach(fn => fn())
    plugin.destroy()
  })

  return {
    presentationProps,
    slideProps,
    currentUserProps,
    baseUrl,
    // Actions pass through directly
    getSlideAttributesAction: (id) => plugin.getSlideAttributes(id),
    uploadImage: (file) => plugin.uploadImage(file),
    // ... etc
  }
}
```

## Usage Examples

### React Plugin

```tsx
import { createPresenterPlugin } from '@aha/core'
import { ApiClient, SlideType } from '@aha/api'
import { useEffect, useState } from 'react'

function PresenterView() {
  const [plugin] = useState(() => createPresenterPlugin({ autoHeight: true }))
  const [slide, setSlide] = useState(plugin.getSlide())
  const [presentation, setPresentation] = useState(plugin.getPresentation())

  useEffect(() => {
    plugin.init()
    const unsubs = [
      plugin.onSlideChange(setSlide),
      plugin.onPresentationChange(setPresentation),
    ]
    return () => {
      unsubs.forEach(fn => fn())
      plugin.destroy()
    }
  }, [])

  const client = new ApiClient(plugin.getBaseUrl())
  // ... render
}
```

### Vanilla JS Plugin

```js
import { createAudiencePlugin } from '@aha/core'
import { ApiClient, SlideType } from '@aha/api'

const plugin = createAudiencePlugin({ autoHeight: true })
plugin.init()

// Read initial state
document.getElementById('name').textContent = plugin.getAudienceName()

// React to changes
plugin.onSlideChange((slide) => {
  document.getElementById('title').textContent = slide?.title ?? ''
})

// Clean up on page unload
window.addEventListener('beforeunload', () => plugin.destroy())
```

### Existing Vue Plugin (unchanged)

```ts
// This continues to work exactly as before
import { usePresenterPlugin } from '@aha/ui'

const { slideProps, presentationProps, uploadImage } = usePresenterPlugin({ autoHeight: true })
```

## Package Configuration

### `packages/core/package.json`

```json
{
  "name": "@aha/core",
  "version": "1.0.0",
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
    "test": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^4.0.0"
  }
}
```

### `@aha/ui` package.json changes

Add `@aha/core` as a dependency:

```json
{
  "dependencies": {
    "@aha/core": "*",
    "zoid": "^9.0.86"
  }
}
```

### Root workspace update

Add `packages/core` — already covered by `"workspaces": ["packages/*"]` in root `package.json`.

## Testing Strategy

1. **Unit tests for `@aha/core`** (Vitest):
   - `Observable`: get/set/subscribe/destroy
   - `createSync`: BroadcastChannel mocking, setState broadcasts, onStateChange receives, destroy closes channel
   - `createSyncReadOnly`: receives but doesn't broadcast
   - `createPresenterPlugin`, `createAudiencePlugin`, `createReportPlugin`, `createParticipantReportPlugin`: mock `window.xprops`, verify getters return initial values, verify `onProps` callback routes to correct subscriptions, verify actions call xprops functions
   - `createTracker`: DOM event attachment, event name construction, cleanup
   - `autoReportHeight`, `reportHeight`: mock DOM + xprops

2. **Existing consumer tests** must pass unchanged — they test via `@aha/ui` imports.

3. **E2E tests** must pass unchanged — they test the full plugin integration.

## Default `autoHeight` per Plugin Factory

| Factory | Default `autoHeight` | Matches current |
|---------|---------------------|-----------------|
| `createPresenterPlugin` | `false` | `usePresenterPlugin` defaults to `{}` → false |
| `createAudiencePlugin` | `true` | `useAudiencePlugin` defaults to `{ autoHeight: true }` |
| `createReportPlugin` | `true` | `useReportPlugin` defaults to `{ autoHeight: true }` |
| `createParticipantReportPlugin` | `true` | `useParticipantReportPlugin` defaults to `{ autoHeight: true }` |

## Known Issues Fixed During Migration

These are pre-existing bugs in `@aha/ui` that the new `@aha/core` + wrapper approach corrects:

1. **Missing BroadcastChannel cleanup in `useSync`/`useSyncReadOnly`**: The current implementations never call `bc.close()` on component unmount — there is no `onUnmounted` hook. The updated `@aha/ui` wrappers add proper `onUnmounted` cleanup. This is an intentional behavior improvement, not a transparent delegation.

2. **`participantInfo` missing from `AudienceSlidePluginProps` type**: The runtime code reads `xprops.audience.participantInfo` and exposes it, but the TypeScript interface omits it. `@aha/core` types include it correctly.

3. **`upsertSlideAttributeAction` missing from `SlidePluginProps` type**: The zoid component registers it and the hook exposes it, but the TypeScript interface declaration was accidentally replaced. `@aha/core` types include it correctly.

4. **`ReportPlugin.currentUser` not exposed reactively**: The zoid component registers `currentUser` as a prop and the host passes it, but `useReportPlugin` never exposes it as a ref and the `onProps` handler doesn't route `currentUser` changes. `@aha/core`'s `ReportPlugin` adds `getCurrentUser()` and `onCurrentUserChange()` as new functionality.

5. **`ParticipantReportPlugin.imageUrl` and `presentationColorPalette` not exposed reactively**: The zoid component registers both props, but `useParticipantReportPlugin` only returns `{ answers, reportHeight }` and the `onProps` handler only watches `answers`. `@aha/core` adds getters and subscriptions for both as new functionality.

6. **`setSubmissionCount` payload spread**: The current `usePresenterPlugin` maps via `{ voteCount: payload.count, ...payload }`, which sends both `voteCount` and `count` redundantly. `@aha/core` uses `{ voteCount: payload.count, tooltip: payload.tooltip }` — a clean mapping. The `@aha/ui` backward-compat wrapper adopts the clean mapping (not preserving the buggy spread).

## Migration Path

1. Ship `@aha/core` as a new package — no breaking changes to anything.
2. Update `@aha/ui` internals to delegate to `@aha/core` — existing imports still work, API shape identical.
3. Mark all Vue composables in `@aha/ui` as `@deprecated` with JSDoc pointing to `@aha/core` equivalents.
4. New plugins can choose to import from `@aha/core` (any framework) or `@aha/ui` (Vue convenience).
5. Existing plugins migrate at their own pace — or never, since the deprecated wrappers are thin and stable.
