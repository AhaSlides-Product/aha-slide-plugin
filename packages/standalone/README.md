# @aha/standalone

An **all-in-one, framework-agnostic** browser build of the AhaSlides slide-plugin
SDK. Drop it in with a `<script src>` tag and use `window.AhaSlidePlugin` — no
bundler, no Vue, no npm install required on the consumer side.

> Full runtime reference (the host `xprops` contract, the complete `ApiClient` surface, a
> slide type built end-to-end): [`DOCS.md`](./DOCS.md).

It bundles, into one file:

- **`@aha/ui-vanilla`** — the zoid host bridge (`initZoidForPresenter` /
  `initZoidForAudience` / `initializeApp` / `getApp` / `isInitialized` /
  `presenterZoidProps`), live-state sync (`createSync` / `createReadOnlySync`),
  audience height reporting (`createHeightReporter`), auth (`getAccessToken`),
  host fonts and image/audio upload helpers.
- **`@aha/api`** — `ApiClient` (`sendLiveSubmission`, `createAnswer`,
  `getLeaderboard*`, …) and its request/response types.
- **`@aha/common`** — shared types/utilities, under `AhaSlidePlugin.common.*`.

## Use it via `<script src>`

The build produces a single self-contained file, `dist/aha-slide-plugin.global.js`, that
exposes `window.AhaSlidePlugin`. It is served from **jsDelivr**, straight off this repo's
`cdn` branch:

```html
<!-- latest staging build (jsDelivr caches ~12h) -->
<script src="https://cdn.jsdelivr.net/gh/AhaSlides-Product/aha-slide-plugin@cdn/aha-slide-plugin.global.js"></script>

<script>
  // Presenter iframe entry — plain JS, no framework.
  AhaSlidePlugin.initZoidForPresenter();
  const app = AhaSlidePlugin.initializeApp();

  const state = AhaSlidePlugin.createSync('poll', { counts: {} });
  state.subscribe((s) => renderCanvas(s));

  const api = new AhaSlidePlugin.ApiClient(window.xprops?.baseUrl ?? '');
  // api.sendLiveSubmission(...), api.getLeaderboardTopN(...), etc.
</script>
```

```html
<!-- Audience iframe entry -->
<script src="https://cdn.jsdelivr.net/gh/AhaSlides-Product/aha-slide-plugin@cdn/aha-slide-plugin.global.js"></script>
<script>
  AhaSlidePlugin.initZoidForAudience();
  // pass the id your content mounts on — default rootSelector is '#root'
  AhaSlidePlugin.createHeightReporter({ rootSelector: '#app' }).start();
</script>
```

| URL | Use it for |
| --- | --- |
| `https://cdn.jsdelivr.net/gh/AhaSlides-Product/aha-slide-plugin@cdn/aha-slide-plugin.global.js` | Latest build from `staging`. jsDelivr caches it for ~12h, so a fresh build can take that long to show up. |
| `https://cdn.jsdelivr.net/gh/AhaSlides-Product/aha-slide-plugin@<cdn-sha>/aha-slide-plugin.global.js` | **Immutable** — pin to a commit SHA of the `cdn` branch (shown in each *Build standalone CDN asset* run summary, or `git log origin/cdn`). Use this in production so the SDK never changes under you. |

The `cdn` branch is generated — see [Updating](#updating-the-library--releasing-a-new-version).
You can still self-host instead: build the file (`npm run build -w @aha/standalone`) or extract
it from the `aha-standalone.tgz` asset on the SDK Release (`package/dist/aha-slide-plugin.global.js`).

> The script runs zoid's host-bridge setup **on load** (eager). Load it in the
> iframe document that talks to the AhaSlides host.

See [`examples/standalone.html`](./examples/standalone.html) for a runnable page.

## Use it as ESM (bundler consumers)

```ts
import { initZoidForPresenter, createSync, ApiClient } from '@ahaslides-product/plugins-standalone';
```

## Build

```bash
npm run build -w @aha/standalone
```

Produces in `dist/`:

| File                           | What                                              |
| ------------------------------ | ------------------------------------------------- |
| `aha-slide-plugin.global.js`   | IIFE, minified, exposes `window.AhaSlidePlugin`   |
| `aha-slide-plugin.global.js.map` | source map                                      |
| `index.js`                     | ESM entry (thin re-export, for bundler consumers) |
| `index.d.ts`                   | type declarations                                 |
| `VERSION`                      | the built version, for CI/consumers to read       |

`tsc` emits the ESM entry + types; `build.mjs` (esbuild) emits the bundled
global. The global version is stamped into the file banner from this package's
`version`.

## Updating the library / releasing a new version

The bundle is a **snapshot** of `@aha/ui-vanilla` + `@aha/api` + `@aha/common`
taken at build time. To ship an update:

1. Update the underlying SDK package(s) (`packages/ui-vanilla`, `packages/api`,
   `packages/common`) and bump their versions as usual.
2. **Bump `version` in this package's `package.json`** (semver).
3. Merge to `staging`. That's all the CDN needs:
   **`.github/workflows/build-standalone-cdn.yml`** runs on every `staging` push that touches
   `packages/standalone`, `packages/ui-vanilla`, `packages/api` or `packages/common`
   (or manually via *workflow_dispatch*). It builds this package and commits
   `aha-slide-plugin.global.js` on top of the **`cdn` branch**, which jsDelivr serves
   (the repo is public). Each run's summary prints the new `cdn` SHA for the immutable URL.
   Old SHAs stay reachable, so pinned URLs keep working.
4. The package is also shipped through the release workflows:
   - **`.github/workflows/publish-packages.yaml`** — **GitHub Packages** (auth-gated;
     for bundler/ESM consumers).
   - **`.github/workflows/release-sdk-tarballs.yaml`** — attaches `aha-standalone.tgz`
     to the `sdk-latest` GitHub Release (its transitive `@aha/*` deps are added
     automatically). This is the token-free path the public template already consumes.

To build locally, `npm run build` (Turborepo builds the deps first, then this package).
