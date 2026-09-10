# AhaSlides Plugin SDK — `@aha/standalone`

Build an AhaSlides **slide type** in plain JavaScript. `@aha/standalone` packages the
entire framework-agnostic slide-plugin SDK into a single browser file. Drop it in with a
`<script>` tag, use `window.AhaSlidePlugin`, and talk to the AhaSlides host — no Vue, no
bundler, no build step on your side.

> This is the repo-local, agent/developer-readable companion to the hosted docs page and
> to [`README.md`](./README.md). It documents the runtime contract in full.

---

## 1. Overview

An AhaSlides **slide type** is an interactive slide (poll, quiz, live race, …) that runs
as an **iframe** embedded inside the AhaSlides presenter and audience apps. The host hands
the iframe its data and a set of callbacks; the iframe renders the slide and sends
submissions back.

The SDK is already split into a **framework-agnostic core** (plain functions and classes)
and an **optional Vue layer** (`@aha/ui`). This package bundles just the core into one
script-loadable global:

| Bundled package | What it provides |
| --- | --- |
| **`@aha/ui-vanilla`** | zoid host bridge, live-state sync, audience height reporting, auth, host fonts, image/audio upload helpers |
| **`@aha/api`** | `ApiClient` — submissions, scored answers, leaderboards — and every request/response type |
| **`@aha/common`** | shared types/utilities, exposed under the `AhaSlidePlugin.common` namespace |

**Why it exists:** the first-party workbench (`slide-type-creator`) builds slide types in
Vue 3. This package lets you build the same three-surface slide type in vanilla JS,
decoupled from that repo's registry/build, while speaking the identical host protocol.

It is **not** AI-driven and carries no framework runtime of its own beyond what it bundles.

---

## 2. The mental model

Every slide type renders up to **three coordinated surfaces**, each a separate iframe entry
loaded at its own URL:

- **Presenter / Canvas** — the projector stage the room sees.
- **Settings / Editor** — the configuration panel in the deck editor.
- **Audience** — what each participant sees on their phone.

The host and your iframe live on different origins, so they communicate through **zoid** (a
`postMessage` wrapper). zoid populates a global `window.xprops` inside your iframe with all
the host's data and callback functions. The SDK wraps that surface and adds two things the
iframe can't get from the host alone: in-browser **state sync** and a typed **ApiClient**.

```
┌──────────────┐   zoid    ┌──────────────────────────────┐
│ AhaSlides    │ postMessage│ Your slide iframe            │
│ host         │ ◀───────▶ │  • window.xprops  (host data) │
│ presenter /  │           │  • createSync()   (canvas⇄settings) │
│ audience app │           │  • new ApiClient() (submissions) │
└──────────────┘           └──────────────────────────────┘
```

The same iframe code runs in the local workbench and in production; only what fills
`xprops` differs (the workbench's `parentBroker` fakes it; production wires the real host).

---

## 3. Loading the SDK

### Via `<script src>` (no build step)

Published to npm as `@ahaslides-product/plugins-standalone`, so any npm CDN serves the
global build. **Always pin an exact version in production.**

```html
<!-- unpkg -->
<script src="https://unpkg.com/@ahaslides-product/plugins-standalone@1.0.0/dist/aha-slide-plugin.global.js"></script>
<!-- or jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@ahaslides-product/plugins-standalone@1.0.0/dist/aha-slide-plugin.global.js"></script>

<script>
  const { initZoidForPresenter, createSync, ApiClient } = window.AhaSlidePlugin;
</script>
```

### Via ESM (bundler consumers)

```ts
import { initZoidForPresenter, createSync, ApiClient } from '@ahaslides-product/plugins-standalone';
```

The package ships TypeScript declarations (`dist/index.d.ts`), so the ESM import is fully
typed; the `<script>` global carries the same shape at runtime.

---

## 4. The global surface — `window.AhaSlidePlugin`

| Member | Signature | What it does |
| --- | --- | --- |
| `initZoidForPresenter` | `(tag?) => component` | Registers the presenter iframe with the host bridge. Call once at boot. |
| `initZoidForAudience` | `() => component` | Same, for the audience iframe entry. |
| `initializeApp` | `() => app` | Reads `window.xprops` into app state. Call after zoid connects. |
| `getApp` | `() => AppPluginProps` | The resolved host props (typed view over `xprops`). |
| `isInitialized` | `() => boolean` | Whether the host bridge has connected. |
| `presenterZoidProps` | object | The zoid prop contract (advanced / host-side). |
| `createSync` | `<T>(name, initial) => SyncStore<T>` | Read/write live state shared across surfaces in the same browser. |
| `createReadOnlySync` | `<T>(name, initial) => ReadOnlySyncStore<T>` | The read-only twin — subscribe, no `set`. |
| `createHeightReporter` | `(options?) => { start, stop }` | Auto-reports the audience iframe's content height. |
| `getAccessToken` | `() => string \| null` | Host access token for authenticated API calls. |
| `ensureHostFontLoaded` | `(stack?) => string` | Loads the deck's font into the iframe; returns the resolved stack. |
| `installHostFontAutoLoad` | `(options?) => () => void` | Keeps the iframe font in sync with the deck; returns an unsubscribe. |
| `ApiClient` | class | The live-data client — see §8. |
| `common` | namespace | Shared types/utilities from `@aha/common` (e.g. `common.QuizStatus`). |

---

## 5. Bootstrapping a surface

Each surface is its own HTML entry. Connect the bridge, then read the host.

**Presenter / Canvas**

```js
const A = window.AhaSlidePlugin;
A.initZoidForPresenter();
const app = A.initializeApp();

const xp = window.xprops;                 // host data + callbacks
render(xp.slide, xp.presentationColorPalette);

xp.setActionButtons?.([                    // control-bar buttons the host renders
  { id: 'reveal', label: 'Reveal', variant: 'primary' }
]);
xp.onActionInvoke?.((id) => { if (id === 'reveal') reveal(); });
```

**Audience**

```js
const A = window.AhaSlidePlugin;
A.initZoidForAudience();
A.initializeApp();
A.createHeightReporter().start();          // so the host sizes the iframe

const xp = window.xprops;
renderForm(xp.slide, xp.audience);
const api = new A.ApiClient(xp.baseUrl ?? '');
```

> **Cross-boundary rule:** every host function on `xprops` is passed across the zoid iframe
> boundary, so calls that return a value return a **Promise** (e.g.
> `getSlideAttributesAction()`, `showConfirmModal()`, `filterProfaneWords()`). Always `await`.

---

## 6. Host contract (`xprops`)

What the host provides inside the iframe. Shared fields appear on both surfaces.

### Shared — data

| Prop | Type | Notes |
| --- | --- | --- |
| `slide` | object | The full active-slide model (open record). Host-derived extras: `textColour`, `baseColour`, `backgroundImage`, `slideType`, `quizStatus`, `hasLeaderboardSlide`. |
| `presentation` | object | The full presentation model (open record): `id`, `language`, `fontFamily`, … Host-derived: `sessionSince`, `sharePresentation`. The deck's `slides` array is intentionally stripped. |
| `presentationColorPalette` | `string[]` | Deck theme palette — use it for all slide colour so the slide matches the room's theme. |
| `presentationLighterColorPalette` | `string[]` | The lighter companion palette. |
| `baseUrl` | string | Base URL of the parent app — pass to `ApiClient`. |

### Shared — functions

| Function | Signature | Notes |
| --- | --- | --- |
| `onHeightChange` | `(h: number\|null) => void` | Report iframe height; `null` means "use 100%". Usually via `createHeightReporter`. |
| `subscribeTopic` | `({ type?, topic, callback }) => void` | Subscribe to an MQTT topic for live events. |
| `unsubscribeTopic` | `(topic) => void` | Unsubscribe. |
| `trackGA4AndMixpanel` | `(payload) => void` | Emit an analytics event through the host. |
| `filterProfaneWords` | `(text) => Promise<string>` | Host-side profanity filter; returns input unchanged when disabled. |

### Presenter only (`SlidePluginProps`)

| Member | Signature | Notes |
| --- | --- | --- |
| `active` | boolean | Keep-alive preload gate. When `false` the iframe is preloaded but must render a blank shell and not consume slide data yet. |
| `currentUser` | `{ presenterLanguage? }` | Drive the editor/UI language from `presenterLanguage`. |
| `audiences` | `Record<id, details>` | Joined participants — name, emoji, team, online status, answers. |
| `getSlideAttributesAction` | `(slideId?) => Promise<any>` | Fetch this slide's persisted config. Call on mount to hydrate. |
| `upsertSlideAttributeAction` | `(payload) => Promise` | Persist a config attribute host-side (the Settings save path). |
| `uploadImage` | `() => Promise<ImageUploadResult>` | Opens the host image picker; resolves to `{ path, url }`. |
| `openUploadAudioModal` | `() => Promise<AudioUploadResult>` | Host audio uploader; resolves to `{ url, name }`. |
| `sendVoteOutcome` | `({ count?, tooltip? }) => void` | Push the live vote count + tooltip to the presenter chrome. |
| `setActionButtons` | `(actions: PluginAction[]) => void` | Declare control-bar buttons the host renders (Next, Reveal, …). |
| `onActionInvoke` | `(cb: (id) => void) => void` | Receive control-bar button presses by `id`. |
| `showToastInfo` / `showToastSuccess` / `showToastError` | `(text, uniqName?, action?, options?)` | Host toast notifications — reuse these, don't build your own. |
| `showConfirmModal` | `(payload) => Promise<boolean>` | Host confirm dialog; resolves to the user's choice. |
| `openPluginModal` / `closePluginModal` | `(path?) => void` | Open/close a host-framed modal route. |
| `clearSlideData` | `(slideId) => Promise<void>` | Clear this slide's submissions. |
| `createLeaderboardSlide` / `removeLeaderboardSlide` | `() => Promise<void>` | Add/remove the follow-up leaderboard slide. |
| `updateSlide` | `(payload) => void` | Patch the active slide model. |
| `allowPDFRender` | `() => void` | Signal the slide is painted and safe to screenshot for PDF export. |
| `onSlideAttributesChanged` | `(cb) => void` | React to config changes made in another surface. |
| `onKeyboard` / `emitKeyboardEvent` | `(cb)` / `(event)` | Receive/forward keyboard events across the boundary (shortcuts). |
| `onTyping` | `(cb) => void` | "Audience is typing" events, for a live indicator. |
| `emitBroadcastAction` / `onBroadcastAction` | `(key, args)` / `(cb)` | Broadcast a custom action to the other surfaces. |

### Audience only (`AudienceSlidePluginProps`)

| Member | Signature | Notes |
| --- | --- | --- |
| `audience` | object | This participant: `audienceName`, `audienceEmoji`, `audienceId`, `audienceEmail`, `audienceTeam`, `audienceQuizTeam`. |
| `currentUser` | `{ email? }` | The signed-in participant, if any. |
| `slideAttributes` | `Record<string, any>` | The persisted slide config, read-only on the audience side. |
| `isParticipantVerificationEnabled` | boolean | Whether the deck requires verified participants. |
| `timeLimit` | `number \| null` | Answer time limit for the slide, if any. |
| `uploadImage` | `() => Promise<any>` | Host image picker for image-answer slides. |
| `updateAudienceData` | `({ audienceName?, audienceEmail?, audienceEmoji? })` | Update this participant's identity. |
| `emitTyping` | `(isTyping: boolean) => void` | Tell the host this participant is typing. |
| `joinGame` | `(payload) => Promise<JoinGameResult>` | Join a team game; result may carry an `error` (`invalid-name` \| `invalid-team` \| `team-full` \| `network`). |
| `teams` | `Team[]` | Available teams for team games. |
| `scrollTo` | `(yOffset) => void` | Scroll the host viewport (e.g. "scroll to submit"). |
| `getWindowHeight` | `() => Promise<number>` | The host window height. |
| `onSubmitButtonHeightChange` | `(height) => void` | Report the sticky submit button's height. |
| `showToastInfo` / `showToastSuccess` / `showToastError` | `(text, …)` | Audience-side host toasts. |

**`PluginAction` shape:** `{ id, label, variant?: 'primary'|'default', icon?, iconViewBox?, disabled?, loading?, shortcut? }`.
Pass **booleans** for `disabled`/`loading` — the host coerces them; a function value silently breaks.

---

## 7. State sync

`createSync` returns a tiny observable store backed by a `BroadcastChannel`. The Settings
surface writes config; the Canvas surface subscribes and re-renders. `createReadOnlySync` is
the same without `set`.

```ts
interface SyncStore<T> {
  get(): T;                                   // current local value
  set(value: T): void;                        // update + broadcast to other surfaces
  subscribe(listener: (v: T) => void): () => void;  // returns an unsubscribe fn
  close(): void;                              // tear down the channel
}
```

```js
// Settings.html
const config = A.createSync('my-slide', { question: '', options: [] });
input.addEventListener('input', () => config.set({ ...config.get(), question: input.value }));

// Canvas.html
const config = A.createReadOnlySync('my-slide', { question: '', options: [] });
const off = config.subscribe((c) => paintQuestion(c.question));
```

> **Same browser only.** `createSync` uses `BroadcastChannel`, so it synchronises surfaces
> within *one* browser (the presenter's tabs). It does **not** reach a participant's phone.
> For cross-device state, persist config host-side via `upsertSlideAttributeAction` and send
> live answers through `ApiClient` — never stream a live clock across devices.

---

## 8. Live data — `ApiClient`

Construct it with the host `baseUrl` (and optionally an access token). In the workbench an
empty string works because the broker intercepts calls; in production pass `xprops.baseUrl`.

```js
const api = new A.ApiClient(xprops.baseUrl ?? '', A.getAccessToken() ?? undefined);
```

Constructor: `new ApiClient(baseUrl: string, accessToken?: string, options?: { logFn? })`.

| Method | Purpose |
| --- | --- |
| `sendLiveSubmission(slideType, payload)` | Submit a live answer/vote (the audience → presenter count path). |
| `updateSubmission(id, payload)` | Change an existing submission. |
| `deleteSubmission(id)` | Remove a submission (e.g. presenter removes one). |
| `getSubmissions({ slideId, slideVersion, type })` | Fetch all submissions for the slide. |
| `getParticipantSubmissions({ audienceId, slideId, slideVersion, type })` | One participant's submissions. |
| `createAnswer(slideType, payload)` | Submit a **scored** answer → `AnswerResponse` (verdict, points). |
| `createAnswerResults(payload)` | Write aggregated answer results. |
| `getSlideAnswers(req)` / `getParticipantSlideAnswers(req)` | Read scored answers for the slide / a participant. |
| `getLeaderboardTopN(req)` / `getLeaderboardAround(req)` | Presentation-wide leaderboard (top N, or around a player). |
| `getLeaderboardSlideTopN(req)` / `getLeaderboardSlideAround(req)` | Per-slide leaderboard. |
| `resetAnswerResult(payload)` | Reset a scored result. |
| `fetchUrl(url, options?)` | Low-level authenticated fetch. |

> **Production wiring.** A live-counting or scored slide needs a real backend handler
> deployed for its slug — the local workbench *fakes* both the count aggregation and the
> answer endpoint. Without the deployed handler, `sendLiveSubmission` shows no data and
> `createAnswer` returns 404 in the real product.

---

## 9. Audience height

The audience iframe sits in a mobile layout the host controls, so you must report your
content height. `createHeightReporter` watches the DOM and calls `xprops.onHeightChange`.

```js
const reporter = A.createHeightReporter({
  rootSelector: '#app',   // element to measure (default: document root)
  throttleMs: 100         // optional throttle
});
reporter.start();   // begin observing; reporter.stop() on unmount
```

---

## 10. Vue ↔ vanilla

`slide-type-creator` builds slide types in Vue with `@aha/ui`. Those composables are **thin
adapters** — they read the exact same `window.xprops` and wrap it in reactive refs. Dropping
the Vue layer loses nothing but the reactivity glue.

**Vue (`@aha/ui`)**

```js
import { mountPresenter } from '@/iframe/mountPresenter';
import Canvas from './Canvas.vue';
mountPresenter(Canvas);

// inside Canvas.vue
const { slide, palette } = usePresenterPlugin();  // refs
const config = useSync('poll', def);              // Ref<T>
const api = new ApiClient(baseUrl.value ?? '');
```

**Vanilla (`@aha/standalone`)**

```js
const A = window.AhaSlidePlugin;
A.initZoidForPresenter();
A.initializeApp();

const xp = window.xprops;              // plain object
const { slide, presentationColorPalette: palette } = xp;
const config = A.createSync('poll', def);  // { get, set, subscribe }
const api = new A.ApiClient(xp.baseUrl ?? '');
```

---

## 11. A slide type, end-to-end

A minimal "this or that" vote — presenter counts, audience taps.

**`audience.html`** — participant taps an option

```html
<script src="https://unpkg.com/@ahaslides-product/plugins-standalone@1.0.0/dist/aha-slide-plugin.global.js"></script>
<div id="app"></div>
<script>
  const A = window.AhaSlidePlugin;
  A.initZoidForAudience();
  A.initializeApp();
  A.createHeightReporter({ rootSelector: '#app' }).start();

  const xp = window.xprops;
  const api = new A.ApiClient(xp.baseUrl ?? '');
  const options = xp.slideAttributes?.options ?? ['This', 'That'];

  const app = document.getElementById('app');
  options.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = 'display:block;width:100%;padding:16px;margin:8px 0';
    btn.onclick = async () => {
      try {
        await api.sendLiveSubmission('this-or-that', {
          audienceId: xp.audience?.audienceId,
          slideId: xp.slide?.id,
          data: { choice: i }
        });
        xp.showToastSuccess?.('Submitted!');
      } catch (e) {
        xp.showToastError?.('Could not submit — try again');
      }
    };
    app.appendChild(btn);
  });
</script>
```

**`presenter.html`** — live tally on the canvas

```html
<script src="https://unpkg.com/@ahaslides-product/plugins-standalone@1.0.0/dist/aha-slide-plugin.global.js"></script>
<script>
  const A = window.AhaSlidePlugin;
  A.initZoidForPresenter();
  A.initializeApp();
  const xp = window.xprops;
  const api = new A.ApiClient(xp.baseUrl ?? '');

  async function refresh() {
    const subs = await api.getSubmissions({ slideId: xp.slide?.id });
    const counts = [0, 0];
    subs.forEach((s) => counts[s.data.choice]++);
    paint(counts);
    xp.sendVoteOutcome?.({ count: subs.length });   // show total in host chrome
  }
  xp.subscribeTopic?.({ topic: `slide/${xp.slide?.id}`, callback: refresh });
  refresh();
</script>
```

Add a `settings.html` using `createSync('this-or-that', …)` to edit the two option labels and
you have the full presenter / settings / audience loop — the same contract the Vue workbench
ships, written in plain JS.

---

## 12. Versioning & updates

The global file bakes in a specific build of `@aha/ui-vanilla` + `@aha/api` + `@aha/common`.
To ship an update:

1. Update the underlying SDK package(s) and bump their versions as usual.
2. **Bump `version` in `packages/standalone/package.json`** — this is what CDN consumers pin to.
3. Rebuild: `npm run build -w @aha/standalone` (Turborepo builds the deps first).
4. Publish through the release workflows — `@aha/standalone` is wired into
   `publish-packages.yaml` and `release-sdk-tarballs.yaml`.

Consumers on `@latest` pick up the new build on their next load; consumers who pinned an exact
version stay put until they bump the URL.

> **One-time follow-up.** The npm-public workflow (`publish-packages-npmjs.yaml`) — the CDN
> path — needs one line added to its `PACKAGE_NAME_MAP` once it lands on the default branch:
> `"@aha/standalone": "@ahaslides-product/plugins-standalone"`

---

## 13. Caveats & gotchas

| Gotcha | What to do |
| --- | --- |
| **Eager bridge init.** Loading the script runs zoid's host-bridge setup immediately. | Load it only in the iframe document that talks to the AhaSlides host — not a generic page. |
| **Host functions are async.** Anything on `xprops` that returns a value crosses the zoid boundary as a Promise. | `await` `getSlideAttributesAction`, `showConfirmModal`, `filterProfaneWords`, `joinGame`, `getWindowHeight`. |
| **`createSync` is same-browser.** It won't reach a participant's phone. | Persist config via `upsertSlideAttributeAction`; move live answers through `ApiClient`. |
| **Live/scored slides need a backend.** The workbench fakes counts and the answer endpoint. | Deploy a handler for the slug before trusting `sendLiveSubmission` / `createAnswer` in production. |
| **Preload gate.** A presenter iframe may boot with `active: false`. | Render a blank shell and don't consume slide data until `active` flips true. |
| **Theme from the deck.** Colours and fonts come from the host, not your CSS. | Read `presentationColorPalette` / `slide.textColour`; call `ensureHostFontLoaded()`. |

---

*Part of the `aha-slide-plugin` monorepo. The framework-agnostic core also ships as
`@ahaslides-product/plugins-ui-vanilla` and `@ahaslides-product/plugins-api` if you prefer to
compose them yourself. This document tracks v1.0.0.*
