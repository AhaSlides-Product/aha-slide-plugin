/**
 * @aha/standalone — all-in-one entry for the AhaSlides slide-plugin SDK.
 *
 * This is a thin aggregator package. It re-exports the framework-agnostic SDK
 * surface so that it can be bundled into a single browser global
 * (`window.AhaSlidePlugin`) via `build.mjs`, OR imported as ESM by bundler-based
 * consumers.
 *
 * Flat surface (top level of the global):
 *   - from @aha/ui-vanilla: the zoid host bridge (initZoidForPresenter /
 *     initZoidForAudience / initializeApp / getApp / isInitialized /
 *     presenterZoidProps), live-state sync (createSync / createReadOnlySync),
 *     audience height reporting (createHeightReporter), auth (getAccessToken),
 *     host fonts and image/audio upload helpers.
 *   - from @aha/api: ApiClient (sendLiveSubmission / createAnswer /
 *     getLeaderboard* / ...) and the request/response types.
 *
 * Namespaced surface (to avoid name collisions between packages):
 *   - AhaSlidePlugin.common.*  — shared types/utilities from @aha/common
 *
 * Versioning: this package carries its own semver. Bumping it (and rebuilding)
 * produces a new immutable CDN artifact; see README.md.
 */

// Primary, flat surface — the two framework-agnostic runtime packages.
export * from '@aha/ui-vanilla';
export * from '@aha/api';

// Shared primitives/types kept under a namespace so a duplicate export name in
// @aha/common can never shadow or clash with the flat surface above.
export * as common from '@aha/common';
