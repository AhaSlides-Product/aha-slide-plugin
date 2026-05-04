# Cloudflare Workers Deploy for Plugin Groups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow group plugins (folders under `apps/<group>/` whose `aha-plugin-group.json` has `deployment.backend.target = "cloudflare-workers"`) to deploy each backend to its own Cloudflare Worker via Hono — bypassing the ECS aggregator entirely. Host scanner is taught to skip these plugins; an external-repo CI workflow runs `wrangler deploy` per changed plugin.

**Architecture:** Two-prong change. (1) Host scanner gains a `target` field per plugin, propagated from the group marker; `generate-app-module.js` filters to `target === 'ecs'`. (2) The external repo's `_template/backend/` is swapped from NestJS to Hono + Sentry; a CI workflow detects changed plugin folders, lints name-consistency, deploys each (preview on PR, prod on push to master), smoke-tests `/health-check`, and prunes orphaned Workers. A `scripts/new-plugin.sh` automates the cp+rename foot-gun.

**Tech Stack:** Node.js 22 (built-in `node:test`, `--experimental-strip-types` for the TS helper test), Hono 4, Cloudflare wrangler 4, GitHub Actions (`dorny/paths-filter`, `cloudflare/wrangler-action`), Sentry Cloudflare SDK.

---

## Spec reference

Spec: `docs/superpowers/specs/2026-05-04-cloudflare-workers-deploy-design.md`

## File map

In `aha-slide-plugin/` (host monorepo):

| Path | Action | Purpose |
|---|---|---|
| `packages/backend-main/scripts/listPlugins.js` | Modify | Read group marker, tag each plugin with `{ name, dir, target }` |
| `packages/api/scripts/listPlugins.js` | Modify | Same shape change for parity (consumer ignores `target`) |
| `packages/backend-main/scripts/listPlugins.test.js` | Modify | Add tests for marker reading, default-ecs, malformed marker |
| `packages/api/scripts/listPlugins.test.js` | Modify | Mirror tests for parity |
| `packages/backend-main/scripts/generate-app-module.js` | Modify | Filter `target === 'ecs'` before generating |
| `packages/backend-main/scripts/generate-app-module.golden.test.js` | Create | Characterization test — pin today's output for current `apps/*` |
| `packages/backend-main/scripts/generate-app-module.golden.txt` | Create | Snapshot (committed) |
| `packages/api/scripts/generate-slide-type-enum.golden.test.js` | Create | Same for the enum |
| `packages/api/scripts/generate-slide-type-enum.golden.txt` | Create | Snapshot (committed) |
| `packages/common/src/pluginBackendUrl.ts` | Create | `getPluginBackendUrl(name, subdomain)` |
| `packages/common/src/pluginBackendUrl.test.ts` | Create | One assertion via `node --experimental-strip-types --test` |
| `packages/common/src/index.ts` | Modify | Export the helper |

In `slide-plugin-built-by-ahasliders/` (external repo, accessed via the `apps/slide-plugin-by-ahasliders/` submodule):

| Path | Action | Purpose |
|---|---|---|
| `aha-plugin-group.json` | Modify | Add `deployment.backend.target` + `workersSubdomain` |
| `_template/backend/src/index.ts` | Replace | Hono app + Sentry wrap + safe CORS callback |
| `_template/backend/wrangler.toml` | Replace | `name`, `main`, `compatibility_date`, `[env.preview]` |
| `_template/backend/package.json` | Replace | `hono`, `@sentry/cloudflare`; `wrangler`, `@cloudflare/workers-types`, `typescript` |
| `_template/backend/tsconfig.json` | Replace | Workers types |
| `_template/backend/.dev.vars.sample` | Create | Placeholders for `SENTRY_DSN`, optional `OPENAI_API_KEY` |
| `_template/frontend/src/services/api.ts` | Create | Backend-URL example using `getPluginBackendUrl` |
| `scripts/new-plugin.sh` | Create | Automated cp + rename in three places |
| `.github/workflows/deploy-workers.yaml` | Create | detect → lint-names → deploy → smoke → prune-orphans |
| `README.md` | Modify | CF setup, secrets, rotation, observability, prune behavior |

## Conventions

- Each task ends with one commit, with the exact message shown.
- Host-repo tasks commit on the current branch (`feat/external-plugin-group`).
- External-repo tasks commit inside `apps/slide-plugin-by-ahasliders/` (a separate working tree); they push to `master` of the external repo at the end of Phase B (Task 12).
- TDD red-green-commit. Don't skip the "run the test, see it fail for the expected reason" step.
- All new tests use `node:test` + `node:assert/strict` to match the existing scanner-test pattern. The TS helper test runs via `node --experimental-strip-types --test`.

---

## Phase A — Host monorepo

### Task 1: Capture golden snapshots and write characterization tests

**Why first:** Pins today's behavior so subsequent scanner changes are provably no-ops for existing internal plugins. The hard non-goal "must not affect existing internal plugins" gets a test, not just a hope.

**Files:**
- Create: `packages/backend-main/scripts/generate-app-module.golden.txt`
- Create: `packages/backend-main/scripts/generate-app-module.golden.test.js`
- Create: `packages/api/scripts/generate-slide-type-enum.golden.txt`
- Create: `packages/api/scripts/generate-slide-type-enum.golden.test.js`

- [ ] **Step 1: Capture the current generator output as the snapshot**

Working directory: `/home/zuzu/Workspaces/ahaslides/aha-slide-plugin`. Run the existing generators, then copy what they produce into `.golden.txt` files. Note: the *committed* `app.module.ts` and `slideType.ts` may be stale; we want what the generator *currently produces* against the current `apps/*` layout, not what's committed.

```bash
# capture current generator output as the golden snapshot
node packages/backend-main/scripts/generate-app-module.js
cp packages/backend-main/src/app.module.ts packages/backend-main/scripts/generate-app-module.golden.txt
git checkout packages/backend-main/src/app.module.ts packages/backend-main/package.json

node packages/api/scripts/generate-slide-type-enum.js
cp packages/api/src/slideType.ts packages/api/scripts/generate-slide-type-enum.golden.txt
git checkout packages/api/src/slideType.ts
```

- [ ] **Step 2: Write the characterization test for app.module.ts**

Create `packages/backend-main/scripts/generate-app-module.golden.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../../..');
const generated = path.resolve(__dirname, '../src/app.module.ts');
const pkgFile = path.resolve(__dirname, '../package.json');
const golden = path.resolve(__dirname, 'generate-app-module.golden.txt');

test('generate-app-module produces the golden snapshot for the current apps layout', () => {
  // Save originals so the test never leaves dirty state.
  const origModule = fs.readFileSync(generated, 'utf8');
  const origPkg = fs.readFileSync(pkgFile, 'utf8');
  try {
    execFileSync('node', [path.resolve(__dirname, 'generate-app-module.js')], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
    const produced = fs.readFileSync(generated, 'utf8');
    const expected = fs.readFileSync(golden, 'utf8');
    assert.strictEqual(produced, expected,
      'generator output diverged from golden snapshot — if intentional, regenerate the snapshot');
  } finally {
    fs.writeFileSync(generated, origModule);
    fs.writeFileSync(pkgFile, origPkg);
  }
});
```

- [ ] **Step 3: Write the characterization test for slideType.ts**

Create `packages/api/scripts/generate-slide-type-enum.golden.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../../..');
const generated = path.resolve(__dirname, '../src/slideType.ts');
const golden = path.resolve(__dirname, 'generate-slide-type-enum.golden.txt');

test('generate-slide-type-enum produces the golden snapshot for the current apps layout', () => {
  const orig = fs.readFileSync(generated, 'utf8');
  try {
    execFileSync('node', [path.resolve(__dirname, 'generate-slide-type-enum.js')], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
    const produced = fs.readFileSync(generated, 'utf8');
    const expected = fs.readFileSync(golden, 'utf8');
    assert.strictEqual(produced, expected);
  } finally {
    fs.writeFileSync(generated, orig);
  }
});
```

- [ ] **Step 4: Run both characterization tests — expect PASS (capture matches generator)**

```bash
node --test packages/backend-main/scripts/generate-app-module.golden.test.js
node --test packages/api/scripts/generate-slide-type-enum.golden.test.js
```

Expected: both report 1 passing test. If either fails, the snapshot capture step missed something — re-do Step 1.

- [ ] **Step 5: Commit**

```bash
git add packages/backend-main/scripts/generate-app-module.golden.txt \
        packages/backend-main/scripts/generate-app-module.golden.test.js \
        packages/api/scripts/generate-slide-type-enum.golden.txt \
        packages/api/scripts/generate-slide-type-enum.golden.test.js
git commit -m "test(scanner): pin today's generator output via golden snapshots"
```

---

### Task 2: Extend `packages/backend-main/scripts/listPlugins.js` with `target` field

**Files:**
- Modify: `packages/backend-main/scripts/listPlugins.js`
- Modify: `packages/backend-main/scripts/listPlugins.test.js`

- [ ] **Step 1: Write failing tests**

Append to `packages/backend-main/scripts/listPlugins.test.js`:

```js
test('plugin entries include target = "ecs" by default (no group marker)', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => ({ name: p.name, target: p.target })), [
    { name: 'sample-slide', target: 'ecs' },
  ]);
});

test('group marker without deployment block defaults plugins to target = "ecs"', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{"name":"community"}',
    'community/plugin-a/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.target), ['ecs']);
});

test('group marker with deployment.backend.target = "cloudflare-workers" tags children', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      name: 'community',
      deployment: { backend: { target: 'cloudflare-workers', workersSubdomain: 'my-acct' } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
    'community/plugin-b/backend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => ({ name: p.name, target: p.target })).sort((a, b) => a.name.localeCompare(b.name)), [
    { name: 'plugin-a', target: 'cloudflare-workers' },
    { name: 'plugin-b', target: 'cloudflare-workers' },
  ]);
});

test('mixed groups: each group tags its own children independently', () => {
  const root = makeFixture({
    'group-a/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'cloudflare-workers', workersSubdomain: 'a' } }
    }),
    'group-a/plugin-1/frontend/package.json': '{}',
    'group-b/aha-plugin-group.json': '{}',
    'group-b/plugin-2/frontend/package.json': '{}',
    'top-level/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  const byName = Object.fromEntries(plugins.map(p => [p.name, p.target]));
  assert.deepEqual(byName, {
    'plugin-1': 'cloudflare-workers',
    'plugin-2': 'ecs',
    'top-level': 'ecs',
  });
});

test('target = "cloudflare-workers" without workersSubdomain throws', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'cloudflare-workers' } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /workersSubdomain/i);
});

test('malformed deployment block (target is not a string) throws', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 42 } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /target/i);
});

test('unknown target value throws', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'lambda' } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /unknown.*target.*lambda/i);
});

test('marker JSON parse error throws with file path in message', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{invalid json',
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /aha-plugin-group\.json/);
});
```

- [ ] **Step 2: Run tests — expect FAIL (target field doesn't exist yet)**

```bash
node --test packages/backend-main/scripts/listPlugins.test.js
```

Expected: 8 tests fail because `p.target` is `undefined`.

- [ ] **Step 3: Implement target-field extension**

Replace contents of `packages/backend-main/scripts/listPlugins.js`:

```js
const fs = require('fs');
const path = require('path');

const GROUP_MARKER = 'aha-plugin-group.json';
const VALID_TARGETS = new Set(['ecs', 'cloudflare-workers']);

function isSkipped(name) {
  return name.startsWith('_') || name.startsWith('.');
}

function readGroupTarget(markerPath) {
  let raw;
  try {
    raw = fs.readFileSync(markerPath, 'utf8');
  } catch (e) {
    throw new Error(`Failed to read ${markerPath}: ${e.message}`);
  }
  let marker;
  try {
    marker = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse ${markerPath}: ${e.message}`);
  }
  const deployment = marker.deployment;
  if (!deployment || !deployment.backend) {
    return { target: 'ecs' };
  }
  const target = deployment.backend.target;
  if (target === undefined) {
    return { target: 'ecs' };
  }
  if (typeof target !== 'string') {
    throw new Error(`${markerPath}: deployment.backend.target must be a string`);
  }
  if (!VALID_TARGETS.has(target)) {
    throw new Error(`${markerPath}: unknown deployment.backend.target "${target}". Valid: ${[...VALID_TARGETS].join(', ')}`);
  }
  if (target === 'cloudflare-workers') {
    const sub = deployment.backend.workersSubdomain;
    if (typeof sub !== 'string' || sub.length === 0) {
      throw new Error(`${markerPath}: deployment.backend.workersSubdomain is required when target = "cloudflare-workers"`);
    }
  }
  return { target };
}

function listPlugins(appsDir) {
  const result = [];
  const byName = new Map();

  function add(name, dir, target) {
    if (byName.has(name)) {
      throw new Error(
        `Slide-type name collision: "${name}" exists in both\n  ${byName.get(name)}\n  ${dir}`
      );
    }
    byName.set(name, dir);
    result.push({ name, dir, target });
  }

  for (const entry of fs.readdirSync(appsDir)) {
    if (isSkipped(entry)) continue;
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    const markerPath = path.join(full, GROUP_MARKER);
    if (fs.existsSync(markerPath)) {
      const { target } = readGroupTarget(markerPath);
      for (const child of fs.readdirSync(full)) {
        if (isSkipped(child)) continue;
        const childFull = path.join(full, child);
        if (!fs.statSync(childFull).isDirectory()) continue;
        add(child, childFull, target);
      }
    } else {
      add(entry, full, 'ecs');
    }
  }
  return result;
}

module.exports = { listPlugins, GROUP_MARKER };
```

- [ ] **Step 4: Run all tests — expect PASS**

```bash
node --test packages/backend-main/scripts/listPlugins.test.js
node --test packages/backend-main/scripts/generate-app-module.golden.test.js
```

Expected: all listPlugins tests pass (16 total: 8 from previous PR + 8 new), AND the characterization test still passes (generator behavior unchanged because no group has the deployment block yet).

- [ ] **Step 5: Commit**

```bash
git add packages/backend-main/scripts/listPlugins.js packages/backend-main/scripts/listPlugins.test.js
git commit -m "feat(backend-main): listPlugins reads group marker and tags target per plugin"
```

---

### Task 3: Mirror `target` field into `packages/api/scripts/listPlugins.js`

**Files:**
- Modify: `packages/api/scripts/listPlugins.js`
- Modify: `packages/api/scripts/listPlugins.test.js`

- [ ] **Step 1: Append the same 8 tests to the api side**

Append to `packages/api/scripts/listPlugins.test.js` (after the existing tests from the previous PR):

```js
test('plugin entries include target = "ecs" by default (no group marker)', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => ({ name: p.name, target: p.target })), [
    { name: 'sample-slide', target: 'ecs' },
  ]);
});

test('group marker without deployment block defaults plugins to target = "ecs"', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{"name":"community"}',
    'community/plugin-a/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.target), ['ecs']);
});

test('group marker with deployment.backend.target = "cloudflare-workers" tags children', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      name: 'community',
      deployment: { backend: { target: 'cloudflare-workers', workersSubdomain: 'my-acct' } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
    'community/plugin-b/backend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => ({ name: p.name, target: p.target })).sort((a, b) => a.name.localeCompare(b.name)), [
    { name: 'plugin-a', target: 'cloudflare-workers' },
    { name: 'plugin-b', target: 'cloudflare-workers' },
  ]);
});

test('mixed groups: each group tags its own children independently', () => {
  const root = makeFixture({
    'group-a/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'cloudflare-workers', workersSubdomain: 'a' } }
    }),
    'group-a/plugin-1/frontend/package.json': '{}',
    'group-b/aha-plugin-group.json': '{}',
    'group-b/plugin-2/frontend/package.json': '{}',
    'top-level/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  const byName = Object.fromEntries(plugins.map(p => [p.name, p.target]));
  assert.deepEqual(byName, {
    'plugin-1': 'cloudflare-workers',
    'plugin-2': 'ecs',
    'top-level': 'ecs',
  });
});

test('target = "cloudflare-workers" without workersSubdomain throws', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'cloudflare-workers' } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /workersSubdomain/i);
});

test('malformed deployment block (target is not a string) throws', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 42 } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /target/i);
});

test('unknown target value throws', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'lambda' } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /unknown.*target.*lambda/i);
});

test('marker JSON parse error throws with file path in message', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{invalid json',
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /aha-plugin-group\.json/);
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
node --test packages/api/scripts/listPlugins.test.js
```

Expected: 8 new tests fail.

- [ ] **Step 3: Replace contents of `packages/api/scripts/listPlugins.js`**

Replace the entire file with:

```js
const fs = require('fs');
const path = require('path');

const GROUP_MARKER = 'aha-plugin-group.json';
const VALID_TARGETS = new Set(['ecs', 'cloudflare-workers']);

function isSkipped(name) {
  return name.startsWith('_') || name.startsWith('.');
}

function readGroupTarget(markerPath) {
  let raw;
  try {
    raw = fs.readFileSync(markerPath, 'utf8');
  } catch (e) {
    throw new Error(`Failed to read ${markerPath}: ${e.message}`);
  }
  let marker;
  try {
    marker = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse ${markerPath}: ${e.message}`);
  }
  const deployment = marker.deployment;
  if (!deployment || !deployment.backend) {
    return { target: 'ecs' };
  }
  const target = deployment.backend.target;
  if (target === undefined) {
    return { target: 'ecs' };
  }
  if (typeof target !== 'string') {
    throw new Error(`${markerPath}: deployment.backend.target must be a string`);
  }
  if (!VALID_TARGETS.has(target)) {
    throw new Error(`${markerPath}: unknown deployment.backend.target "${target}". Valid: ${[...VALID_TARGETS].join(', ')}`);
  }
  if (target === 'cloudflare-workers') {
    const sub = deployment.backend.workersSubdomain;
    if (typeof sub !== 'string' || sub.length === 0) {
      throw new Error(`${markerPath}: deployment.backend.workersSubdomain is required when target = "cloudflare-workers"`);
    }
  }
  return { target };
}

function listPlugins(appsDir) {
  const result = [];
  const byName = new Map();

  function add(name, dir, target) {
    if (byName.has(name)) {
      throw new Error(
        `Slide-type name collision: "${name}" exists in both\n  ${byName.get(name)}\n  ${dir}`
      );
    }
    byName.set(name, dir);
    result.push({ name, dir, target });
  }

  for (const entry of fs.readdirSync(appsDir)) {
    if (isSkipped(entry)) continue;
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    const markerPath = path.join(full, GROUP_MARKER);
    if (fs.existsSync(markerPath)) {
      const { target } = readGroupTarget(markerPath);
      for (const child of fs.readdirSync(full)) {
        if (isSkipped(child)) continue;
        const childFull = path.join(full, child);
        if (!fs.statSync(childFull).isDirectory()) continue;
        add(child, childFull, target);
      }
    } else {
      add(entry, full, 'ecs');
    }
  }
  return result;
}

module.exports = { listPlugins, GROUP_MARKER };
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
node --test packages/api/scripts/listPlugins.test.js
node --test packages/api/scripts/generate-slide-type-enum.golden.test.js
```

Expected: both green.

- [ ] **Step 5: Commit**

```bash
git add packages/api/scripts/listPlugins.js packages/api/scripts/listPlugins.test.js
git commit -m "feat(api): listPlugins parity with backend-main (target field)"
```

---

### Task 4: Filter `target === 'ecs'` in `generate-app-module.js`

**Files:**
- Modify: `packages/backend-main/scripts/generate-app-module.js`

- [ ] **Step 1: Read the current file and identify the listPlugins consumer**

```bash
grep -n "listPlugins" packages/backend-main/scripts/generate-app-module.js
```

Expected: one line, `for (const plugin of listPlugins(appsDir)) {`.

- [ ] **Step 2: Modify that line to filter Worker-target plugins**

In `packages/backend-main/scripts/generate-app-module.js`, replace:

```js
  for (const plugin of listPlugins(appsDir)) {
```

with:

```js
  for (const plugin of listPlugins(appsDir).filter(p => p.target === 'ecs')) {
```

- [ ] **Step 3: Run the characterization test — expect PASS**

```bash
node --test packages/backend-main/scripts/generate-app-module.golden.test.js
```

Expected: PASS. With no group currently declaring `cloudflare-workers`, every plugin has `target: 'ecs'`, the filter keeps everything, output matches the golden snapshot.

- [ ] **Step 4: Add a positive test that the filter actually fires when a Worker group exists**

This is a small targeted test — write it as part of `listPlugins.test.js` rather than a generator-level test (the generator's behavior is exercised end-to-end in Phase B/C):

```js
test('filter pattern (.filter(p => p.target === "ecs")) excludes Worker plugins', () => {
  const root = makeFixture({
    'sample/frontend/package.json': '{}',
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'cloudflare-workers', workersSubdomain: 'x' } }
    }),
    'community/worker-plugin/frontend/package.json': '{}',
  });
  const ecsOnly = listPlugins(root).filter(p => p.target === 'ecs');
  assert.deepEqual(ecsOnly.map(p => p.name), ['sample']);
});
```

Run: `node --test packages/backend-main/scripts/listPlugins.test.js` — expect PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/backend-main/scripts/generate-app-module.js packages/backend-main/scripts/listPlugins.test.js
git commit -m "feat(backend-main): generate-app-module filters Worker-target plugins"
```

---

### Task 5: Add `getPluginBackendUrl()` helper in `@aha/common`

**Files:**
- Create: `packages/common/src/pluginBackendUrl.ts`
- Create: `packages/common/src/pluginBackendUrl.test.ts`
- Modify: `packages/common/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/common/src/pluginBackendUrl.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { getPluginBackendUrl } from './pluginBackendUrl';

test('getPluginBackendUrl composes the workers.dev URL', () => {
  assert.strictEqual(
    getPluginBackendUrl('my-plugin', 'ahaslide-plugins'),
    'https://my-plugin.ahaslide-plugins.workers.dev'
  );
});

test('getPluginBackendUrl handles plugin names with hyphens', () => {
  assert.strictEqual(
    getPluginBackendUrl('quiz-leaderboard', 'aha'),
    'https://quiz-leaderboard.aha.workers.dev'
  );
});
```

- [ ] **Step 2: Run the test — expect FAIL**

```bash
node --experimental-strip-types --test packages/common/src/pluginBackendUrl.test.ts
```

Expected: error like `Cannot find module './pluginBackendUrl'`.

- [ ] **Step 3: Implement the helper**

Create `packages/common/src/pluginBackendUrl.ts`:

```ts
/**
 * Compute a Cloudflare Workers backend URL for a group plugin.
 *
 * Per design: each group plugin's backend is deployed as its own Worker
 * on the configured subdomain (declared in the group's aha-plugin-group.json).
 * Plugin name and folder name are required to match by convention.
 */
export function getPluginBackendUrl(pluginName: string, subdomain: string): string {
  return `https://${pluginName}.${subdomain}.workers.dev`;
}
```

- [ ] **Step 4: Run the test — expect PASS**

```bash
node --experimental-strip-types --test packages/common/src/pluginBackendUrl.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Export from the package's barrel**

Append to `packages/common/src/index.ts` (after the existing exports):

```ts
export * from './pluginBackendUrl';
```

- [ ] **Step 6: Verify the build succeeds**

```bash
npm run build -w @aha/common
```

Expected: clean build, `dist/cjs`, `dist/esm`, `dist/types` all updated with the new export.

- [ ] **Step 7: Commit**

```bash
git add packages/common/src/pluginBackendUrl.ts packages/common/src/pluginBackendUrl.test.ts packages/common/src/index.ts
git commit -m "feat(common): add getPluginBackendUrl helper for Worker-deployed plugins"
```

---

## Phase B — External repo (via the `apps/slide-plugin-by-ahasliders/` submodule)

All Phase B tasks operate inside `apps/slide-plugin-by-ahasliders/` — that directory is a git working tree of the `slide-plugin-built-by-ahasliders` repo. Each task makes one commit on its `master` branch. After all six tasks land, push to origin and bump the host repo's submodule pointer (Task 12).

**At the start of Phase B**, confirm:

```bash
cd apps/slide-plugin-by-ahasliders
git status        # expect clean
git branch --show-current   # expect master (or detached at master tip)
# If detached: git checkout master
```

### Task 6: Update `aha-plugin-group.json` with `deployment` block

**Files:**
- Modify: `apps/slide-plugin-by-ahasliders/aha-plugin-group.json`

- [ ] **Step 1: Update the marker**

Working directory: `apps/slide-plugin-by-ahasliders/`. Replace the file content with:

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

`workersSubdomain` value must match the actual Cloudflare workers.dev subdomain for the AhaSliders org's CF account. If unknown at write-time, leave `"ahaslide-plugins"` as a working default and have an admin confirm before merge.

- [ ] **Step 2: Verify host scanner now tags the group as Workers**

From the host repo root (`cd ../..`):

```bash
node -e "const { listPlugins } = require('./packages/backend-main/scripts/listPlugins.js'); console.log(JSON.stringify(listPlugins('./apps').filter(p => p.target === 'cloudflare-workers'), null, 2))"
```

Expected: an empty array `[]` — because the only entry under the marked group is `_template/`, which is skipped by the `_` prefix rule. The marker is correctly read; the filter runs; the group has no plugins yet.

- [ ] **Step 3: Run the characterization tests — expect PASS**

```bash
node --test packages/backend-main/scripts/generate-app-module.golden.test.js
node --test packages/api/scripts/generate-slide-type-enum.golden.test.js
```

Expected: both still pass (no Worker plugins yet, so no behavior change).

- [ ] **Step 4: Commit (inside the submodule)**

```bash
cd apps/slide-plugin-by-ahasliders
git add aha-plugin-group.json
git commit -m "feat: declare deployment.backend.target = cloudflare-workers"
```

---

### Task 7: Replace `_template/backend/` with Hono + Sentry skeleton

**Files (all under `apps/slide-plugin-by-ahasliders/_template/backend/`):**
- Delete: existing NestJS files (`src/`, `tsconfig.build.json`, `nest-cli.json`, `eslint.config.mjs`, `.prettierrc`, `.gitignore`, `README.md`, `test/`)
- Create: `src/index.ts`
- Create: `wrangler.toml`
- Replace: `package.json`
- Replace: `tsconfig.json`
- Create: `.dev.vars.sample`
- Create: `.gitignore`

- [ ] **Step 1: Wipe the old backend (NestJS) contents**

Working directory: `apps/slide-plugin-by-ahasliders/_template/backend/`.

```bash
cd apps/slide-plugin-by-ahasliders/_template/backend
git rm -rf src test tsconfig.build.json nest-cli.json eslint.config.mjs .prettierrc .gitignore README.md
mkdir -p src
```

- [ ] **Step 2: Write `src/index.ts`**

```ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as Sentry from '@sentry/cloudflare';

type Env = {
  SENTRY_DSN?: string;
};

// Anchored allow-list, callback form for Hono's CORS middleware.
// Adjust if presenter/audience domains differ — confirm before merge.
const ALLOWED_ORIGINS: RegExp[] = [
  /^https:\/\/([a-z0-9-]+\.)*ahaslides\.com$/,
  /^https:\/\/([a-z0-9-]+\.)*ahaslide\.com$/,
  /^http:\/\/localhost(:\d+)?$/,
];

function isAllowedOrigin(origin: string): string | null {
  return ALLOWED_ORIGINS.some(re => re.test(origin)) ? origin : null;
}

const app = new Hono<{ Bindings: Env }>();
app.use('*', cors({ origin: isAllowedOrigin }));

app.get('/health-check', c => c.text('OK'));

app.post('/', async c => {
  const payload = await c.req.json();
  // TODO: process the submission for this plugin
  return c.json({ count_total: [], count_unique: [] });
});

app.onError((err, c) => {
  Sentry.captureException(err);
  return c.json({ error: 'internal' }, 500);
});

export default Sentry.withSentry(
  (env: Env) => ({ dsn: env.SENTRY_DSN ?? '' }),
  app
);
```

- [ ] **Step 3: Write `wrangler.toml`**

```toml
name = "template"
main = "src/index.ts"
compatibility_date = "2026-05-04"
# Pin compatibility_date to the day the plugin is created. Bump deliberately
# when adopting new Workers runtime features. Do not paste old dates into new plugins.

[env.preview]
name = "template-preview"
```

- [ ] **Step 4: Write `package.json`**

```json
{
  "name": "@aha-external/template-backend",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:preview": "wrangler deploy --env preview"
  },
  "dependencies": {
    "@sentry/cloudflare": "^8",
    "hono": "^4"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4",
    "typescript": "^5",
    "wrangler": "^4"
  }
}
```

- [ ] **Step 5: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Write `.dev.vars.sample`**

```
# Copy this file to .dev.vars and fill in the values for local dev.
# Do NOT commit .dev.vars — it's in .gitignore.
SENTRY_DSN=
# Add per-plugin secrets below as needed:
# OPENAI_API_KEY=
```

- [ ] **Step 7: Write `.gitignore`**

```
node_modules
.dev.vars
.wrangler
dist
```

- [ ] **Step 8: Verify the template type-checks (without installing wrangler)**

Cannot fully verify until the npm install resolves; this step is a smoke check that the file shapes are right.

```bash
ls _template/backend
# Expect: .dev.vars.sample  .gitignore  package.json  src  tsconfig.json  wrangler.toml
```

- [ ] **Step 9: Commit**

```bash
cd apps/slide-plugin-by-ahasliders
git add _template/backend
git commit -m "feat(_template): swap NestJS backend skeleton for Hono + Sentry on Workers"
```

---

### Task 8: Add `_template/frontend/src/services/api.ts`

**Files:**
- Create: `apps/slide-plugin-by-ahasliders/_template/frontend/src/services/api.ts`

- [ ] **Step 1: Create the file**

```ts
import { getPluginBackendUrl } from '@aha/common';

// PLUGIN_NAME must match the plugin folder name AND the wrangler.toml `name`.
// scripts/new-plugin.sh keeps these in sync. The lint-plugin-names CI job fails
// the build if they drift.
const PLUGIN_NAME = 'template';

const BACKEND = (import.meta.env?.VITE_BACKEND_URL_OVERRIDE as string | undefined)
  ?? getPluginBackendUrl(PLUGIN_NAME, 'ahaslide-plugins');

export async function submit(payload: unknown): Promise<unknown> {
  const res = await fetch(BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`backend ${res.status}`);
  return res.json();
}

export async function healthCheck(): Promise<boolean> {
  const res = await fetch(`${BACKEND}/health-check`);
  return res.ok && (await res.text()) === 'OK';
}
```

- [ ] **Step 2: Verify it parses (no toolchain to run, just inspect)**

```bash
cat _template/frontend/src/services/api.ts | head -5
```

Expected: imports `getPluginBackendUrl` from `@aha/common`. Type-checking happens when a real plugin (not `_template`) is built via the host's existing pipeline.

- [ ] **Step 3: Commit**

```bash
git add _template/frontend/src/services/api.ts
git commit -m "feat(_template): example api.ts using getPluginBackendUrl"
```

---

### Task 9: Add `scripts/new-plugin.sh`

**Files:**
- Create: `apps/slide-plugin-by-ahasliders/scripts/new-plugin.sh`

- [ ] **Step 1: Write the script**

Working directory: `apps/slide-plugin-by-ahasliders/`.

```bash
mkdir -p scripts
```

Create `scripts/new-plugin.sh`:

```bash
#!/usr/bin/env bash
# Create a new plugin from _template, renaming all three name references.
# Usage: ./scripts/new-plugin.sh <plugin-name>
set -euo pipefail

name="${1:-}"
if [[ -z "$name" ]]; then
  echo "usage: $0 <plugin-name>" >&2
  exit 1
fi
if ! [[ "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "error: name must be kebab-case (got: $name)" >&2
  exit 1
fi
if [[ -e "$name" ]]; then
  echo "error: $name already exists" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

cp -R _template "$name"

# Rewrite all three references.
sed -i.bak "s|@aha-external/template-frontend|@aha-external/${name}-frontend|g" \
  "$name/frontend/package.json"
sed -i.bak "s|@aha-external/template-backend|@aha-external/${name}-backend|g" \
  "$name/backend/package.json"
sed -i.bak "s|^name = \"template\"|name = \"${name}\"|" \
  "$name/backend/wrangler.toml"
sed -i.bak "s|^name = \"template-preview\"|name = \"${name}-preview\"|" \
  "$name/backend/wrangler.toml"
sed -i.bak "s|const PLUGIN_NAME = 'template'|const PLUGIN_NAME = '${name}'|" \
  "$name/frontend/src/services/api.ts"

find "$name" -name '*.bak' -delete

echo "Created $name from _template."
echo ""
echo "Next steps:"
echo "  1. cd $name/backend && wrangler secret put SENTRY_DSN"
echo "  2. (optional) wrangler secret put <YOUR_PLUGIN_SECRET>"
echo "  3. wrangler deploy"
echo "  4. git add $name && git commit -m \"feat: scaffold $name plugin\""
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x scripts/new-plugin.sh
```

- [ ] **Step 3: Smoke-test the script locally**

```bash
./scripts/new-plugin.sh smoke-test-script
ls smoke-test-script
grep '"name"' smoke-test-script/frontend/package.json smoke-test-script/backend/package.json
grep '^name = ' smoke-test-script/backend/wrangler.toml
grep PLUGIN_NAME smoke-test-script/frontend/src/services/api.ts
```

Expected:
- `smoke-test-script/` exists with `frontend/`, `backend/`
- frontend package name: `@aha-external/smoke-test-script-frontend`
- backend package name: `@aha-external/smoke-test-script-backend`
- wrangler `name = "smoke-test-script"` and `name = "smoke-test-script-preview"`
- frontend `PLUGIN_NAME = 'smoke-test-script'`

Cleanup:

```bash
rm -rf smoke-test-script
```

- [ ] **Step 4: Commit**

```bash
git add scripts/new-plugin.sh
git commit -m "feat(scripts): add new-plugin.sh to scaffold a plugin from _template"
```

---

### Task 10: Add `.github/workflows/deploy-workers.yaml`

**Files:**
- Create: `apps/slide-plugin-by-ahasliders/.github/workflows/deploy-workers.yaml`

- [ ] **Step 1: Write the workflow**

Working directory: `apps/slide-plugin-by-ahasliders/`.

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy-workers.yaml`:

```yaml
name: Deploy Workers

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  discover:
    runs-on: ubuntu-latest
    outputs:
      plugins: ${{ steps.list.outputs.plugins }}
    steps:
      - uses: actions/checkout@v4
      - id: list
        name: Discover plugin folders
        run: |
          plugins=$(find . -maxdepth 3 -type f -name wrangler.toml \
            | grep '/backend/wrangler.toml$' \
            | sed 's|^\./||; s|/backend/wrangler.toml$||' \
            | grep -vE '^[_.]' \
            | sort -u \
            | jq -R -s -c 'split("\n") | map(select(length > 0))')
          echo "plugins=$plugins" >> "$GITHUB_OUTPUT"
          echo "Discovered: $plugins"

  changed:
    needs: discover
    if: needs.discover.outputs.plugins != '[]'
    runs-on: ubuntu-latest
    outputs:
      plugins: ${{ steps.filter.outputs.plugins }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - id: filter
        name: Detect changed plugin folders
        env:
          ALL_PLUGINS: ${{ needs.discover.outputs.plugins }}
        run: |
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            base="${{ github.event.pull_request.base.sha }}"
            head="${{ github.event.pull_request.head.sha }}"
          else
            base="${{ github.event.before }}"
            head="${{ github.sha }}"
          fi
          # Treat zero-SHA (first push to a branch) as "everything changed".
          if [[ "$base" =~ ^0+$ || -z "$base" ]]; then
            echo "plugins=$ALL_PLUGINS" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          changed_files=$(git diff --name-only "$base" "$head")
          changed=$(echo "$changed_files" \
            | grep -E '^[^_./][^/]*/' \
            | cut -d/ -f1 \
            | sort -u)
          # Intersect changed-folders with discovered plugins.
          plugins=$(echo "$ALL_PLUGINS" | jq -c --argjson c "$(echo "$changed" | jq -R -s -c 'split("\n") | map(select(length > 0))')" 'map(select(. as $p | $c | index($p)))')
          echo "plugins=$plugins" >> "$GITHUB_OUTPUT"
          echo "Changed plugins: $plugins"

  lint-names:
    needs: changed
    if: needs.changed.outputs.plugins != '[]'
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        plugin: ${{ fromJSON(needs.changed.outputs.plugins) }}
    steps:
      - uses: actions/checkout@v4
      - name: Assert folder == wrangler name == frontend PLUGIN_NAME
        run: |
          folder="${{ matrix.plugin }}"
          wname=$(awk -F'"' '/^name = "/{print $2; exit}' "$folder/backend/wrangler.toml")
          fname=$(grep -oE "PLUGIN_NAME = '[^']+'" "$folder/frontend/src/services/api.ts" | head -1 | sed "s/PLUGIN_NAME = '\(.*\)'/\1/")
          if [[ "$folder" != "$wname" || "$folder" != "$fname" ]]; then
            echo "::error::name mismatch in $folder: folder='$folder' wrangler='$wname' frontend='$fname'"
            exit 1
          fi
          echo "OK: $folder"

  deploy:
    needs: [changed, lint-names]
    if: needs.changed.outputs.plugins != '[]'
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        plugin: ${{ fromJSON(needs.changed.outputs.plugins) }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install plugin backend deps
        working-directory: ${{ matrix.plugin }}/backend
        run: npm install
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: ${{ matrix.plugin }}/backend
          command: ${{ github.event_name == 'pull_request' && 'deploy --env preview' || 'deploy' }}
      - name: Smoke-test /health-check
        env:
          SUBDOMAIN: ${{ vars.WORKERS_SUBDOMAIN }}
        run: |
          suffix=""
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then suffix="-preview"; fi
          url="https://${{ matrix.plugin }}${suffix}.${SUBDOMAIN}.workers.dev/health-check"
          for i in 1 2 3 4 5; do
            body=$(curl -fsS --max-time 5 "$url" 2>/dev/null || true)
            if [[ "$body" == "OK" ]]; then
              echo "Health check OK: $url"
              exit 0
            fi
            sleep 3
          done
          echo "::error::Health check failed for $url"
          exit 1

  prune-orphans:
    needs: [discover, deploy]
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      ALL_PLUGINS: ${{ needs.discover.outputs.plugins }}
    steps:
      - name: List configured plugins (manual prune required for v1)
        run: |
          # v1 prune is a manual notice, not an automation. Reason: the CF Workers
          # account may contain unrelated Workers (other projects, internal tools).
          # Listing all account-Workers and treating "not in this repo" as orphans
          # would risk deleting unrelated scripts.
          #
          # Promotion path: when this repo's Workers all share a stable naming prefix,
          # filter the API response by that prefix and call `wrangler delete` on the
          # diff. Until then, pruning is a maintainer responsibility.
          echo "Configured plugins in this repo:"
          echo "$ALL_PLUGINS" | jq -r '.[]'
          echo ""
          echo "If you removed a plugin folder above, delete its Worker manually:"
          echo "  npx wrangler@4 delete --name <plugin-name>"
          echo "  npx wrangler@4 delete --name <plugin-name>-preview"
```

The `prune-orphans` job is intentionally dry-run for v1. Promotion to real deletion is a separate maintainer commit once the dry-run output has been reviewed.

- [ ] **Step 2: Lint the YAML locally if `actionlint` is available**

```bash
which actionlint && actionlint .github/workflows/deploy-workers.yaml || echo "actionlint not installed; skip"
```

If lint complains, fix and re-check. Otherwise proceed.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-workers.yaml
git commit -m "feat(ci): deploy-workers workflow (discover, lint-names, deploy, smoke, prune dry-run)"
```

---

### Task 11: Update `README.md`

**Files:**
- Modify: `apps/slide-plugin-by-ahasliders/README.md`

- [ ] **Step 1: Replace the README with the expanded content**

Working directory: `apps/slide-plugin-by-ahasliders/`. Replace `README.md`:

```markdown
# Plugins by AhaSliders

A multi-plugin repository owned by AhaSliders staff. Each top-level folder (other than `_template/` and dot/underscore-prefixed folders) is one slide-plugin and lives at the same path inside `aha-slide-plugin` once the submodule is mounted.

Backends in this group deploy to **Cloudflare Workers**, one Worker per plugin, via the workflow in `.github/workflows/deploy-workers.yaml`. They do **not** ship in the host's ECS container.

## Quick start (vibe-coder happy path)

```bash
./scripts/new-plugin.sh my-new-slide
cd my-new-slide/backend
wrangler login                   # one-time per machine
wrangler secret put SENTRY_DSN   # paste your plugin's Sentry DSN
wrangler deploy                  # ships to <my-new-slide>.<workersSubdomain>.workers.dev
```

Push to `master`:

```bash
git add my-new-slide
git commit -m "feat: scaffold my-new-slide"
git push origin master
```

CI auto-deploys the Worker on every push that touches `my-new-slide/backend/`.

## One-time admin setup (per repo)

The CI workflow needs:

| Where | Name | Value |
|---|---|---|
| GitHub Actions secrets | `CLOUDFLARE_API_TOKEN` | Token scoped to "Edit Cloudflare Workers" |
| GitHub Actions secrets | `CLOUDFLARE_ACCOUNT_ID` | The CF account ID |
| GitHub Actions variables | `WORKERS_SUBDOMAIN` | `ahaslide-plugins` (must match `aha-plugin-group.json`'s `deployment.backend.workersSubdomain`) |

## Plugin name in three places (automated)

When you copy `_template`, the plugin name appears in:

1. The folder name (`my-new-slide/`)
2. `<plugin>/backend/wrangler.toml` (`name = "my-new-slide"`, `[env.preview] name = "my-new-slide-preview"`)
3. `<plugin>/frontend/src/services/api.ts` (`const PLUGIN_NAME = 'my-new-slide'`)

`scripts/new-plugin.sh` rewrites all three. The `lint-names` CI job fails the build if they drift later.

## Per-plugin secrets

CI does **not** manage plugin secrets. The plugin author runs `wrangler secret put` once per secret per environment:

```bash
cd my-new-slide/backend
wrangler secret put SENTRY_DSN              # production
wrangler secret put SENTRY_DSN --env preview # preview env (PR builds)
wrangler secret put OPENAI_API_KEY          # if your plugin needs it
```

Worker secrets are write-only via the API after upload — there is no rotation automation. **Rotation procedure**: re-run `wrangler secret put <NAME>` with the new value. Owner-of-record per secret is the plugin author. When a plugin author leaves AhaSliders, an admin should re-rotate every secret on every Worker the author touched.

## Local dev

The recommended path is the host repo's existing local-dev mechanism. For plugin authors who want a Cloudflare-faithful local sim:

```bash
cd my-new-slide/backend
cp .dev.vars.sample .dev.vars   # add your local-only secret values
wrangler dev                     # http://localhost:8787
```

In the plugin's frontend, set `VITE_BACKEND_URL_OVERRIDE=http://localhost:8787` to point at your local Worker instead of the deployed one.

## Where logs go

- **Sentry**: each plugin has its own DSN. The `_template` ships with `@sentry/cloudflare` wired up; uncaught errors become Sentry events automatically.
- **`wrangler tail`**: for interactive debugging, `cd <plugin>/backend && wrangler tail`. Streams live logs from the deployed Worker.
- **Logpush** to Datadog/S3: not automated yet. An admin can configure it per Worker via the CF dashboard if a plugin needs centralized log retention.

## Removing a plugin

Delete the plugin folder and push to master. The `prune-orphans` CI job (dry-run by default) will identify the orphaned Worker. To actually delete it, run:

```bash
npx wrangler@4 delete --name <plugin-name>
npx wrangler@4 delete --name <plugin-name>-preview
```

A maintainer can promote `prune-orphans` from dry-run to real deletion by editing the workflow once they're comfortable with the output.

## Recognized as a plugin group

The host scanners recognize this repo as a plugin group via the `aha-plugin-group.json` file at the root. The `deployment.backend.target = "cloudflare-workers"` setting tells the host scanner to **skip** this group's backends when generating the ECS app module. Don't delete or change `aha-plugin-group.json` without coordinating with the host repo.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README for Cloudflare Workers deploy flow"
```

---

### Task 12: Push the submodule and bump host pointer

**Files (host):**
- Modify: `apps/slide-plugin-by-ahasliders` (submodule pointer)

- [ ] **Step 1: From inside the submodule, push to origin master**

```bash
cd apps/slide-plugin-by-ahasliders
git log --oneline master | head -7
# expect 6 new commits on top of the previous PR's scaffold commit
git push origin master
```

- [ ] **Step 2: Back at the host repo, stage the submodule pointer bump**

```bash
cd ../..   # back to aha-slide-plugin root
git status apps/slide-plugin-by-ahasliders
# expect: modified content (new commits)
git add apps/slide-plugin-by-ahasliders
```

- [ ] **Step 3: Confirm only the submodule pointer is staged (no host code)**

```bash
git diff --cached --stat
# expect a single line referencing apps/slide-plugin-by-ahasliders
```

If anything else is staged, unstage it (`git reset HEAD <path>`).

- [ ] **Step 4: Commit the bump**

```bash
git commit -m "feat: bump slide-plugin-by-ahasliders to Workers-deploy scaffold"
```

---

## Phase C — Final verification

### Task 13: End-to-end build smoke and PR creation

**Files:** None (verification only).

- [ ] **Step 1: Run all relevant tests**

```bash
node --test packages/api/scripts/listPlugins.test.js
node --test packages/backend-main/scripts/listPlugins.test.js
node --test packages/backend-main/scripts/generate-app-module.golden.test.js
node --test packages/api/scripts/generate-slide-type-enum.golden.test.js
node --experimental-strip-types --test packages/common/src/pluginBackendUrl.test.ts
```

Expected: all pass. listPlugins suites should be 16+ tests each (8 from previous PR + 8 new + 1 from Task 4 Step 4 = 17 in backend-main, 16 in api).

- [ ] **Step 2: Run the full host build**

```bash
npx turbo run build --filter=@aha/api --filter=@aha/backend-main --filter=@aha/common
```

Expected: clean build for all three packages. The backend-main build's prebuild scanner picks up the new marker shape.

- [ ] **Step 3: Confirm the existing 3 internal plugins are still ECS-bound**

```bash
node -e "
const { listPlugins } = require('./packages/backend-main/scripts/listPlugins.js');
const plugins = listPlugins('./apps');
const ecs = plugins.filter(p => p.target === 'ecs').map(p => p.name).sort();
const cf = plugins.filter(p => p.target === 'cloudflare-workers').map(p => p.name).sort();
console.log('ECS:', ecs);
console.log('Workers:', cf);
"
```

Expected:
- `ECS:` list contains at least `ideaBoard`, `pinOnImage`, `ranking`, `sample-slide` (and any other internal plugins that exist).
- `Workers:` list is empty — the slide-plugin-by-ahasliders group exists but its only child (`_template/`) is skipped by the underscore rule.

- [ ] **Step 4: Confirm the host `git status` is clean of unintended changes**

```bash
git status --short
```

Expected: only the pre-existing dirty entries from before this work (`apps/ideaBoard`, `apps/pinOnImage`, `apps/ranking` submodule pointer changes, `domains/report` pointer, untracked `apps/infographic/`, `apps/markdown/`, `tsconfig.tsbuildinfo`). These are not part of this plan.

- [ ] **Step 5: Push the host branch and open the PR**

```bash
git push -u origin feat/external-plugin-group
gh pr view --web 2>/dev/null || gh pr create --base staging --head feat/external-plugin-group \
  --title "feat: cloudflare workers deploy for plugin groups" \
  --body "Layered on top of #36. Spec at docs/superpowers/specs/2026-05-04-cloudflare-workers-deploy-design.md, plan at docs/superpowers/plans/2026-05-04-cloudflare-workers-deploy.md. Hard non-goal preserved: existing internal plugins (ranking, ideaBoard, pinOnImage, sample-slide) stay on ECS. See spec for full reviewer notes."
```

If PR #36 is still open and this branch is the same one, `gh pr view --web` reuses it. Otherwise create a new PR. The user reviews the full PR.

---

## Done criteria

- [ ] All scanner unit tests pass: `packages/{api,backend-main}/scripts/listPlugins.test.js` (≥16 tests each).
- [ ] Both characterization tests pass: `generate-app-module.golden.test.js`, `generate-slide-type-enum.golden.test.js`.
- [ ] `getPluginBackendUrl` test passes (2 cases).
- [ ] `npx turbo run build --filter=@aha/api --filter=@aha/backend-main --filter=@aha/common` exits 0.
- [ ] `listPlugins('./apps')` shows existing internal plugins as `target: 'ecs'` and shows zero `cloudflare-workers` plugins (since no real Worker plugin has been added yet — only `_template/`, which is skipped).
- [ ] `apps/slide-plugin-by-ahasliders/` submodule pointer references a commit that includes the new marker, the Hono `_template/`, `scripts/new-plugin.sh`, the CI workflow, and the new README.
- [ ] PR opened against `staging` (or layered onto #36 if still open).

---

## Out of scope (deliberately, per spec)

- Migrating `ranking`, `ideaBoard`, `pinOnImage`, `sample-slide` to Workers. They stay on ECS forever.
- Custom domains (`<plugin>.plugins.ahaslide.com`).
- Per-plugin override inside a group (mixed groups).
- Full multi-environment split (only `[env.preview]` ships in v1).
- Logpush automation (manual via CF dashboard).
- Per-Worker cost ceiling automation (manual via CF dashboard).
- Workers-for-Platforms / dispatch namespaces.
- Cloudflare Pages Functions migration of frontend.
