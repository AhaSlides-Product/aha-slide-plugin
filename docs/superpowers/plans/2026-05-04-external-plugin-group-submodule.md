# External Plugin Group Submodule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mount `slide-plugin-built-by-ahasliders` as a many-plugins-in-one-repo submodule under `apps/`, recognized by an `aha-plugin-group.json` marker, without breaking any existing plugin.

**Architecture:** Two scanners (`packages/api/scripts/generate-slide-type-enum.js`, `packages/backend-main/scripts/generate-app-module.js`) currently walk `apps/*` and treat each subfolder as a plugin. We extract the walking logic into a unit-testable `listPlugins()` helper per scanner, extend it with three rules (group-marker recursion, `_`/`.` prefix skip, collision guard), then add the workspaces glob and submodule.

**Tech Stack:** Node.js 22 (built-in `node:test`), CommonJS scripts, Turborepo + npm workspaces, NestJS RouterModule auto-generation.

---

## Spec reference

Spec: `docs/superpowers/specs/2026-05-04-external-plugin-group-submodule-design.md`

## File map

In `aha-slide-plugin/` (host monorepo):

| Path | Action | Purpose |
|---|---|---|
| `packages/api/scripts/listPlugins.js` | **Create** | Pure helper — walks an `appsDir` and returns plugin records with the group-marker rule |
| `packages/api/scripts/listPlugins.test.js` | **Create** | `node:test` suite for the helper |
| `packages/api/scripts/generate-slide-type-enum.js` | **Modify** | Use `listPlugins()` instead of inlined `readdirSync` |
| `packages/backend-main/scripts/listPlugins.js` | **Create** | Same helper, copied (15 lines duplicated; intentional per spec) |
| `packages/backend-main/scripts/listPlugins.test.js` | **Create** | `node:test` suite for the backend variant |
| `packages/backend-main/scripts/generate-app-module.js` | **Modify** | Use `listPlugins()` instead of inlined `readdirSync` |
| `package.json` | **Modify** | Append `apps/*/*/*` to `workspaces` |
| `.gitmodules` | **Modify** | Append `apps/slide-plugin-by-ahasliders` entry |

In `slide-plugin-built-by-ahasliders/` (external repo):

| Path | Action | Purpose |
|---|---|---|
| `aha-plugin-group.json` | **Create** | Marker file recognized by the host scanners |
| `_template/frontend/` | **Create** | Starter copy of `apps/sample-slide/frontend/` with `@aha-external/...` names |
| `_template/backend/` | **Create** | Starter copy of `apps/sample-slide/backend/` with `@aha-external/...` names |
| `README.md` | **Create** | How to add a plugin and how to test locally via `aha-slide-plugin` |

## Conventions

- Each task ends with a commit. Tasks are independent and can be reverted in isolation.
- Tests live next to the code they test. Run via `node --test <file>`.
- For host-repo changes, the working directory is `aha-slide-plugin/` unless stated.
- For external-repo changes, the working directory is `slide-plugin-built-by-ahasliders/`.

---

## Task 1: Extract `listPlugins()` helper for the slide-type enum (no behavior change)

**Why first:** Establishes a unit-testable seam without changing what gets generated. Lets every later rule be added test-first.

**Files:**
- Create: `packages/api/scripts/listPlugins.js`
- Create: `packages/api/scripts/listPlugins.test.js`
- Modify: `packages/api/scripts/generate-slide-type-enum.js`

- [ ] **Step 1: Write the failing test (preserves today's behavior)**

Create `packages/api/scripts/listPlugins.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { listPlugins } = require('./listPlugins');

function makeFixture(layout) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'list-plugins-'));
  for (const [relPath, content] of Object.entries(layout)) {
    const full = path.join(root, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

test('flat apps directory returns each subfolder as a plugin', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
    'ranking/frontend/package.json': '{}',
    'ranking/backend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(
    plugins.map(p => p.name).sort(),
    ['ranking', 'sample-slide']
  );
  for (const p of plugins) {
    assert.ok(p.dir.startsWith(root), 'dir is absolute under root');
  }
});

test('non-directory entries are ignored', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
    'README.md': '# hi',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.name), ['sample-slide']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test packages/api/scripts/listPlugins.test.js`
Expected: FAIL — `Cannot find module './listPlugins'`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/api/scripts/listPlugins.js`:

```js
const fs = require('fs');
const path = require('path');

function listPlugins(appsDir) {
  const result = [];
  for (const entry of fs.readdirSync(appsDir)) {
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    result.push({ name: entry, dir: full });
  }
  return result;
}

module.exports = { listPlugins };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test packages/api/scripts/listPlugins.test.js`
Expected: PASS — both tests green.

- [ ] **Step 5: Refactor `generate-slide-type-enum.js` to use the helper**

Replace the body of `packages/api/scripts/generate-slide-type-enum.js` with:

```js
const fs = require('fs');
const path = require('path');
const { listPlugins } = require('./listPlugins');

const rootDir = path.resolve(__dirname, '../../..');
const appsDir = path.resolve(rootDir, 'apps');
const targetFile = path.resolve(__dirname, '../src/slideType.ts');

function capitalize(str) {
  return str
    .split(/[-_]/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function generate() {
  if (!fs.existsSync(appsDir)) {
    console.error(`Apps directory not found: ${appsDir}`);
    process.exit(1);
  }

  const plugins = listPlugins(appsDir);

  const enumEntries = plugins
    .map(p => `  ${capitalize(p.name)} = '${p.name}',`)
    .join('\n');

  const content = `/**
 * This file is AUTO-GENERATED. Do not edit it manually.
 * Generated by scripts/generate-slide-type-enum.js
 */
export enum SlideType {
${enumEntries}
}
`;

  fs.writeFileSync(targetFile, content);
  console.log(`Successfully generated ${path.relative(rootDir, targetFile)}`);
}

generate();
```

- [ ] **Step 6: Verify the generated enum is unchanged**

Run: `node packages/api/scripts/generate-slide-type-enum.js`
Then: `git diff packages/api/src/slideType.ts`
Expected: no diff (the enum entries match what was generated before).

- [ ] **Step 7: Commit**

```bash
git add packages/api/scripts/listPlugins.js packages/api/scripts/listPlugins.test.js packages/api/scripts/generate-slide-type-enum.js
git commit -m "refactor(api): extract listPlugins helper from generate-slide-type-enum"
```

---

## Task 2: Add group-marker rule to `listPlugins()` (recurse one level)

**Files:**
- Modify: `packages/api/scripts/listPlugins.js`
- Modify: `packages/api/scripts/listPlugins.test.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/api/scripts/listPlugins.test.js`:

```js
test('folder with aha-plugin-group.json is treated as a group; children become plugins', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
    'community/aha-plugin-group.json': '{"name":"community"}',
    'community/plugin-a/frontend/package.json': '{}',
    'community/plugin-b/frontend/package.json': '{}',
    'community/plugin-b/backend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(
    plugins.map(p => p.name).sort(),
    ['plugin-a', 'plugin-b', 'sample-slide']
  );
  const pluginA = plugins.find(p => p.name === 'plugin-a');
  assert.ok(
    pluginA.dir.endsWith(path.join('community', 'plugin-a')),
    'plugin-a dir is under the group folder'
  );
});

test('group folder itself is not registered as a plugin', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{}',
    'community/plugin-a/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.ok(
    !plugins.some(p => p.name === 'community'),
    'group folder name does not appear as a plugin'
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test packages/api/scripts/listPlugins.test.js`
Expected: FAIL — first new test reports `community` in the plugin list instead of `plugin-a`/`plugin-b`.

- [ ] **Step 3: Implement the group-marker rule**

Replace `packages/api/scripts/listPlugins.js` with:

```js
const fs = require('fs');
const path = require('path');

const GROUP_MARKER = 'aha-plugin-group.json';

function listPlugins(appsDir) {
  const result = [];
  for (const entry of fs.readdirSync(appsDir)) {
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    if (fs.existsSync(path.join(full, GROUP_MARKER))) {
      for (const child of fs.readdirSync(full)) {
        const childFull = path.join(full, child);
        if (!fs.statSync(childFull).isDirectory()) continue;
        result.push({ name: child, dir: childFull });
      }
    } else {
      result.push({ name: entry, dir: full });
    }
  }
  return result;
}

module.exports = { listPlugins, GROUP_MARKER };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test packages/api/scripts/listPlugins.test.js`
Expected: PASS — all four tests green (two old + two new).

- [ ] **Step 5: Commit**

```bash
git add packages/api/scripts/listPlugins.js packages/api/scripts/listPlugins.test.js
git commit -m "feat(api): listPlugins recurses into group folders marked with aha-plugin-group.json"
```

---

## Task 3: Skip folders prefixed with `_` or `.` at every depth

**Why:** The `_template/` starter inside the external repo would otherwise be picked up as a plugin (it has its own `frontend/` + `backend/`).

**Files:**
- Modify: `packages/api/scripts/listPlugins.js`
- Modify: `packages/api/scripts/listPlugins.test.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/api/scripts/listPlugins.test.js`:

```js
test('folders starting with _ or . are skipped at top level', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
    '_template/frontend/package.json': '{}',
    '.cache/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.name), ['sample-slide']);
});

test('folders starting with _ or . inside a group are skipped', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{}',
    'community/_template/frontend/package.json': '{}',
    'community/plugin-a/frontend/package.json': '{}',
    'community/.scratch/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.name), ['plugin-a']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test packages/api/scripts/listPlugins.test.js`
Expected: FAIL — `_template` and `.cache` show up in the plugin list.

- [ ] **Step 3: Implement the skip rule**

Replace the body of `listPlugins` in `packages/api/scripts/listPlugins.js` so it ignores skipped names at both levels:

```js
const fs = require('fs');
const path = require('path');

const GROUP_MARKER = 'aha-plugin-group.json';

function isSkipped(name) {
  return name.startsWith('_') || name.startsWith('.');
}

function listPlugins(appsDir) {
  const result = [];
  for (const entry of fs.readdirSync(appsDir)) {
    if (isSkipped(entry)) continue;
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    if (fs.existsSync(path.join(full, GROUP_MARKER))) {
      for (const child of fs.readdirSync(full)) {
        if (isSkipped(child)) continue;
        const childFull = path.join(full, child);
        if (!fs.statSync(childFull).isDirectory()) continue;
        result.push({ name: child, dir: childFull });
      }
    } else {
      result.push({ name: entry, dir: full });
    }
  }
  return result;
}

module.exports = { listPlugins, GROUP_MARKER };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test packages/api/scripts/listPlugins.test.js`
Expected: PASS — all six tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/api/scripts/listPlugins.js packages/api/scripts/listPlugins.test.js
git commit -m "feat(api): listPlugins skips folders prefixed with _ or ."
```

---

## Task 4: Detect and abort on slide-type name collisions

**Files:**
- Modify: `packages/api/scripts/listPlugins.js`
- Modify: `packages/api/scripts/listPlugins.test.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/api/scripts/listPlugins.test.js`:

```js
test('collision between top-level plugin and grouped plugin throws', () => {
  const root = makeFixture({
    'ranking/frontend/package.json': '{}',
    'community/aha-plugin-group.json': '{}',
    'community/ranking/frontend/package.json': '{}',
  });
  assert.throws(
    () => listPlugins(root),
    err => {
      assert.match(err.message, /name collision/i);
      assert.match(err.message, /ranking/);
      assert.match(err.message, /community/);
      return true;
    }
  );
});

test('collision between two grouped plugins throws', () => {
  const root = makeFixture({
    'group-a/aha-plugin-group.json': '{}',
    'group-a/duplicate/frontend/package.json': '{}',
    'group-b/aha-plugin-group.json': '{}',
    'group-b/duplicate/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /name collision/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test packages/api/scripts/listPlugins.test.js`
Expected: FAIL — no error thrown; both `ranking` entries returned.

- [ ] **Step 3: Implement the collision guard**

Replace the contents of `packages/api/scripts/listPlugins.js` with:

```js
const fs = require('fs');
const path = require('path');

const GROUP_MARKER = 'aha-plugin-group.json';

function isSkipped(name) {
  return name.startsWith('_') || name.startsWith('.');
}

function listPlugins(appsDir) {
  const result = [];
  const byName = new Map();

  function add(name, dir) {
    if (byName.has(name)) {
      throw new Error(
        `Slide-type name collision: "${name}" exists in both\n  ${byName.get(name)}\n  ${dir}`
      );
    }
    byName.set(name, dir);
    result.push({ name, dir });
  }

  for (const entry of fs.readdirSync(appsDir)) {
    if (isSkipped(entry)) continue;
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    if (fs.existsSync(path.join(full, GROUP_MARKER))) {
      for (const child of fs.readdirSync(full)) {
        if (isSkipped(child)) continue;
        const childFull = path.join(full, child);
        if (!fs.statSync(childFull).isDirectory()) continue;
        add(child, childFull);
      }
    } else {
      add(entry, full);
    }
  }
  return result;
}

module.exports = { listPlugins, GROUP_MARKER };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test packages/api/scripts/listPlugins.test.js`
Expected: PASS — all eight tests green.

- [ ] **Step 5: Smoke-test against real apps directory**

Run: `node packages/api/scripts/generate-slide-type-enum.js`
Expected: writes `packages/api/src/slideType.ts` with no error.
Then: `git diff packages/api/src/slideType.ts`
Expected: no diff — current real `apps/` has no group folders yet, so the output is unchanged.

- [ ] **Step 6: Commit**

```bash
git add packages/api/scripts/listPlugins.js packages/api/scripts/listPlugins.test.js
git commit -m "feat(api): listPlugins aborts on slide-type name collisions"
```

---

## Task 5: Mirror the helper for `backend-main`

**Why a separate copy:** The two scripts run in different package contexts (`packages/api/scripts/` vs `packages/backend-main/scripts/`) and there's no existing shared scripts package to put the helper in. ~30 lines of intentional duplication, called out as a trade-off in the spec.

**Files:**
- Create: `packages/backend-main/scripts/listPlugins.js`
- Create: `packages/backend-main/scripts/listPlugins.test.js`
- Modify: `packages/backend-main/scripts/generate-app-module.js`

- [ ] **Step 1: Copy the tested helper and tests**

```bash
cp packages/api/scripts/listPlugins.js packages/backend-main/scripts/listPlugins.js
cp packages/api/scripts/listPlugins.test.js packages/backend-main/scripts/listPlugins.test.js
```

- [ ] **Step 2: Run the copied test suite**

Run: `node --test packages/backend-main/scripts/listPlugins.test.js`
Expected: PASS — all eight tests green.

- [ ] **Step 3: Refactor `generate-app-module.js` to use the helper and to skip backend-less plugins**

Replace `packages/backend-main/scripts/generate-app-module.js` with:

```js
const fs = require('fs');
const path = require('path');
const { listPlugins } = require('./listPlugins');

const rootDir = path.resolve(__dirname, '../../..');
const appsDir = path.resolve(rootDir, 'apps');
const targetFile = path.resolve(__dirname, '../src/app.module.ts');
const pkgFile = path.resolve(__dirname, '../package.json');

function capitalize(str) {
  return str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function generate() {
  const backends = [];

  for (const plugin of listPlugins(appsDir)) {
    const backendPath = path.join(plugin.dir, 'backend');
    const packageJsonPath = path.join(backendPath, 'package.json');
    const packageLockJsonPath = path.join(backendPath, 'package-lock.json');

    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (pkg.name) {
        backends.push({
          name: plugin.name,
          packageName: pkg.name,
          moduleName: 'AppModule',
        });
      }
    }

    if (fs.existsSync(packageLockJsonPath)) {
      fs.unlinkSync(packageLockJsonPath);
      console.log(`Removed ${packageLockJsonPath}`);
    }
  }

  const imports = backends
    .map(b => `import { AppModule as ${capitalize(b.name)}Module } from '${b.packageName}';`)
    .join('\n');

  const routerConfig = backends
    .map(b => `      {
        path: '${b.name}',
        module: ${capitalize(b.name)}Module,
        // This dynamically pulls AiModule and any others without naming them
        children: getChildModules(${capitalize(b.name)}Module).map(child => ({
          path: '', // Keeps them directly under /${b.name}/
          module: child
        }))
      },`)
    .join('\n');

  const moduleImports = backends.map(b => `${capitalize(b.name)}Module`).join(',\n    ');

  const content = `/**
 * This file is AUTO-GENERATED. Do not edit it manually.
 * Generated by scripts/generate-app-module.js
 */
import { Module } from '@nestjs/common';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { RouterModule } from '@nestjs/core';
import { HealthModule } from './health/health.module';
${imports}

// Helper to get all modules imported by a specific module
function getChildModules(targetModule: any) {
  return Reflect.getMetadata(MODULE_METADATA.IMPORTS, targetModule) || [];
}

@Module({
  imports: [
    HealthModule,
    ${moduleImports},
    RouterModule.register([
${routerConfig}
    ]),
  ],
})
export class AppModule {}
`;

  fs.writeFileSync(targetFile, content);
  console.log('Successfully generated packages/backend-main/src/app.module.ts');

  const mainPkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  let changed = false;

  for (const b of backends) {
    if (!mainPkg.dependencies[b.packageName]) {
      mainPkg.dependencies[b.packageName] = '*';
      changed = true;
      console.log(`Added missing dependency: ${b.packageName}`);
    }
  }

  if (changed) {
    fs.writeFileSync(pkgFile, JSON.stringify(mainPkg, null, 2) + '\n');
    console.log('Successfully updated packages/backend-main/package.json dependencies');
  }
}

generate();
```

- [ ] **Step 4: Smoke-test against real apps directory**

Run: `node packages/backend-main/scripts/generate-app-module.js`
Then: `git diff packages/backend-main/src/app.module.ts packages/backend-main/package.json`
Expected: no diff (today's `apps/` has no group folders, so the same backends are discovered and the output is byte-identical).

- [ ] **Step 5: Commit**

```bash
git add packages/backend-main/scripts/listPlugins.js packages/backend-main/scripts/listPlugins.test.js packages/backend-main/scripts/generate-app-module.js
git commit -m "refactor(backend-main): use listPlugins helper with group-marker support"
```

---

## Task 6: Add `apps/*/*/*` to root workspaces glob

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update workspaces array**

In `package.json`, change the `workspaces` array from:

```json
  "workspaces": [
    "apps/*/*",
    "packages/*",
    "domains/*",
    "tests"
  ],
```

to:

```json
  "workspaces": [
    "apps/*/*",
    "apps/*/*/*",
    "packages/*",
    "domains/*",
    "tests"
  ],
```

- [ ] **Step 2: Run `npm install` to regenerate the lockfile**

Run: `npm install`
Expected: completes without errors. `package-lock.json` may show entries for the new glob pattern resolution but no plugins are mounted yet, so dependency tree is unchanged.

- [ ] **Step 3: Run a build smoke test**

Run: `npm run build -- --filter=@aha/api --filter=@aha/backend-main`
Expected: both build successfully — confirms no regression for the two packages whose generators were touched.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add apps/*/*/* workspaces glob for plugin groups"
```

---

## Task 7: Set up the `slide-plugin-built-by-ahasliders` repo

**Working directory:** wherever the external repo is cloned. If it doesn't exist locally yet:

```bash
git clone git@github.com:AhaSlides-Product/slide-plugin-built-by-ahasliders.git
cd slide-plugin-built-by-ahasliders
```

**Files:**
- Create: `aha-plugin-group.json`
- Create: `_template/frontend/...` (full copy from `aha-slide-plugin/apps/sample-slide/frontend/`)
- Create: `_template/backend/...` (full copy from `aha-slide-plugin/apps/sample-slide/backend/`)
- Create: `README.md`

- [ ] **Step 1: Add the marker file**

Create `aha-plugin-group.json`:

```json
{
  "name": "Plugins by AhaSliders",
  "source": "https://github.com/AhaSlides-Product/slide-plugin-built-by-ahasliders"
}
```

- [ ] **Step 2: Copy the sample-slide as the starter template**

From the external repo working directory, with `aha-slide-plugin` checked out at `../aha-slide-plugin/`:

```bash
mkdir -p _template
cp -R ../aha-slide-plugin/apps/sample-slide/frontend _template/frontend
cp -R ../aha-slide-plugin/apps/sample-slide/backend _template/backend
rm -rf _template/frontend/node_modules _template/frontend/dist
rm -rf _template/backend/dist
```

- [ ] **Step 3: Rename the template package names**

Edit `_template/frontend/package.json`: change `"name": "@aha/sample-slide-frontend"` → `"name": "@aha-external/template-frontend"`.

Edit `_template/backend/package.json`: change `"name": "@aha/sample-slide-backend"` → `"name": "@aha-external/template-backend"`.

- [ ] **Step 4: Write the README**

Create `README.md`:

```markdown
# Plugins by AhaSliders

A multi-plugin repository owned by AhaSliders staff. Each top-level folder (other than `_template/`) is one slide-plugin and lives at the same path inside `aha-slide-plugin` once the submodule is mounted.

## Add a new plugin

```bash
cp -r _template my-new-slide
```

Edit `my-new-slide/frontend/package.json` and (if present) `my-new-slide/backend/package.json` to set the `name` field — by convention `@aha-external/my-new-slide-frontend` and `@aha-external/my-new-slide-backend`.

Folders prefixed with `_` or `.` are ignored by the host scanners, so `_template/` itself is never registered as a plugin.

## Test locally

The host monorepo (`aha-slide-plugin`) mounts this repo at `apps/slide-plugin-by-ahasliders/`. To work on a plugin:

```bash
git clone --recurse-submodules git@github.com:AhaSlides-Product/aha-slide-plugin.git
cd aha-slide-plugin
npm install
npm run dev
```

Edit files inside `apps/slide-plugin-by-ahasliders/<plugin>/` — that directory IS a checkout of this repo, so `git status` / `git commit` / `git push` from there target this repo.

## Deploy

Plugin authors push to `main` here. A maintainer of `aha-slide-plugin` bumps the submodule SHA there to release.

## Recognized as a plugin group

The host scanners recognize this repo as a plugin group via the `aha-plugin-group.json` file at the root. Don't delete it.
```

- [ ] **Step 5: Commit and push**

```bash
git add aha-plugin-group.json _template README.md
git commit -m "feat: scaffold plugin group with marker, template, and docs"
git push origin main
```

---

## Task 8: Mount the submodule and end-to-end verify

**Working directory:** `aha-slide-plugin/`

**Files:**
- Modify: `.gitmodules`
- Create: `apps/slide-plugin-by-ahasliders` (submodule mount, populated from external repo)

- [ ] **Step 1: Add the submodule**

Run:

```bash
git submodule add git@github.com:AhaSlides-Product/slide-plugin-built-by-ahasliders.git apps/slide-plugin-by-ahasliders
```

This appends a new `[submodule]` block to `.gitmodules` and creates `apps/slide-plugin-by-ahasliders/` populated with the external repo's contents.

- [ ] **Step 2: Verify scanners now pick up the group**

Run:

```bash
node packages/api/scripts/generate-slide-type-enum.js
node packages/backend-main/scripts/generate-app-module.js
```

Expected: both succeed. Check `packages/api/src/slideType.ts` — the existing entries (SampleSlide, Ranking, etc.) are preserved, and there are NO new entries (the external repo only contains `_template/`, which is skipped).

- [ ] **Step 3: Smoke-test by creating a temporary plugin**

Inside the submodule:

```bash
cd apps/slide-plugin-by-ahasliders
cp -r _template smoke-test
sed -i 's/@aha-external\/template-frontend/@aha-external\/smoke-test-frontend/' smoke-test/frontend/package.json
sed -i 's/@aha-external\/template-backend/@aha-external\/smoke-test-backend/' smoke-test/backend/package.json
cd ../..
```

- [ ] **Step 4: Run npm install and regenerate**

Run:

```bash
npm install
node packages/api/scripts/generate-slide-type-enum.js
node packages/backend-main/scripts/generate-app-module.js
```

Then check `packages/api/src/slideType.ts`:
Expected: contains `SmokeTest = 'smoke-test',` alongside existing entries.

Check `packages/backend-main/src/app.module.ts`:
Expected: imports `SmokeTestModule` from `@aha-external/smoke-test-backend` and registers it under `path: 'smoke-test'`.

Check `packages/backend-main/package.json`:
Expected: dependencies include `"@aha-external/smoke-test-backend": "*"`.

- [ ] **Step 5: Run the dev build to ensure it boots**

Run: `npm run build -- --filter=@aha/api --filter=@aha/backend-main`
Expected: completes without errors.

- [ ] **Step 6: Verify a collision is detected**

Temporarily rename the smoke-test folder to collide with an existing plugin:

```bash
mv apps/slide-plugin-by-ahasliders/smoke-test apps/slide-plugin-by-ahasliders/sample-slide
node packages/api/scripts/generate-slide-type-enum.js
```

Expected: error with message matching `Slide-type name collision: "sample-slide"`.

Restore:

```bash
mv apps/slide-plugin-by-ahasliders/sample-slide apps/slide-plugin-by-ahasliders/smoke-test
```

- [ ] **Step 7: Clean up the smoke-test plugin**

The current `generate-app-module.js` only **adds** missing dependencies — it doesn't remove stale ones. So after deleting the smoke-test plugin we have to manually revert the dependency entry it added in `packages/backend-main/package.json`:

```bash
cd apps/slide-plugin-by-ahasliders
rm -rf smoke-test
cd ../..
git checkout packages/backend-main/package.json
node packages/api/scripts/generate-slide-type-enum.js
node packages/backend-main/scripts/generate-app-module.js
```

Then verify:

```bash
git diff packages/api/src/slideType.ts packages/backend-main/src/app.module.ts packages/backend-main/package.json
```

Expected: no diff (auto-generated files are back to the post-Task-6 state).

- [ ] **Step 8: Commit the submodule wiring**

```bash
git add .gitmodules apps/slide-plugin-by-ahasliders
git commit -m "feat: mount slide-plugin-built-by-ahasliders as plugin group submodule"
```

- [ ] **Step 9: Final check — full build**

Run: `npm run build`
Expected: completes for all workspaces (Turborepo cache may speed this up).

---

## Done criteria

- [ ] `node --test packages/api/scripts/listPlugins.test.js` passes (8 tests).
- [ ] `node --test packages/backend-main/scripts/listPlugins.test.js` passes (8 tests).
- [ ] `node packages/api/scripts/generate-slide-type-enum.js` produces no diff against the pre-change `slideType.ts` when run with no group present, and adds the leaf-named entries when group plugins exist.
- [ ] `node packages/backend-main/scripts/generate-app-module.js` produces no diff against the pre-change `app.module.ts` when run with no group present, and adds wrapped backends when present.
- [ ] `npm run build` succeeds end-to-end.
- [ ] `apps/slide-plugin-by-ahasliders/` is a valid submodule pointing at the external repo's main branch SHA, and the external repo contains the marker, the `_template/`, and the README.
