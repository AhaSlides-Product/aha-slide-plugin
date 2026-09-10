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
exposes `window.AhaSlidePlugin`. **Today you host that file yourself** and reference it:

```html
<!-- self-hosted: point at wherever you serve the built file -->
<script src="/assets/aha-slide-plugin.global.js"></script>

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
<script src="/assets/aha-slide-plugin.global.js"></script>
<script>
  AhaSlidePlugin.initZoidForAudience();
  // pass the id your content mounts on — default rootSelector is '#root'
  AhaSlidePlugin.createHeightReporter({ rootSelector: '#app' }).start();
</script>
```

Get the file by building it (`npm run build -w @aha/standalone`), or by extracting it from
the `aha-standalone.tgz` asset on the SDK Release (`package/dist/aha-slide-plugin.global.js`).

> ⚠️ **CDN (unpkg / jsDelivr) is not live yet.** Those mirror public `registry.npmjs.org`,
> and this package is not yet published there (see [Updating](#updating-the-library--releasing-a-new-version)).
> Once a public-npm publish workflow lands, the pinned CDN URL will be
> `https://unpkg.com/@ahaslides-product/plugins-standalone@<version>/dist/aha-slide-plugin.global.js` —
> until then, self-host as shown above.

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
3. Rebuild: `npm run build` (Turborepo builds the deps first, then this package).
4. Publish through the release workflows. **Today** `@aha/standalone` is wired into:
   - **`.github/workflows/publish-packages.yaml`** — **GitHub Packages** (auth-gated;
     *not* CDN-mirrored).
   - **`.github/workflows/release-sdk-tarballs.yaml`** — attaches `aha-standalone.tgz`
     to the `sdk-latest` GitHub Release (its transitive `@aha/*` deps are added
     automatically). This is the token-free path the public template already consumes.

**Not yet wired: public npm / CDN.** `unpkg` and `jsDelivr` mirror only public
`registry.npmjs.org`, and nothing in this repo publishes there — there is no
`publish-packages-npmjs.yaml`. Making the `<script src>` CDN URLs resolve is a
**follow-up**: add that public-npm publish workflow and map
`"@aha/standalone": "@ahaslides-product/plugins-standalone"` in its `PACKAGE_NAME_MAP`.
Until then, consumers self-host the built `dist/aha-slide-plugin.global.js` (or use the
GitHub Release tarball).
