# Cloudflare Workers Deploy for Plugin Groups — Design

**Status**: Draft for review
**Date**: 2026-05-04
**Author**: Dong Tran (with Claude)

## Problem

Today every slide-plugin backend ships in one Docker container — `@aha/backend-main`'s prebuild scanner aggregates every `apps/<plugin>/backend/AppModule` into a single NestJS app deployed to ECS Fargate. That model works for built-in plugins but creates two frictions for AhaSliders staff vibe-coding new plugins inside the `slide-plugin-built-by-ahasliders` group:

1. **Backend authoring requires NestJS literacy** — controllers, modules, DI, decorators, `@aha/backend-utils`.
2. **Backend deploys are coupled** — bumping any group plugin forces a rebuild and redeploy of the shared ECS container, which is owned by the `aha-slide-plugin` host repo.

Vibe-coders should be able to ship a backend in minutes without learning NestJS or coordinating with `aha-slide-plugin`.

## Goal

Group plugins (folders under a wrapper marked by `aha-plugin-group.json`) get an alternative backend deploy target: **Cloudflare Workers, one Worker per plugin**, written with **Hono**, deployed via **`wrangler` CI in the external repo**, with no host-repo coordination.

Two priorities, in order:

- **A — vibe-coder simplicity.** Write a small Hono `fetch` handler, push to `master`, get a live URL.
- **B — independent deploy lifecycle.** Plugin A redeploys without touching plugin B or the ECS container.

## Non-goals (explicit)

- **Do not migrate existing internal plugins** (`apps/ranking/`, `apps/ideaBoard/`, `apps/pinOnImage/`, `apps/sample-slide/`). These remain on NestJS + ECS forever. The design must ensure no behavior change for them.
- **No runtime/dynamic plugin loading.** All plugins are still known at build time.
- **No full multi-environment split in v1.** v1 ships two: production (`<plugin>.<subdomain>.workers.dev`, deployed on push to `master`) and PR preview (`<plugin>-preview.<subdomain>.workers.dev`, deployed on `pull_request`). No separate `staging` env yet; if a plugin author needs more, they extend their `wrangler.toml` with additional `[env.<name>]` blocks and adjust their plugin's CI matrix.
- **No custom domain (`<plugin>.plugins.ahaslide.com`).** `*.workers.dev` is fine — the URL is called by JS inside an iframe, never seen by users. Custom domain is a future opt-in (one `wrangler.toml` change, no migration needed).
- **No mixed groups in v1.** A group is all-Workers or all-ECS, decided by its marker. Per-plugin overrides inside a group are a future extension if needed.
- **No migration of existing host CI / Dockerfile / ECS task definitions.** The ECS path is untouched.

## Architecture

```
aha-slide-plugin/                                (host monorepo, no infra change)
├── apps/
│   ├── sample-slide/        backend → @aha/backend-main → ECS (today, unchanged)
│   ├── ranking/             backend → @aha/backend-main → ECS (today, unchanged)
│   ├── ideaBoard/           backend → @aha/backend-main → ECS (today, unchanged)
│   ├── pinOnImage/          backend → @aha/backend-main → ECS (today, unchanged)
│   └── slide-plugin-by-ahasliders/   ← group marker says target = cloudflare-workers
│       ├── aha-plugin-group.json     ← gains `deployment` block (see below)
│       ├── _template/                  ← Hono + wrangler skeleton (replaces NestJS)
│       ├── plugin-1/
│       │   ├── frontend/   → S3 + CloudFront (unchanged shape)
│       │   └── backend/    → Cloudflare Worker (new shape)
│       └── plugin-2/
│           ├── frontend/   → S3 + CloudFront
│           └── backend/    → Cloudflare Worker
└── packages/
    ├── backend-main/        ← scanner now skips Worker-target plugins
    └── common/              ← gains `getPluginBackendUrl()` helper
```

For each group plugin's frontend, JS calls a backend URL computed by convention from the plugin folder name and the `workersSubdomain` declared in the marker.

## Group marker schema

`aha-plugin-group.json` gains a `deployment` block:

```json
{
  "name": "Plugins by AhaSliders",
  "source": "https://github.com/AhaSlides-Product/slide-plugin-built-by-ahasliders",
  "deployment": {
    "backend": {
      "target": "cloudflare-workers",
      "workersSubdomain": "ahaslide-plugins"
    }
  }
}
```

Fields:

- `deployment.backend.target` — `"cloudflare-workers"` or `"ecs"` (default if `deployment` is absent or `target` is omitted). Drives scanner exclusion and frontend URL convention.
- `deployment.backend.workersSubdomain` — Cloudflare account's workers.dev subdomain. Required when `target === "cloudflare-workers"`. Used to compute backend URLs as `https://<plugin>.<workersSubdomain>.workers.dev`.

If `target === "cloudflare-workers"` but `workersSubdomain` is missing or empty, the scanner aborts with a clear error.

If `deployment` is absent entirely, behavior is exactly today's: backends aggregate into `@aha/backend-main`, ship to ECS.

## Host monorepo changes

### 1. Backend-main scanner skips Worker-target plugins

`packages/backend-main/scripts/listPlugins.js` is extended to read each group folder's `aha-plugin-group.json` and tag returned plugin entries with a `target` field. The return shape becomes:

```ts
type PluginTarget = 'ecs' | 'cloudflare-workers';

type PluginEntry = {
  name: string;        // leaf folder name, slide-type identifier
  dir: string;         // absolute path to the plugin folder
  target: PluginTarget; // resolved from the parent group's marker; defaults to 'ecs'
};

function listPlugins(appsDir: string): PluginEntry[];
```

Plugin entries that come from a group folder inherit the group's `deployment.backend.target` value. Plugins not under a group folder (everything currently in `apps/*/`) always get `target: 'ecs'`. The marker is read once per group folder during the walk; it is **not** re-read per child plugin.

`generate-app-module.js` filters to `target === "ecs"` before generating imports and routes. The result: Worker-target plugins do **not** appear in `app.module.ts`, do **not** get added to `backend-main/package.json` dependencies, and the ECS container has no awareness of them.

`packages/api/scripts/listPlugins.js` is a **separate** copy (today's scripts have ~30 lines of intentional duplication, called out in the previous PR's spec). It also gets the same `target` field for shape consistency, but its consumer (`generate-slide-type-enum.js`) ignores `target` — Worker plugins still appear in the `SlideType` enum, since the enum is consumed by the host frontend regardless of where each plugin's backend physically lives. Both scanner files are kept in sync — that's the load-bearing rule, formalized as a test (see "Testing" section).

The scanner's existing rules (group-marker recursion, `_`/`.` prefix skip, name-collision guard) all apply unchanged.

**Characterization test before/after.** The implementation MUST verify that for the current `apps/*` layout (no group plugins targeting Workers yet), the generated `packages/backend-main/src/app.module.ts` and `packages/api/src/slideType.ts` are byte-identical to their pre-change committed state. This guards the hard non-goal "do not affect existing internal plugins."

### 2. New `getPluginBackendUrl()` helper

`packages/common/src/pluginBackendUrl.ts`:

```ts
export function getPluginBackendUrl(pluginName: string, subdomain: string): string {
  return `https://${pluginName}.${subdomain}.workers.dev`;
}
```

Exported from `packages/common/src/index.ts`. Single source of truth for the URL formula. Used by group-plugin frontends to compute their own backend URL.

**URL contract — no shared frontend code may build backend URLs from a plugin name.** Each plugin's frontend owns its backend URL and only its own. The host's plugin-host iframe loads a manifest and addresses the iframe by `baseUrl`; it never composes backend paths. Inside a plugin's frontend, the only allowed backend-URL constructions are `getPluginBackendUrl(name, subdomain)` (Workers target) or relative paths against the current host (ECS target, as today). This rules out any future shared util that does `${someBase}/${pluginName}/foo` and silently breaks for one of the two targets.

### 3. No other host changes

Specifically NOT changed by this design:
- NestJS code, decorators, modules
- `packages/backend-main/Dockerfile`
- `ecs/tasks/*.json`
- `.github/workflows/*.yaml`
- `.github/actions/deploy-ecs/action.yaml`
- Existing internal plugins' code (`apps/ranking/`, `apps/ideaBoard/`, `apps/pinOnImage/`, `apps/sample-slide/`)

## External repo changes (`slide-plugin-built-by-ahasliders`)

### 1. Marker file gains deployment block

The existing `aha-plugin-group.json` is updated to declare `deployment.backend.target = "cloudflare-workers"` and `workersSubdomain`. See schema above.

### 2. `_template/backend/` replaced with Hono + wrangler

The current NestJS skeleton at `_template/backend/` is removed. New shape:

```
_template/backend/
├── src/
│   └── index.ts            # Hono app, default-exported as the Worker
├── wrangler.toml           # name, main, compatibility_date
├── package.json            # { hono } + { wrangler, @cloudflare/workers-types, typescript }
├── tsconfig.json
└── .dev.vars.sample        # placeholders for plugin secrets (e.g. OPENAI_API_KEY)
```

`src/index.ts`:

```ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Anchored allow-list, callback form for Hono's CORS middleware.
// Adjust if presenter/audience domains differ — confirm before merge.
const ALLOWED_ORIGINS = [
  /^https:\/\/([a-z0-9-]+\.)*ahaslides\.com$/,
  /^https:\/\/([a-z0-9-]+\.)*ahaslide\.com$/,    // covers plugins.dev.ahaslide.com
  /^http:\/\/localhost(:\d+)?$/,                  // local dev
];

function isAllowedOrigin(origin: string): string | null {
  return ALLOWED_ORIGINS.some(re => re.test(origin)) ? origin : null;
}

const app = new Hono();
app.use('*', cors({ origin: isAllowedOrigin }));

app.get('/health-check', c => c.text('OK'));

app.post('/', async c => {
  const payload = await c.req.json();
  // TODO: process the submission
  return c.json({ count_total: [], count_unique: [] });
});

export default app;
```

The CORS list is callback-form (regex literal in `origin:` is unreliable across Hono versions). It explicitly covers `*.ahaslides.com`, `*.ahaslide.com` (current plugin S3 origin), and `localhost` for dev. No wildcard fallback.

`wrangler.toml`:

```toml
name = "template"
main = "src/index.ts"
compatibility_date = "2026-05-04"
# Pin the date when the plugin is created. Bump deliberately when adopting new
# Workers runtime features. Do not paste old dates into new plugins.
```

`package.json` (≈15 lines):

```jsonc
{
  "name": "@aha-external/template-backend",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": { "hono": "^4" },
  "devDependencies": {
    "wrangler": "^4",
    "@cloudflare/workers-types": "^4",
    "typescript": "^5"
  }
}
```

The frontend half of `_template/` is unchanged from what shipped in the previous PR (`feat/external-plugin-group`), except for one new file in step 3 below.

### 3. Frontend example `services/api.ts`

`_template/frontend/src/services/api.ts` (new file, ≈12 lines):

```ts
import { getPluginBackendUrl } from '@aha/common';

const PLUGIN_NAME = 'template'; // TODO: rename when copying _template
const BACKEND = import.meta.env.VITE_BACKEND_URL_OVERRIDE
  ?? getPluginBackendUrl(PLUGIN_NAME, 'ahaslide-plugins');

export async function submit(payload: unknown) {
  const res = await fetch(BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
```

The plugin name appears in three places when a vibe-coder copies the template: the frontend's `PLUGIN_NAME` constant, the backend's `wrangler.toml` `name`, and (implicitly) the folder name. They must match. **Both** automated to remove the foot-gun:
- `scripts/new-plugin.sh <name>` (added to the external repo) does `cp -R _template <name>` and rewrites all three references.
- A `lint-plugin-names` job in CI fails the build if a plugin's folder name, `wrangler.toml` `name`, and frontend `PLUGIN_NAME` don't match.

### 4. `scripts/new-plugin.sh`

Bash script in the external repo root. Vibe-coder runs `./scripts/new-plugin.sh my-new-slide` and gets a ready-to-edit copy of the template, all three names rewritten:

```bash
#!/usr/bin/env bash
set -euo pipefail
name="${1:-}"
[[ "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || { echo "name must be kebab-case"; exit 1; }
[[ -e "$name" ]] && { echo "$name already exists"; exit 1; }
cp -R _template "$name"
sed -i.bak "s|@aha-external/template-frontend|@aha-external/${name}-frontend|g" "$name/frontend/package.json"
sed -i.bak "s|@aha-external/template-backend|@aha-external/${name}-backend|g" "$name/backend/package.json"
sed -i.bak "s|name = \"template\"|name = \"${name}\"|" "$name/backend/wrangler.toml"
sed -i.bak "s|const PLUGIN_NAME = 'template'|const PLUGIN_NAME = '${name}'|" "$name/frontend/src/services/api.ts"
find "$name" -name '*.bak' -delete
echo "Created $name. Next: cd $name/backend && wrangler deploy"
```

### 5. CI workflow `.github/workflows/deploy-workers.yaml`

Triggers on push to `master` (production deploy) and `pull_request` (preview deploy). Uses `dorny/paths-filter` for change detection so it tolerates squash merges, force pushes, and merge commits — `git diff HEAD^ HEAD` is too fragile.

```yaml
name: Deploy Workers
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  detect:
    runs-on: ubuntu-latest
    outputs:
      plugins: ${{ steps.filter.outputs.changes }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            # One filter per plugin folder, auto-generated step below
          list-files: json

      # Auto-discover plugins (any top-level folder containing backend/wrangler.toml,
      # excluding underscore/dot-prefixed) and emit a paths-filter expression for each.
      - id: discover
        run: |
          plugins=$(ls -d */backend/wrangler.toml 2>/dev/null \
            | cut -d/ -f1 \
            | grep -vE '^[_.]' \
            | jq -R -s -c 'split("\n") | map(select(length > 0))')
          echo "all=$plugins" >> "$GITHUB_OUTPUT"

  lint-plugin-names:
    needs: detect
    if: needs.detect.outputs.plugins != '[]'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        plugin: ${{ fromJSON(needs.detect.outputs.plugins) }}
    steps:
      - uses: actions/checkout@v4
      - name: Assert folder name == wrangler name == frontend PLUGIN_NAME
        run: |
          folder="${{ matrix.plugin }}"
          wname=$(grep '^name = ' "$folder/backend/wrangler.toml" | head -1 | sed 's/name = "\(.*\)"/\1/')
          fname=$(grep "PLUGIN_NAME = '" "$folder/frontend/src/services/api.ts" | head -1 | sed "s/.*PLUGIN_NAME = '\(.*\)'.*/\1/")
          if [[ "$folder" != "$wname" || "$folder" != "$fname" ]]; then
            echo "::error::name mismatch in $folder: folder=$folder wrangler=$wname frontend=$fname"
            exit 1
          fi

  deploy:
    needs: [detect, lint-plugin-names]
    if: needs.detect.outputs.plugins != '[]'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        plugin: ${{ fromJSON(needs.detect.outputs.plugins) }}
    defaults:
      run:
        working-directory: ${{ matrix.plugin }}/backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm install
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: ${{ matrix.plugin }}/backend
          command: ${{ github.event_name == 'pull_request' && 'deploy --env preview' || 'deploy' }}
      - name: Smoke test /health-check
        run: |
          env_suffix="${{ github.event_name == 'pull_request' && '-preview' || '' }}"
          url="https://${{ matrix.plugin }}${env_suffix}.${{ vars.WORKERS_SUBDOMAIN }}.workers.dev/health-check"
          for i in 1 2 3; do
            if curl -fsS --max-time 5 "$url" | grep -q "OK"; then exit 0; fi
            sleep 2
          done
          echo "::error::Health check failed for $url"
          exit 1

  prune-orphans:
    if: github.event_name == 'push'
    needs: [detect, deploy]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Delete Workers whose plugin folder no longer exists
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          # List all Workers in the account, intersect with current plugin folders,
          # delete the difference. Confine to the @aha-external/ namespace via name prefix
          # convention if needed. Dry-run first; promote to real delete after one quiet run.
          npx wrangler@4 deployments list ... # see implementation plan
```

The `prune-orphans` job runs only on `push` (not PR), and the implementation plan SHOULD start with a `--dry-run` mode that just lists what would be deleted; promote to real deletion once a maintainer confirms output looks right.

Repo secrets required (one-time admin setup):
- `CLOUDFLARE_API_TOKEN` — scoped to "Edit Cloudflare Workers"
- `CLOUDFLARE_ACCOUNT_ID`

Repo variables required:
- `WORKERS_SUBDOMAIN` — same value as `aha-plugin-group.json`'s `deployment.backend.workersSubdomain`. Set as a repo `vars` (not secret) so workflows can build the smoke-test URL. Mirror this between the two locations and document it.

Per-plugin secrets (e.g. `OPENAI_API_KEY` for an AI plugin) are **not** managed by this workflow. Plugin author runs `wrangler secret put OPENAI_API_KEY` once per plugin per env; CF stores it on the Worker. Documented in the README.

**Per-plugin staging via `[env.preview]`.** Each plugin's `wrangler.toml` includes a stub `[env.preview]` block (template provides this) so `wrangler deploy --env preview` produces `<plugin>-preview.<subdomain>.workers.dev`. PR builds use this; production builds do not. Vibe-coder gets a free preview URL on every PR.

### 6. README updates

The existing `README.md` gains sections covering:
- One-time CF setup (`wrangler login`, getting `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` into repo secrets, `WORKERS_SUBDOMAIN` into repo vars).
- The `scripts/new-plugin.sh <name>` flow as the recommended path; manual cp-rename only for advanced users.
- Per-plugin secrets via `wrangler secret put` (per env: `--env preview` and prod). Document the rotation procedure: who is allowed to rotate, where the secret-inventory lives, what happens when a plugin author leaves.
- Worker cleanup expectations (orphan pruning runs on `push`, but a vibe-coder removing a plugin should also confirm in the next push that the Worker is gone).
- Local dev caveat (the host repo's existing local-dev mechanism is the recommended path; `wrangler dev` available as alternative for plugin authors who want a CF-faithful local sim).
- Where logs go (Sentry project link + `wrangler tail` quickstart).

## How a request flows (end-to-end)

For a group plugin `my-plugin` whose group declares `target: "cloudflare-workers"`, `workersSubdomain: "ahaslide-plugins"`:

1. **Build time (host repo)**:
   - `packages/api/scripts/generate-slide-type-enum.js` includes `MyPlugin = 'my-plugin'` in the enum.
   - `packages/backend-main/scripts/generate-app-module.js` does **not** import `my-plugin`'s backend.
   - Frontend builds with the existing pipeline; output goes to S3 at `plugins.dev.ahaslide.com/my-plugin/...`.

2. **Build time (external repo)**:
   - On push to `master`, CI detects `my-plugin/backend/` changed and runs `wrangler deploy` from there.
   - Worker is published at `https://my-plugin.ahaslide-plugins.workers.dev`.

3. **Runtime**:
   - User opens a presentation containing a `MyPlugin` slide.
   - Presenter loads the manifest at `plugins.dev.ahaslide.com/my-plugin/manifest.json`, mounts the iframe.
   - Iframe (the plugin frontend) calls `getPluginBackendUrl('my-plugin', 'ahaslide-plugins')` → `https://my-plugin.ahaslide-plugins.workers.dev`.
   - Browser sends the request; CF Workers responds. Hono CORS middleware allows `*.ahaslides.com`, `*.ahaslide.com`, and `localhost` origins (callback-form match).

ECS aggregator container is never touched.

## Observability and error tracking

Without this floor, an on-call engineer has no way to find out what a Worker did at 2 AM. The design ships the floor with v1.

**Sentry per Worker.** `_template/backend/` includes `@sentry/cloudflare` in `dependencies` and a tiny init in `src/index.ts`:

```ts
import { Hono } from 'hono';
import * as Sentry from '@sentry/cloudflare';

const app = new Hono();
app.onError((err, c) => {
  Sentry.captureException(err);
  return c.json({ error: 'internal' }, 500);
});

export default Sentry.withSentry(env => ({ dsn: env.SENTRY_DSN }), app);
```

Each plugin's `wrangler.toml` reads `SENTRY_DSN` from a Worker secret. README documents `wrangler secret put SENTRY_DSN` as part of the one-time CF setup. AhaSliders org's existing Sentry workspace gets one project per plugin (or one project shared across plugins, with `tags.plugin = <name>` — pick the one that matches existing org conventions; implementation plan resolves this).

**Logpush** to the existing log destination (S3, Datadog, whatever ECS already feeds) is set up once per Worker via `wrangler tail` config or the CF dashboard. Out of scope to automate in v1, but documented in README so a maintainer can add it.

**`/health-check` smoke test in CI.** Already covered in the workflow above. PR builds also smoke-test, hitting the `<plugin>-preview` URL.

**`wrangler tail` quickstart in the README.** For interactive debugging.

## Hono justification

Why Hono and not alternatives:

- **vs. Itty Router** — Hono has built-in CORS, validation (zod), and error handling middleware. Itty is smaller but vibe-coders would re-implement those bits per plugin. Hono's bundle (~12 KB minified-and-gzipped) is well within Workers' size budget.
- **vs. raw `export default { fetch }`** — for a 20-line plugin, raw is fine. The moment the plugin needs validation, CORS, or routing logic, raw becomes glue-code per plugin. Standardizing on Hono keeps templates and patterns consistent.
- **vs. NestJS-on-Workers adapters** — heavy, brittle on V8 isolates (decorators + reflect-metadata), defeats priority A.

Hono is the canonical Workers framework with first-class CF binding support, large enough community for vibe-coders to copy patterns from, and small enough that template ergonomics stay simple.

## Rejected alternatives

- **Workers for Platforms (dispatcher Worker + namespace).** This is CF's "many-tenant Workers" pattern: one dispatcher Worker routes to namespaced sub-Workers, all observed/billed/configured centrally. Genuinely tempting at 30+ plugins. Rejected for v1 because:
  - It adds a new top-level concept (the dispatcher) that vibe-coders would have to understand to debug routing.
  - It pushes us into Workers Paid+ for the dispatch namespace API.
  - One Worker per plugin gives equal independence with simpler mental model — `wrangler deploy` is the whole story.
  - Worth revisiting if plugin count exceeds ~30 or if observability/auth/rate-limit consolidation pressure builds.

- **Cloudflare Pages Functions (FE + BE co-deploy).** Pages would let frontend and backend ship in one `wrangler pages deploy`. Rejected because the frontend half already has a working S3 + CloudFront pipeline this design explicitly preserves; switching to Pages for one group plugin would fork the frontend deploy story and complicate the host repo's existing CI.

- **Per-plugin override inside a group (mixed groups).** Not v1. Future extension: extend marker schema with `deployment.overrides.<plugin>.target = "ecs"`. Skip until proven need.

- **Multi-environment Workers (full staging/prod separation).** v1 ships only `[env.preview]` for PR builds + production. Full staging is a future addition — current shape supports it via wrangler envs without redesign.

## Trade-offs and edge cases

- **Plugin name in three places, automated.** Folder, `wrangler.toml` `name`, and frontend `PLUGIN_NAME` must match. `scripts/new-plugin.sh` automates the create path; CI's `lint-plugin-names` job catches manual edits that drift.
- **"Independent deploy" is partial.** Bumping plugin A's **backend** never touches plugin B or the ECS container — true independence. **Adding** a new plugin still requires a host-repo submodule SHA bump to expose its `SlideType` enum entry. Goal stated explicitly: backend deploys are independent; plugin onboarding requires one host commit.
- **Mixed groups are not supported.** A group is all-Workers or all-ECS. If a future need arises, extend the marker with a per-plugin override map (`deployment.overrides.<plugin>.target = "ecs"`). Not in v1.
- **Preview deploy on PR.** PR builds deploy to `<plugin>-preview.<subdomain>.workers.dev` and run a smoke test against `/health-check`. Production push to master deploys without the `-preview` suffix. A vibe-coder pushing broken code to master still goes live — but the PR preview is a free check first.
- **Worker pruning is automatic with a safety net.** `prune-orphans` job runs only on `push` (not PR), starts in `--dry-run` mode for the first quiet run, then a maintainer flips it to real deletion. Removing a plugin folder + push to master eventually removes the Worker.
- **Cold start.** Workers' cold start is ~5 ms. ECS Fargate stays warm. For low-traffic vibe-coded plugins, Workers is faster on average; for sustained high-traffic, ECS may be more predictable. Not a concern for this use case.
- **Worker resource limits.** Free tier: 10 ms CPU. Bundled plan: 50 ms. Unbound: up to 30 s. Plugins that call OpenAI (ideaBoard pattern) WILL exceed 50 ms wallclock and need `usage_model = "unbound"` in `wrangler.toml`. The template defaults to bundled (cheaper, fits most submission-handler plugins); README documents how to flip an AI plugin to unbound.
- **No DDoS rate limit out of the box.** A misbehaving caller can hammer a Worker. Cloudflare's free Bot Fight Mode + WAF rate-limit rules are available at the zone level; setting them up is out of scope for v1 but the README points at the relevant CF dashboard pages.
- **Cost ceiling.** v1 doesn't add a per-Worker spending cap. CF supports per-Worker limits via the dashboard; setting one is a manual one-time step per plugin and the README documents it.
- **Shared package compatibility.** `@aha/common` and `@aha/backend-utils` were checked at design time — both are pure types + one EMQX util, no Node-only APIs. Worker-safe. Future shared-package additions that pull in Node APIs will break Worker builds at compile time (loud failure, not silent). Workers `compatibility_flags` are deliberately NOT set to `nodejs_compat` — keeps the failure loud.
- **`workersSubdomain` is single-tenant.** v1 assumes one CF account hosts all group plugins. If a future group lives under a different CF account, the marker schema accommodates it (each group has its own `workersSubdomain`), but the smoke-test's `WORKERS_SUBDOMAIN` repo var is per-repo, not per-group.
- **Manifest serving.** Plugin manifests are still hosted on S3 at `plugins.dev.ahaslide.com/<plugin>/manifest.json`. Workers don't need to know about manifests — they serve plain HTTP API.
- **Per-plugin secret rotation has no automation.** Owner-of-record per plugin is implicit (the GitHub author). README documents the rotation procedure: who is allowed to rotate, where the secret-inventory lives, what to do when a plugin author leaves. Worker secrets aren't readable via API after `wrangler secret put`; rotation is `wrangler secret put <NAME>` again with the new value.

## Testing

The host-side change MUST include:

- Unit tests on `packages/backend-main/scripts/listPlugins.js` covering: ECS plugins (no group marker), Workers-target group plugins (skipped), missing `workersSubdomain` (throws), malformed `deployment` block (throws), mixed targets across groups (correct per-plugin tagging).
- A characterization test that runs the **whole** `generate-app-module.js` against the current `apps/*` layout and asserts the output is byte-identical to a golden snapshot. The snapshot is committed alongside the test. This guards "must not affect existing internal plugins."
- Equivalent characterization test for `generate-slide-type-enum.js` against the current layout.

The external-repo CI workflow includes:

- `lint-plugin-names` job (asserts folder == wrangler == frontend `PLUGIN_NAME`).
- `/health-check` smoke test as a deploy gate.
- `prune-orphans` job (dry-run first run, real after maintainer review).

## Total change set

**`aha-slide-plugin/`**

| File | Action |
|---|---|
| `packages/backend-main/scripts/listPlugins.js` | Modify — read group marker, expose `target` field |
| `packages/api/scripts/listPlugins.js` | Modify — same `target` field for shape consistency (consumer ignores it) |
| `packages/backend-main/scripts/listPlugins.test.js` | Modify — add tests for target-aware filter, malformed marker, missing `workersSubdomain` |
| `packages/api/scripts/listPlugins.test.js` | Modify — keep parity with backend-main test |
| `packages/backend-main/scripts/generate-app-module.js` | Modify — filter `target === 'ecs'` before generating |
| `packages/backend-main/scripts/generate-app-module.golden.test.js` | Create — characterization test, byte-identical output for current `apps/*` layout |
| `packages/api/scripts/generate-slide-type-enum.golden.test.js` | Create — characterization test for the enum |
| `packages/common/src/pluginBackendUrl.ts` | Create — `getPluginBackendUrl()` |
| `packages/common/src/index.ts` | Modify — export the helper |

**`slide-plugin-built-by-ahasliders/`**

| File | Action |
|---|---|
| `aha-plugin-group.json` | Modify — add `deployment` block |
| `_template/backend/src/index.ts` | Replace — NestJS → Hono with Sentry init + safe CORS callback |
| `_template/backend/wrangler.toml` | Replace — set `name`, `main`, `compatibility_date`, `[env.preview]` block |
| `_template/backend/package.json` | Replace — Hono, Sentry, wrangler deps |
| `_template/backend/tsconfig.json` | Replace — Workers types |
| `_template/backend/.dev.vars.sample` | Create — placeholders for `SENTRY_DSN`, optional `OPENAI_API_KEY` |
| `_template/frontend/src/services/api.ts` | Create — example fetch helper |
| `scripts/new-plugin.sh` | Create — automated cp + rename |
| `.github/workflows/deploy-workers.yaml` | Create — detect / lint-names / deploy / smoke-test / prune-orphans |
| `README.md` | Modify — CF setup, `WORKERS_SUBDOMAIN` repo var, secrets/rotation procedure, observability pointers, prune behavior |
