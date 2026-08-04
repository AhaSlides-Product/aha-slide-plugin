# Tracking Recorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code plugin that records every analytics event an AhaSlides app sends while a tester walks a feature, sweeps each screen for unexercised elements, and hands a paired timeline to an LLM for the final naming/props verdict.

**Architecture:** A Node entry script launches a headed Chrome via `playwright-core` against a dedicated profile, injects one browser-side file into every frame that wraps the analytics send path (`sendBeacon`/`fetch`/`XHR`/`mixpanel.track`/`xprops.trackGA4AndMixpanel`) and listens for user actions. Captured records stream back over a Playwright binding into a Node process that writes `session.json`. Two pure modules — `decode.mjs` and `pair.mjs` — turn raw payloads into a paired timeline with mechanical defect flags; a third, `classify.mjs`, decides which elements the sweep may click. The skill's `SKILL.md` runs last and does only semantic judgement.

**Tech Stack:** Node ≥ 18 (ESM, `node:test`), `playwright-core` (system Chrome, no browser download), plain browser JS for the injected file, Markdown for the skill.

**Spec:** `docs/superpowers/specs/2026-08-03-tracking-recorder-design.md`

## Global Constraints

- **Node ≥ 18.** ESM only (`"type": "module"`). Tests run with `node --test`. No global `WebSocket` — never assume it.
- **`playwright-core` only**, pinned. Never `playwright` (it downloads browsers). The system Chrome is located by `chrome.mjs`.
- **No app-specific hardcoding in the engine.** Anything true only of `aha-survey`, the presenter app, or slide plugins belongs in `recorder/profiles/<app>.json`, never in `classify.mjs` or `inpage.js`.
- **`inpage.js` is browser code.** No imports, no `export`, no Node globals. It is read as text and injected. All decoding happens in Node.
- **`signalDetected === false` blocks the report.** Zero captured payloads across a session means the hooks did not match — never "everything is missing".
- **⚠️ is never downgraded to ❌.** An element not successfully interacted with is unknown, not failing.
- **Dedicated Chrome profile** — `~/.aha-track-profile`. Never the tester's daily browser.
- **Headed Chrome on a local display.** Not `claude.ai/code`, not SSH, not a background agent.
- **Never write outside the outputs root** — `$QA_WORKFLOW_OUTPUTS_DIR`, else `$HOME/Documents/QA Workflow/AhaSlides/outputs`.

## File Structure

```
.claude-plugin/marketplace.json                          Task 13
plugins/aha-tracking/
├── .claude-plugin/plugin.json                           Task 13
├── README.md                                            Task 13
└── skills/check-tracking/
    ├── SKILL.md                                         Task 12
    ├── references/event-naming.md                       Task 12
    ├── templates/report-template.md                     Task 12
    └── recorder/
        ├── package.json            deps + test script   Task 1
        ├── .gitignore              node_modules/        Task 1
        ├── chrome.mjs              Chrome path per OS   Task 1
        ├── inpage.js               injected browser code Tasks 2, 5, 6, 9
        ├── decode.mjs              payload → events     Task 4
        ├── classify.mjs            element → class      Task 8
        ├── profiles/generic.json   default signals      Task 8
        ├── session.mjs             session accumulator  Task 7
        ├── sweep.mjs               sweep + recovery     Task 10
        ├── pair.mjs                timeline → pairs     Task 11
        ├── record.mjs              CLI entry            Tasks 3, 7, 10
        └── test/
            ├── fixtures/beacon.html                     Task 2
            ├── fixtures/bridge.html                     Task 5
            ├── helpers/server.mjs                       Task 2
            ├── chrome.test.mjs                          Task 1
            ├── smoke.test.mjs                           Tasks 2, 5
            ├── decode.test.mjs                          Task 4
            ├── classify.test.mjs                        Task 8
            ├── session.test.mjs                         Task 7
            └── pair.test.mjs                            Task 11
```

Work happens on branch `claude/tracking-recorder-spec`, already checked out.

---

## Phase 1 — Runner and transport hooks

Proves the riskiest assumption first: that a payload can be captured at all.

### Task 1: Package scaffold and Chrome resolution

**Files:**
- Create: `plugins/aha-tracking/skills/check-tracking/recorder/package.json`
- Create: `plugins/aha-tracking/skills/check-tracking/recorder/.gitignore`
- Create: `plugins/aha-tracking/skills/check-tracking/recorder/chrome.mjs`
- Test: `plugins/aha-tracking/skills/check-tracking/recorder/test/chrome.test.mjs`

**Interfaces:**
- Consumes: nothing
- Produces: `resolveChromePath({ platform, env, exists }) → string` — throws `Error` with a message naming the searched paths when none exists. All three options are injected so the function is testable on any OS.

- [ ] **Step 1: Create the package manifest**

`recorder/package.json`:

```json
{
  "name": "aha-tracking-recorder",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Records analytics events while a tester walks an AhaSlides feature",
  "engines": { "node": ">=18" },
  "scripts": {
    "test": "node --test test/",
    "record": "node record.mjs"
  },
  "dependencies": {
    "playwright-core": "1.49.1"
  }
}
```

`recorder/.gitignore`:

```
node_modules/
sessions/
```

- [ ] **Step 2: Write the failing test**

`recorder/test/chrome.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveChromePath } from '../chrome.mjs';

test('CHROME_PATH wins over platform defaults when it exists', () => {
  const p = resolveChromePath({
    platform: 'darwin',
    env: { CHROME_PATH: '/custom/chrome' },
    exists: (f) => f === '/custom/chrome',
  });
  assert.equal(p, '/custom/chrome');
});

test('macOS falls back to the standard app bundle', () => {
  const expected = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const p = resolveChromePath({
    platform: 'darwin',
    env: {},
    exists: (f) => f === expected,
  });
  assert.equal(p, expected);
});

test('linux tries several binaries and picks the one present', () => {
  const p = resolveChromePath({
    platform: 'linux',
    env: {},
    exists: (f) => f === '/usr/bin/chromium',
  });
  assert.equal(p, '/usr/bin/chromium');
});

test('windows expands LOCALAPPDATA', () => {
  const expected = 'C:\\Users\\qa\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';
  const p = resolveChromePath({
    platform: 'win32',
    env: { LOCALAPPDATA: 'C:\\Users\\qa\\AppData\\Local' },
    exists: (f) => f === expected,
  });
  assert.equal(p, expected);
});

test('throws naming the searched paths when nothing exists', () => {
  assert.throws(
    () => resolveChromePath({ platform: 'darwin', env: {}, exists: () => false }),
    /Google Chrome/,
  );
});

test('throws on an unsupported platform', () => {
  assert.throws(
    () => resolveChromePath({ platform: 'aix', env: {}, exists: () => false }),
    /aix/,
  );
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd plugins/aha-tracking/skills/check-tracking/recorder && node --test test/chrome.test.mjs`
Expected: FAIL — `Cannot find module '../chrome.mjs'`

- [ ] **Step 4: Write the implementation**

`recorder/chrome.mjs`:

```js
// Locates the system Chrome. playwright-core ships no browser, so the
// executablePath must be supplied. Every input is injected so the resolver is
// testable on a machine running a different OS.
import { existsSync } from 'node:fs';

const CANDIDATES = {
  darwin: () => [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  linux: () => [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ],
  win32: (env) => [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    env.LOCALAPPDATA
      ? `${env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
      : null,
  ],
};

export function resolveChromePath({
  platform = process.platform,
  env = process.env,
  exists = existsSync,
} = {}) {
  if (env.CHROME_PATH && exists(env.CHROME_PATH)) return env.CHROME_PATH;

  const build = CANDIDATES[platform];
  if (!build) {
    throw new Error(
      `Unsupported platform "${platform}". Set CHROME_PATH to your Chrome binary.`,
    );
  }

  const paths = build(env).filter(Boolean);
  const found = paths.find(exists);
  if (found) return found;

  throw new Error(
    `Chrome not found. Searched:\n  ${paths.join('\n  ')}\n` +
      'Install Google Chrome, or set CHROME_PATH to its binary.',
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test test/chrome.test.mjs`
Expected: PASS — 6 tests

- [ ] **Step 6: Install dependencies and commit**

```bash
cd plugins/aha-tracking/skills/check-tracking/recorder
npm install
cd -
git add plugins/aha-tracking/skills/check-tracking/recorder/package.json \
        plugins/aha-tracking/skills/check-tracking/recorder/package-lock.json \
        plugins/aha-tracking/skills/check-tracking/recorder/.gitignore \
        plugins/aha-tracking/skills/check-tracking/recorder/chrome.mjs \
        plugins/aha-tracking/skills/check-tracking/recorder/test/chrome.test.mjs
git commit -m "feat(tracking): recorder package scaffold and Chrome resolution"
```

---

### Task 2: Transport hooks captured end to end

The first real proof. A static page calls `navigator.sendBeacon`; the recorder must see it.

**Files:**
- Create: `recorder/inpage.js`
- Create: `recorder/test/fixtures/beacon.html`
- Create: `recorder/test/helpers/server.mjs`
- Test: `recorder/test/smoke.test.mjs`

**Interfaces:**
- Consumes: `resolveChromePath` (Task 1)
- Produces:
  - `inpage.js` — injected text. Calls `window.__ahaTrackSink(JSON.stringify(record))` for every captured record. A transport record is `{ kind: 'raw', via: 'sendBeacon'|'fetch'|'xhr', url: string, body: string|null, t: number }`.
  - `test/helpers/server.mjs` — `startServer(dir) → { url, close() }`

- [ ] **Step 1: Write the fixture page**

`recorder/test/fixtures/beacon.html`:

```html
<!doctype html>
<meta charset="utf-8">
<title>beacon fixture</title>
<button id="go">go</button>
<script>
  document.getElementById('go').addEventListener('click', () => {
    const payload = 'data=' + btoa(JSON.stringify({
      event: 'survey.fixture_clicked',
      properties: { survey_id: 42 },
    }));
    navigator.sendBeacon('https://mt.example.test/track/', payload);
    fetch('https://mt.example.test/track/', { method: 'POST', body: payload });
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://mt.example.test/track/');
    xhr.send(payload);
  });
</script>
```

- [ ] **Step 2: Write the static file server helper**

`recorder/test/helpers/server.mjs`:

```js
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };

export async function startServer(dir) {
  const server = createServer(async (req, res) => {
    const name = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    try {
      const body = await readFile(join(dir, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'text/plain' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((r) => server.close(r)),
  };
}
```

- [ ] **Step 3: Write the failing smoke test**

`recorder/test/smoke.test.mjs`:

```js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { resolveChromePath } from '../chrome.mjs';
import { startServer } from './helpers/server.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const INPAGE = join(HERE, '..', 'inpage.js');

let chromePath = null;
try {
  chromePath = resolveChromePath();
} catch {
  // Chrome absent — the suite skips rather than fails.
}

let server;
before(async () => {
  server = await startServer(join(HERE, 'fixtures'));
});
after(async () => {
  await server?.close();
});

test('captures sendBeacon, fetch and XHR payloads', { skip: !chromePath }, async () => {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const context = await browser.newContext();
  const records = [];

  await context.exposeBinding('__ahaTrackSink', (_source, json) => {
    records.push(JSON.parse(json));
  });
  await context.addInitScript({ path: INPAGE });

  const page = await context.newPage();
  await page.goto(`${server.url}/beacon.html`);
  await page.click('#go');
  await page.waitForTimeout(500);
  await browser.close();

  const vias = records.filter((r) => r.kind === 'raw').map((r) => r.via);
  assert.ok(vias.includes('sendBeacon'), `sendBeacon missing, got ${vias.join()}`);
  assert.ok(vias.includes('fetch'), `fetch missing, got ${vias.join()}`);
  assert.ok(vias.includes('xhr'), `xhr missing, got ${vias.join()}`);

  const beacon = records.find((r) => r.via === 'sendBeacon');
  assert.match(beacon.url, /\/track\//);
  assert.match(beacon.body, /^data=/);
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `node --test test/smoke.test.mjs`
Expected: FAIL — `ENOENT` on `inpage.js`

- [ ] **Step 5: Write the injected transport hooks**

`recorder/inpage.js`:

```js
// Injected into every frame before any page script runs. Browser code only:
// no imports, no exports, no Node globals.
//
// It wraps the analytics send path so a copy of every payload reaches the
// recorder. The original function is always called with the original
// arguments, so the app cannot tell it has been wrapped.
(() => {
  if (window.__ahaTrackInstalled) return;
  window.__ahaTrackInstalled = true;

  const send = (record) => {
    try {
      if (typeof window.__ahaTrackSink === 'function') {
        window.__ahaTrackSink(JSON.stringify(record));
      }
    } catch {
      // Never let recording break the page under test.
    }
  };

  const raw = (via, url, body) =>
    send({ kind: 'raw', via, url: String(url ?? ''), body: bodyToString(body), t: Date.now() });

  function bodyToString(body) {
    if (body == null) return null;
    if (typeof body === 'string') return body;
    if (body instanceof URLSearchParams) return body.toString();
    if (body instanceof Blob) return null; // read asynchronously would reorder records
    try {
      return String(body);
    } catch {
      return null;
    }
  }

  // --- navigator.sendBeacon -------------------------------------------------
  if (navigator.sendBeacon) {
    const original = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      raw('sendBeacon', url, data);
      return original(url, data);
    };
  }

  // --- window.fetch --------------------------------------------------------
  if (window.fetch) {
    const original = window.fetch;
    window.fetch = function (input, init) {
      const url = typeof input === 'string' ? input : input?.url;
      raw('fetch', url, init?.body);
      return original.apply(this, arguments);
    };
  }

  // --- XMLHttpRequest ------------------------------------------------------
  if (window.XMLHttpRequest) {
    const openOriginal = XMLHttpRequest.prototype.open;
    const sendOriginal = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
      this.__ahaUrl = url;
      return openOriginal.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (body) {
      raw('xhr', this.__ahaUrl, body);
      return sendOriginal.apply(this, arguments);
    };
  }
})();
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test test/smoke.test.mjs`
Expected: PASS — 1 test (or skipped if Chrome is absent; verify it passes on the dev machine)

- [ ] **Step 7: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/inpage.js \
        plugins/aha-tracking/skills/check-tracking/recorder/test/
git commit -m "feat(tracking): capture sendBeacon, fetch and XHR payloads in-page"
```

---

### Task 3: The `record.mjs` entry point

**Files:**
- Create: `recorder/record.mjs`

**Interfaces:**
- Consumes: `resolveChromePath` (Task 1), `inpage.js` (Task 2)
- Produces: a CLI — `node record.mjs <url> [--allow-external]`. Launches a headed Chrome on the persistent profile, injects `inpage.js`, prints one line per captured record, exits on Ctrl+C.

- [ ] **Step 1: Write the entry point**

`recorder/record.mjs`:

```js
#!/usr/bin/env node
// Entry point. Launches a headed Chrome on a dedicated profile, injects the
// in-page recorder, and streams what it captures to the terminal.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { chromium } from 'playwright-core';
import { resolveChromePath } from './chrome.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = join(homedir(), '.aha-track-profile');

function parseArgs(argv) {
  const args = argv.slice(2);
  const url = args.find((a) => !a.startsWith('--'));
  if (!url) {
    console.error('usage: node record.mjs <url> [--allow-external]');
    process.exit(1);
  }
  return { url, allowExternal: args.includes('--allow-external') };
}

async function main() {
  const { url, allowExternal } = parseArgs(process.argv);
  const executablePath = resolveChromePath();

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    executablePath,
    headless: false,
    viewport: null,
    args: ['--start-maximized'],
  });

  let captured = 0;
  await context.exposeBinding('__ahaTrackSink', (_source, json) => {
    const record = JSON.parse(json);
    captured += 1;
    console.log(`  ${new Date(record.t).toISOString().slice(11, 19)}  ${record.via}  ${record.url}`);
  });
  await context.addInitScript({ path: join(HERE, 'inpage.js') });

  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(url);

  console.log('');
  console.log(`  Recording. Profile: ${PROFILE_DIR}`);
  console.log(`  allow-external: ${allowExternal}`);
  console.log('  Walk the feature. Ctrl+C to finish.');
  console.log('');

  const finish = async () => {
    console.log(`\n  ${captured} payload(s) captured.`);
    await context.close().catch(() => {});
    process.exit(0);
  };

  process.on('SIGINT', finish);
  context.on('close', finish);
}

main().catch((err) => {
  console.error(`\n  ${err.message}\n`);
  process.exit(1);
});
```

- [ ] **Step 2: Verify it runs against a real app**

Run: `node record.mjs https://dev01.ahaslide.com/` (or the local `aha-survey` at `http://localhost:5174`)
Expected: Chrome opens. Log in if needed. Clicking around prints `sendBeacon https://…/track/` lines in the terminal.

If nothing prints, the app under test may not have analytics enabled for that account — try `aha-survey` local (`make up-auth`) where `import.meta.env.DEV` is true.

- [ ] **Step 3: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/record.mjs
git commit -m "feat(tracking): record.mjs launches headed Chrome and streams captures"
```

---

## Phase 2 — Decoding and the remaining hooks

### Task 4: Decode Mixpanel payloads

**Files:**
- Create: `recorder/decode.mjs`
- Test: `recorder/test/decode.test.mjs`

**Interfaces:**
- Consumes: nothing
- Produces: `decodeRecord(record) → Array<{ name, props }>`. Input is a raw record from `inpage.js`. Returns `[]` when the payload is not analytics. Also exports `looksLikeTracking(url, body) → boolean`.

- [ ] **Step 1: Write the failing test**

`recorder/test/decode.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeRecord, looksLikeTracking } from '../decode.mjs';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64');

test('decodes base64 data= form bodies', () => {
  const body = 'data=' + b64({ event: 'survey.publish', properties: { survey_id: 1 } });
  const out = decodeRecord({ kind: 'raw', via: 'sendBeacon', url: 'https://x/track/', body });
  assert.deepEqual(out, [{ name: 'survey.publish', props: { survey_id: 1 } }]);
});

test('decodes url-encoded JSON data= bodies', () => {
  const json = JSON.stringify({ event: 'a', properties: { b: 2 } });
  const body = 'data=' + encodeURIComponent(json);
  const out = decodeRecord({ kind: 'raw', via: 'fetch', url: 'https://x/track/', body });
  assert.deepEqual(out, [{ name: 'a', props: { b: 2 } }]);
});

test('decodes a raw JSON body', () => {
  const body = JSON.stringify({ event: 'a', properties: {} });
  const out = decodeRecord({ kind: 'raw', via: 'xhr', url: 'https://x/track/', body });
  assert.deepEqual(out, [{ name: 'a', props: {} }]);
});

test('decodes a batched array into several events', () => {
  const body = 'data=' + b64([
    { event: 'one', properties: { i: 1 } },
    { event: 'two', properties: { i: 2 } },
  ]);
  const out = decodeRecord({ kind: 'raw', via: 'sendBeacon', url: 'https://x/track/', body });
  assert.equal(out.length, 2);
  assert.equal(out[1].name, 'two');
});

test('passes a bridge record through unchanged', () => {
  const out = decodeRecord({ kind: 'bridge', name: 'click_submit_button', props: { a: 1 } });
  assert.deepEqual(out, [{ name: 'click_submit_button', props: { a: 1 } }]);
});

test('missing properties decode to an empty object', () => {
  const body = 'data=' + b64({ event: 'a' });
  assert.deepEqual(decodeRecord({ kind: 'raw', url: 'https://x/track/', body }), [
    { name: 'a', props: {} },
  ]);
});

test('ignores non-analytics traffic', () => {
  assert.deepEqual(
    decodeRecord({ kind: 'raw', via: 'fetch', url: 'https://api/surveys', body: '{"id":1}' }),
    [],
  );
});

test('ignores an unparseable body on a tracking URL', () => {
  assert.deepEqual(
    decodeRecord({ kind: 'raw', via: 'fetch', url: 'https://x/track/', body: 'not json' }),
    [],
  );
});

test('looksLikeTracking recognises track, engage and data= bodies', () => {
  assert.equal(looksLikeTracking('https://x/track/', null), true);
  assert.equal(looksLikeTracking('https://x/engage/', null), true);
  assert.equal(looksLikeTracking('https://x/anything', 'data=abc'), true);
  assert.equal(looksLikeTracking('https://x/api/surveys', '{"a":1}'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/decode.test.mjs`
Expected: FAIL — `Cannot find module '../decode.mjs'`

- [ ] **Step 3: Write the implementation**

`recorder/decode.mjs`:

```js
// Turns a raw record from inpage.js into zero or more { name, props }.
// Runs in Node so inpage.js stays small and this stays unit-testable.

export function looksLikeTracking(url = '', body = null) {
  const path = String(url);
  if (/\/(track|engage)\b/.test(path)) return true;
  if (typeof body === 'string' && body.startsWith('data=')) return true;
  return false;
}

function tryJson(text) {
  if (typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function fromBase64(text) {
  try {
    return Buffer.from(text, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

function normalise(parsed) {
  const list = Array.isArray(parsed) ? parsed : [parsed];
  return list
    .filter((e) => e && typeof e.event === 'string')
    .map((e) => ({ name: e.event, props: e.properties ?? {} }));
}

export function decodeRecord(record) {
  if (!record) return [];

  // The zoid bridge hands us the event directly — nothing to decode.
  if (record.kind === 'bridge') {
    return [{ name: record.name, props: record.props ?? {} }];
  }

  const { url, body } = record;
  if (!looksLikeTracking(url, body)) return [];
  if (typeof body !== 'string' || body.length === 0) return [];

  let text = body;
  if (text.startsWith('data=')) {
    const value = text.slice('data='.length).replace(/\+/g, ' ');
    let decoded;
    try {
      decoded = decodeURIComponent(value);
    } catch {
      decoded = value;
    }
    text = decoded;
  }

  const parsed = tryJson(text) ?? tryJson(fromBase64(text));
  if (parsed == null) return [];
  return normalise(parsed);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/decode.test.mjs`
Expected: PASS — 9 tests

- [ ] **Step 5: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/decode.mjs \
        plugins/aha-tracking/skills/check-tracking/recorder/test/decode.test.mjs
git commit -m "feat(tracking): decode base64, url-encoded, raw and batched payloads"
```

---

### Task 5: SDK and zoid bridge hooks

The spec's named open risk: `xprops` may not exist when the script is injected. The hook installs a `defineProperty` trap so it works either way.

**Files:**
- Modify: `recorder/inpage.js` (append two hooks inside the existing IIFE)
- Create: `recorder/test/fixtures/bridge.html`
- Modify: `recorder/test/smoke.test.mjs` (add one test)

**Interfaces:**
- Consumes: `inpage.js` (Task 2)
- Produces: a second record shape — `{ kind: 'bridge', name: string, props: object, t: number }` — emitted by both the `mixpanel.track` and `xprops.trackGA4AndMixpanel` hooks. `decodeRecord` (Task 4) already handles it.

- [ ] **Step 1: Write the bridge fixture**

`recorder/test/fixtures/bridge.html`:

```html
<!doctype html>
<meta charset="utf-8">
<title>bridge fixture</title>
<button id="late">assign xprops late, then track</button>
<button id="sdk">track via mixpanel sdk</button>
<script>
  // xprops is assigned AFTER the recorder was injected — the case the trap exists for.
  document.getElementById('late').addEventListener('click', () => {
    window.xprops = {
      trackGA4AndMixpanel: (name, props) => { window.__lastBridge = [name, props]; },
    };
    window.xprops.trackGA4AndMixpanel('click_submit_button', { plugin: 'ranking' });
  });

  document.getElementById('sdk').addEventListener('click', () => {
    window.mixpanel = { track: (name, props) => { window.__lastSdk = [name, props]; } };
    window.mixpanel.track('survey.sdk_event', { a: 1 });
  });
</script>
```

- [ ] **Step 2: Write the failing test**

Append to `recorder/test/smoke.test.mjs`:

```js
test('captures the zoid bridge and the mixpanel SDK', { skip: !chromePath }, async () => {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const context = await browser.newContext();
  const records = [];

  await context.exposeBinding('__ahaTrackSink', (_source, json) => {
    records.push(JSON.parse(json));
  });
  await context.addInitScript({ path: INPAGE });

  const page = await context.newPage();
  await page.goto(`${server.url}/bridge.html`);
  await page.click('#late');
  await page.click('#sdk');
  await page.waitForTimeout(300);

  // The wrapped functions must still reach the originals.
  assert.deepEqual(await page.evaluate(() => window.__lastBridge), [
    'click_submit_button',
    { plugin: 'ranking' },
  ]);
  assert.deepEqual(await page.evaluate(() => window.__lastSdk), ['survey.sdk_event', { a: 1 }]);
  await browser.close();

  const bridge = records.filter((r) => r.kind === 'bridge');
  const names = bridge.map((r) => r.name);
  assert.ok(names.includes('click_submit_button'), `bridge missing, got ${names.join()}`);
  assert.ok(names.includes('survey.sdk_event'), `sdk missing, got ${names.join()}`);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test test/smoke.test.mjs`
Expected: FAIL — `bridge missing, got ` (empty)

- [ ] **Step 4: Add both hooks to `inpage.js`**

Insert before the closing `})();` of `recorder/inpage.js`:

```js
  const bridge = (name, props) =>
    send({ kind: 'bridge', name: String(name), props: props ?? {}, t: Date.now() });

  // Wraps `obj[method]`, forwarding to the original. Idempotent.
  function wrapMethod(obj, method, onCall) {
    const original = obj[method];
    if (typeof original !== 'function' || original.__ahaWrapped) return;
    const wrapper = function (...args) {
      try {
        onCall(...args);
      } catch {
        // recording must never break the call
      }
      return original.apply(this, args);
    };
    wrapper.__ahaWrapped = true;
    obj[method] = wrapper;
  }

  // Watches for `window[prop]` to be assigned — the object may not exist yet
  // (zoid assigns `xprops` after our injection). Fires once now if present,
  // and again on every future assignment.
  function onGlobal(prop, handler) {
    if (window[prop]) handler(window[prop]);
    let current = window[prop];
    try {
      Object.defineProperty(window, prop, {
        configurable: true,
        get: () => current,
        set: (value) => {
          current = value;
          try {
            handler(value);
          } catch {
            // ignore
          }
        },
      });
    } catch {
      // A non-configurable global: the initial check above is all we get.
    }
  }

  // --- window.mixpanel.track ----------------------------------------------
  onGlobal('mixpanel', (mp) => {
    if (mp && typeof mp.track === 'function') wrapMethod(mp, 'track', bridge);
  });

  // --- window.xprops.trackGA4AndMixpanel (zoid bridge, slide plugins) ------
  onGlobal('xprops', (xp) => {
    if (xp && typeof xp.trackGA4AndMixpanel === 'function') {
      wrapMethod(xp, 'trackGA4AndMixpanel', bridge);
    }
  });
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test test/smoke.test.mjs`
Expected: PASS — 2 tests

- [ ] **Step 6: Verify against a real slide plugin**

Run `node record.mjs <a slide-plugin URL in the presenter>` and interact with a plugin slide.
Expected: `bridge` records appear.

If they do not, record the finding in the spec's open-risk note — the trap may need to run inside the plugin iframe specifically. `addInitScript` on the context already applies to all frames, so investigate whether zoid assigns `xprops` on a different object before changing the approach.

- [ ] **Step 7: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/inpage.js \
        plugins/aha-tracking/skills/check-tracking/recorder/test/
git commit -m "feat(tracking): hook mixpanel.track and the zoid trackGA4AndMixpanel bridge"
```

---

## Phase 3 — Actions, navigation, and the session file

### Task 6: Record user actions with element descriptors

**Files:**
- Modify: `recorder/inpage.js`

**Interfaces:**
- Consumes: `inpage.js` (Tasks 2, 5)
- Produces: a third record shape — `{ kind: 'action', type: 'click'|'change'|'submit', el: Descriptor, t: number }` where `Descriptor` is `{ tag, text, testId, ariaLabel, name, role, type, href, classes, disabled, ariaHidden, width, height, section, path }`. Also exports on `window`: `window.__ahaDescribe(element) → Descriptor`, reused by the inventory in Task 9.

- [ ] **Step 1: Add the descriptor builder and listeners to `inpage.js`**

Insert before the closing `})();`:

```js
  const MAX_TEXT = 80;

  function cssPath(el) {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && parts.length < 4) {
      let part = node.tagName.toLowerCase();
      if (node.id) {
        parts.unshift(`${part}#${node.id}`);
        break;
      }
      const parent = node.parentElement;
      if (parent) {
        const siblings = [...parent.children].filter((c) => c.tagName === node.tagName);
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
      }
      parts.unshift(part);
      node = node.parentElement;
    }
    return parts.join('>');
  }

  function nearestSection(el) {
    const container = el.closest('section, header, footer, aside, dialog, [role=dialog], main');
    if (!container) return null;
    const heading = container.querySelector('h1, h2, h3, [role=heading]');
    const label = heading?.textContent ?? container.getAttribute('aria-label');
    return label ? label.trim().slice(0, MAX_TEXT) : null;
  }

  function describe(el) {
    if (!el || el.nodeType !== 1) return null;
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.innerText ?? el.textContent ?? '').trim().slice(0, MAX_TEXT) || null,
      testId: el.getAttribute('data-testid'),
      ariaLabel: el.getAttribute('aria-label'),
      name: el.getAttribute('name'),
      role: el.getAttribute('role'),
      type: el.getAttribute('type'),
      href: el.getAttribute('href'),
      classes: (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
      disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
      ariaHidden: el.getAttribute('aria-hidden') === 'true',
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      section: nearestSection(el),
      path: cssPath(el),
    };
  }
  window.__ahaDescribe = describe;

  const action = (type, el) => send({ kind: 'action', type, el: describe(el), t: Date.now() });

  // Capture phase so the record exists even if the app stops propagation.
  document.addEventListener('click', (e) => action('click', e.target), true);
  document.addEventListener('change', (e) => action('change', e.target), true);
  document.addEventListener('submit', (e) => action('submit', e.target), true);
```

- [ ] **Step 2: Verify manually**

Run: `node record.mjs http://localhost:5174`
Expected: clicking prints action records alongside payload records. Confirm `el.text` and `el.testId` are populated on a real button.

- [ ] **Step 3: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/inpage.js
git commit -m "feat(tracking): record user actions with stable element descriptors"
```

---

### Task 7: Session accumulator and `session.json`

**Files:**
- Create: `recorder/session.mjs`
- Modify: `recorder/record.mjs`
- Test: `recorder/test/session.test.mjs`

**Interfaces:**
- Consumes: `decodeRecord` (Task 4)
- Produces: `createSession({ allowExternal, recorderVersion }) → Session` with methods
  `addRaw(record, frame)`, `addNavigation(from, to)`, `addScreen({ url, inventory })`,
  `toJSON() → object`. `toJSON().meta.signalDetected` is `true` once any event has
  been decoded. Timeline entries carry a monotonic `seq` starting at 1 and `t`
  relative to session start in ms.

- [ ] **Step 1: Write the failing test**

`recorder/test/session.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../session.mjs';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64');
const trackBody = (name) => 'data=' + b64({ event: name, properties: { a: 1 } });

test('starts with signalDetected false and an empty timeline', () => {
  const s = createSession({ allowExternal: false, recorderVersion: '1.0.0' });
  const json = s.toJSON();
  assert.equal(json.meta.signalDetected, false);
  assert.equal(json.timeline.length, 0);
  assert.equal(json.meta.allowExternal, false);
});

test('an action record becomes an action timeline entry', () => {
  const s = createSession({});
  s.addRaw({ kind: 'action', type: 'click', el: { tag: 'button', text: 'Publish' } }, 'top');
  const [entry] = s.toJSON().timeline;
  assert.equal(entry.kind, 'action');
  assert.equal(entry.type, 'click');
  assert.equal(entry.el.text, 'Publish');
  assert.equal(entry.seq, 1);
});

test('a tracking payload becomes an event entry and flips signalDetected', () => {
  const s = createSession({});
  s.addRaw({ kind: 'raw', via: 'sendBeacon', url: 'https://x/track/', body: trackBody('survey.x') }, 'top');
  const json = s.toJSON();
  assert.equal(json.meta.signalDetected, true);
  assert.equal(json.timeline[0].kind, 'event');
  assert.equal(json.timeline[0].name, 'survey.x');
  assert.equal(json.timeline[0].via, 'sendBeacon');
  assert.equal(json.timeline[0].frame, 'top');
});

test('a batched payload produces one entry per event', () => {
  const s = createSession({});
  const body = 'data=' + b64([{ event: 'one', properties: {} }, { event: 'two', properties: {} }]);
  s.addRaw({ kind: 'raw', via: 'fetch', url: 'https://x/track/', body }, 'top');
  assert.equal(s.toJSON().timeline.length, 2);
});

test('non-analytics traffic is dropped entirely', () => {
  const s = createSession({});
  s.addRaw({ kind: 'raw', via: 'fetch', url: 'https://api/surveys', body: '{"id":1}' }, 'top');
  assert.equal(s.toJSON().timeline.length, 0);
  assert.equal(s.toJSON().meta.signalDetected, false);
});

test('navigation is a first-class action entry', () => {
  const s = createSession({});
  s.addNavigation('https://a/one', 'https://a/two');
  const [entry] = s.toJSON().timeline;
  assert.equal(entry.kind, 'action');
  assert.equal(entry.type, 'navigate');
  assert.equal(entry.from, 'https://a/one');
  assert.equal(entry.to, 'https://a/two');
});

test('screens accumulate with incrementing ids', () => {
  const s = createSession({});
  s.addScreen({ url: 'https://a/one', inventory: [] });
  s.addScreen({ url: 'https://a/two', inventory: [{ id: 1 }] });
  const { screens } = s.toJSON();
  assert.deepEqual(screens.map((x) => x.screenId), [1, 2]);
  assert.equal(screens[1].inventory.length, 1);
});

test('seq increments across every entry kind', () => {
  const s = createSession({});
  s.addRaw({ kind: 'action', type: 'click', el: { tag: 'button' } }, 'top');
  s.addNavigation('a', 'b');
  s.addRaw({ kind: 'raw', url: 'https://x/track/', body: trackBody('e') }, 'top');
  assert.deepEqual(s.toJSON().timeline.map((e) => e.seq), [1, 2, 3]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/session.test.mjs`
Expected: FAIL — `Cannot find module '../session.mjs'`

- [ ] **Step 3: Write the implementation**

`recorder/session.mjs`:

```js
// Accumulates everything a run captures and renders session.json.
// Pure with respect to the browser: it takes records, not pages.
import { decodeRecord } from './decode.mjs';

export function createSession({ allowExternal = false, recorderVersion = '1.0.0' } = {}) {
  const startedAt = new Date();
  const start = startedAt.getTime();
  const timeline = [];
  const screens = [];
  const hooksArmed = new Set();
  let seq = 0;
  let signalDetected = false;

  const push = (entry) => {
    seq += 1;
    timeline.push({ seq, t: Date.now() - start, ...entry });
  };

  return {
    addRaw(record, frame = 'top') {
      if (!record) return;
      if (record.via) hooksArmed.add(record.via);
      if (record.kind === 'bridge') hooksArmed.add('bridge');

      if (record.kind === 'action') {
        push({ kind: 'action', type: record.type, el: record.el, origin: record.origin ?? 'manual', frame });
        return;
      }

      for (const { name, props } of decodeRecord(record)) {
        signalDetected = true;
        push({ kind: 'event', name, props, via: record.via ?? 'bridge', frame });
      }
    },

    addNavigation(from, to) {
      push({ kind: 'action', type: 'navigate', from, to });
    },

    addScreen({ url, inventory }) {
      const screenId = screens.length + 1;
      screens.push({ screenId, url, sweptAt: new Date().toISOString(), inventory });
      return screenId;
    },

    get signalDetected() {
      return signalDetected;
    },

    toJSON() {
      return {
        meta: {
          startedAt: startedAt.toISOString(),
          endedAt: new Date().toISOString(),
          recorderVersion,
          hooksArmed: [...hooksArmed],
          allowExternal,
          signalDetected,
        },
        screens,
        timeline,
      };
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/session.test.mjs`
Expected: PASS — 8 tests

- [ ] **Step 5: Wire the session into `record.mjs`**

Replace the binding, the log block, and `finish` in `recorder/record.mjs`:

```js
import { writeFile, mkdir } from 'node:fs/promises';
import { createSession } from './session.mjs';

// … inside main(), replacing the previous exposeBinding + finish:

const session = createSession({ allowExternal });

await context.exposeBinding('__ahaTrackSink', (source, json) => {
  const record = JSON.parse(json);
  const frame = source.frame === source.page.mainFrame() ? 'top' : source.frame.url();
  session.addRaw(record, frame);

  if (record.kind === 'action') {
    console.log(`  CLICK  ${record.el?.text ?? record.el?.testId ?? record.el?.tag}`);
  } else {
    for (const e of session.toJSON().timeline.slice(-1)) {
      if (e.kind === 'event') console.log(`    └─ ${e.name}`);
    }
  }
});

const page = context.pages()[0] ?? (await context.newPage());
let lastUrl = url;
page.on('framenavigated', (frame) => {
  if (frame !== page.mainFrame()) return;
  const next = frame.url();
  if (next === lastUrl || next === 'about:blank') return;
  session.addNavigation(lastUrl, next);
  lastUrl = next;
  console.log(`  NAV    ${next}`);
});
await page.goto(url);

const finish = async () => {
  const out = join(process.cwd(), `session-${Date.now()}.json`);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(session.toJSON(), null, 2), 'utf8');
  if (!session.signalDetected) {
    console.log('\n  signal-not-detected: no analytics payload was captured.');
    console.log('  The hooks did not match this app. Do NOT read this as "no tracking".');
  }
  console.log(`\n  Session written: ${out}\n`);
  await context.close().catch(() => {});
  process.exit(session.signalDetected ? 0 : 2);
};
```

- [ ] **Step 6: Verify manually**

Run: `node record.mjs http://localhost:5174`, click a few things, Ctrl+C.
Expected: `session-<ts>.json` written, containing `meta.signalDetected: true`, action entries, and event entries.

- [ ] **Step 7: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/session.mjs \
        plugins/aha-tracking/skills/check-tracking/recorder/record.mjs \
        plugins/aha-tracking/skills/check-tracking/recorder/test/session.test.mjs
git commit -m "feat(tracking): accumulate a session with navigation and write session.json"
```

---

## Phase 4 — Inventory, classification, and the sweep

### Task 8: Classify elements

**Files:**
- Create: `recorder/classify.mjs`
- Create: `recorder/profiles/generic.json`
- Test: `recorder/test/classify.test.mjs`

**Interfaces:**
- Consumes: the `Descriptor` shape from Task 6
- Produces: `classify(descriptor, profile) → { class: 'safe'|'last'|'external'|'unreachable', reason: string }`, and `loadProfile(name) → Profile`. `Profile` is `{ external: { testIds: string[], selectors: string[] }, destructive: { testIds: string[], selectors: string[] } }`.

- [ ] **Step 1: Write the default profile**

`recorder/profiles/generic.json`:

```json
{
  "name": "generic",
  "external": { "testIds": [], "selectors": [] },
  "destructive": { "testIds": [], "selectors": [".ant-btn-dangerous"] }
}
```

- [ ] **Step 2: Write the failing test**

`recorder/test/classify.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, loadProfile } from '../classify.mjs';

const generic = await loadProfile('generic');
const el = (over = {}) => ({
  tag: 'button', text: 'Preview', testId: null, ariaLabel: null, name: null,
  role: null, type: null, href: null, classes: [], disabled: false,
  ariaHidden: false, width: 80, height: 32, section: null, path: 'button',
  ...over,
});

test('an ordinary button is safe', () => {
  assert.equal(classify(el(), generic).class, 'safe');
});

test('a disabled element is unreachable', () => {
  assert.equal(classify(el({ disabled: true }), generic).class, 'unreachable');
});

test('a zero-size element is unreachable', () => {
  assert.equal(classify(el({ width: 0, height: 0 }), generic).class, 'unreachable');
});

test('aria-hidden is unreachable', () => {
  assert.equal(classify(el({ ariaHidden: true }), generic).class, 'unreachable');
});

test('an icon-only button with no name and no testid is unreachable', () => {
  const r = classify(el({ text: null, ariaLabel: null, testId: null }), generic);
  assert.equal(r.class, 'unreachable');
  assert.match(r.reason, /no accessible name/);
});

test('ant-btn-dangerous is destructive regardless of language', () => {
  const r = classify(el({ text: '削除', classes: ['ant-btn', 'ant-btn-dangerous'] }), generic);
  assert.equal(r.class, 'last');
  assert.match(r.reason, /ant-btn-dangerous/);
});

test('a destructive testid outranks harmless visible text', () => {
  const r = classify(el({ text: 'OK', testId: 'canvas-image-delete-btn' }), generic);
  assert.equal(r.class, 'last');
  assert.match(r.reason, /testid/);
});

test('an external testid classifies as external, not merely destructive', () => {
  assert.equal(classify(el({ text: 'OK', testId: 'csat-send-btn' }), generic).class, 'external');
});

test('external outranks destructive when both match', () => {
  const r = classify(el({ text: 'Delete', testId: 'billing-upgrade-cta' }), generic);
  assert.equal(r.class, 'external');
});

test('English destructive text is the last-resort signal', () => {
  assert.equal(classify(el({ text: 'Delete survey' }), generic).class, 'last');
});

test('Vietnamese destructive text is recognised', () => {
  assert.equal(classify(el({ text: 'Xoá khảo sát' }), generic).class, 'last');
});

test('type=submit is queued last', () => {
  assert.equal(classify(el({ tag: 'input', type: 'submit', text: null, testId: 'x' }), generic).class, 'last');
});

test('a cross-origin link is queued last', () => {
  const r = classify(el({ tag: 'a', text: 'Docs', href: 'https://other.example/docs' }), generic);
  assert.equal(r.class, 'last');
});

test('a same-origin relative link stays safe', () => {
  assert.equal(classify(el({ tag: 'a', text: 'Settings', href: '/settings' }), generic).class, 'safe');
});

test('a profile selector adds an app-specific destructive rule', () => {
  const profile = {
    external: { testIds: [], selectors: [] },
    destructive: { testIds: [], selectors: ['.danger-zone-btn'] },
  };
  const r = classify(el({ classes: ['danger-zone-btn'] }), profile);
  assert.equal(r.class, 'last');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test test/classify.test.mjs`
Expected: FAIL — `Cannot find module '../classify.mjs'`

- [ ] **Step 4: Write the implementation**

`recorder/classify.mjs`:

```js
// Decides whether the sweep may click an element.
//
// App-agnostic by construction: signals are ordered by reliability, and
// anything true of only one app belongs in profiles/<app>.json. Visible text
// is the LAST signal because aha-survey ships 37 locales — a Delete button
// rendered in Japanese matches no English keyword.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

// Consequences outside the test account. Never auto-clicked without
// --allow-external.
const EXTERNAL = [
  'send', 'invite', 'pay', 'payment', 'upgrade', 'subscribe', 'checkout', 'purchase', 'billing',
  'gui', 'moi', 'thanhtoan', 'nangcap',
];

// Destroys or commits state. Auto-clicked, but queued last so it cannot
// strand the rest of the screen.
const DESTRUCTIVE = [
  'delete', 'remove', 'archive', 'reset', 'publish', 'close', 'discard', 'clear', 'revoke',
  'xoa', 'luutru', 'datlai', 'huy', 'dong',
];

export async function loadProfile(name = 'generic') {
  const text = await readFile(join(HERE, 'profiles', `${name}.json`), 'utf8');
  return JSON.parse(text);
}

// Strips diacritics and non-letters so "Xoá khảo sát" matches "xoa".
function fold(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const hasKeyword = (text, list) => {
  const folded = fold(text);
  return folded.length > 0 && list.some((k) => folded.includes(k));
};

const matchesSelector = (el, selectors) =>
  selectors.some((s) =>
    s.startsWith('.') ? el.classes.includes(s.slice(1)) : false,
  );

function isCrossOrigin(href, pageOrigin) {
  if (!href) return false;
  if (/^(mailto:|tel:)/i.test(href)) return true;
  if (!/^https?:\/\//i.test(href)) return false;
  if (!pageOrigin) return true;
  try {
    return new URL(href).origin !== pageOrigin;
  } catch {
    return false;
  }
}

export function classify(el, profile, pageOrigin = null) {
  const hit = (cls, reason) => ({ class: cls, reason });

  // 1. Not interactable at all.
  if (el.disabled) return hit('unreachable', 'disabled');
  if (el.ariaHidden) return hit('unreachable', 'aria-hidden');
  if ((el.width ?? 0) === 0 || (el.height ?? 0) === 0) return hit('unreachable', 'zero size');

  const label = el.text ?? el.ariaLabel ?? el.name;

  // 2. External consequences — checked before destructive so an "upgrade"
  //    button labelled "Delete plan" is still treated as external.
  if (matchesSelector(el, profile.external.selectors)) return hit('external', 'profile selector');
  if (el.testId && profile.external.testIds.some((t) => el.testId.includes(t))) {
    return hit('external', `profile testid ${el.testId}`);
  }
  if (el.testId && hasKeyword(el.testId, EXTERNAL)) return hit('external', `testid ${el.testId}`);
  if (hasKeyword(label, EXTERNAL)) return hit('external', `text "${label}"`);

  // 3. Destructive or committing — click, but last.
  if (matchesSelector(el, profile.destructive.selectors)) {
    return hit('last', `profile selector (e.g. ant-btn-dangerous)`);
  }
  if (el.testId && profile.destructive.testIds.some((t) => el.testId.includes(t))) {
    return hit('last', `profile testid ${el.testId}`);
  }
  if (el.testId && hasKeyword(el.testId, DESTRUCTIVE)) return hit('last', `testid ${el.testId}`);
  if (el.type === 'submit') return hit('last', 'type=submit');
  if (isCrossOrigin(el.href, pageOrigin)) return hit('last', `leaves the screen: ${el.href}`);
  if (hasKeyword(label, DESTRUCTIVE)) return hit('last', `text "${label}"`);

  // 4. Unnameable: conservative rather than optimistic. Also a real a11y defect.
  if (!label && !el.testId) {
    return hit('unreachable', 'no accessible name and no data-testid — cannot be judged safe');
  }

  return hit('safe', 'no destructive or external signal');
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test test/classify.test.mjs`
Expected: PASS — 15 tests

- [ ] **Step 6: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/classify.mjs \
        plugins/aha-tracking/skills/check-tracking/recorder/profiles/ \
        plugins/aha-tracking/skills/check-tracking/recorder/test/classify.test.mjs
git commit -m "feat(tracking): app-agnostic element classification with profile overrides"
```

---

### Task 9: Enumerate a screen's interactive elements

**Files:**
- Modify: `recorder/inpage.js`

**Interfaces:**
- Consumes: `window.__ahaDescribe` (Task 6)
- Produces:
  - `window.__ahaInventory() → Array<Descriptor & { index: number, selector: string, nth: number, expandable: boolean }>` — callable from Node via `page.evaluate`
  - `window.__ahaClickBySelector(selector, nth) → 'clicked'|'gone'` — used by the sweep
  - `window.__ahaExpandables() → Array<{ selector, nth }>` — collapsed triggers to open

**Why selector + nth, not a cached index.** The sweep re-enumerates after every
recovery, so any index into a cached array goes stale the first time the DOM
changes. A selector resolved fresh on each click survives re-enumeration; `nth`
disambiguates when several elements share it.

- [ ] **Step 1: Add the inventory functions to `inpage.js`**

Insert before the closing `})();`:

```js
  const INTERACTIVE = [
    'button',
    'a[href]',
    'input:not([type=hidden])',
    'textarea',
    'select',
    '[contenteditable=true]',
    '[role=button]',
    '[role=switch]',
    '[role=tab]',
    '[role=menuitem]',
    '[role=checkbox]',
    '[role=radio]',
    '[role=link]',
  ].join(',');

  function collect() {
    return [...document.querySelectorAll(INTERACTIVE)].filter((el) => {
      const style = getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none';
    });
  }

  // A selector that can be re-resolved later. A data-testid is stable across
  // re-renders; the structural path is the fallback.
  function selectorFor(el) {
    const testId = el.getAttribute('data-testid');
    if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
    return cssPath(el);
  }

  function resolve(selector, nth) {
    let matches;
    try {
      matches = [...document.querySelectorAll(selector)];
    } catch {
      return null;
    }
    return matches[nth] ?? null;
  }

  window.__ahaInventory = () => {
    const seen = new Map();
    return collect().map((el, index) => {
      const selector = selectorFor(el);
      const nth = seen.get(selector) ?? 0;
      seen.set(selector, nth + 1);
      return {
        index,
        selector,
        nth,
        expandable: el.getAttribute('aria-expanded') === 'false' || el.getAttribute('aria-haspopup') != null,
        ...describe(el),
      };
    });
  };

  // Returns 'gone' when the element has detached since enumeration — the sweep
  // marks those ⚠️ rather than guessing.
  window.__ahaClickBySelector = (selector, nth) => {
    const el = resolve(selector, nth);
    if (!el || !el.isConnected) return 'gone';
    el.click();
    return 'clicked';
  };

  window.__ahaExpandables = () =>
    window.__ahaInventory()
      .filter((e) => e.expandable)
      .map(({ selector, nth }) => ({ selector, nth }));
```

- [ ] **Step 2: Verify manually**

Run `node record.mjs http://localhost:5174`, then in the Chrome DevTools console of the opened window:

```js
__ahaInventory().length
__ahaInventory().filter(e => e.expandable).length
```

Expected: a plausible count with populated `text`/`testId`/`selector` fields, and a non-negative expandable count.

- [ ] **Step 3: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/inpage.js
git commit -m "feat(tracking): enumerate elements with re-resolvable selectors"
```

---

### Task 10: The sweep, with recovery and the `[s]` key

**Files:**
- Create: `recorder/sweep.mjs`
- Modify: `recorder/record.mjs`

**Interfaces:**
- Consumes: `classify`, `loadProfile` (Task 8); `window.__ahaInventory`, `window.__ahaClickBySelector`, `window.__ahaExpandables` (Task 9); the session from Task 7
- Produces: `sweepScreen({ page, session, profile, allowExternal, log }) → { screenId, counts }` where `counts` is `{ total, swept, gone, skippedExternal, unreachable }`

- [ ] **Step 1: Write the sweep module**

`recorder/sweep.mjs`:

```js
// Sweeps one screen: enumerate, classify, click the permitted elements in
// order (safe first, destructive last), recovering state between clicks.
//
// Scope is the URL at the moment the sweep starts. Anything that navigates
// away is undone by returning to that URL. Elements are addressed by a
// re-resolvable selector rather than an index, because every recovery can
// change the DOM.
//
// A collapsed subtree (a dropdown, a menu) is EXPANDED rather than skipped:
// its trigger is clicked, the revealed elements are enumerated and swept, then
// Escape closes it. Bounded by MAX_DEPTH so a self-referential menu cannot
// loop forever.
import { classify } from './classify.mjs';

const SETTLE_MS = 1500;
const MAX_DEPTH = 3;

export async function sweepScreen({ page, session, profile, allowExternal, log }) {
  const targetUrl = page.url();
  const origin = new URL(targetUrl).origin;

  const counts = { total: 0, swept: 0, gone: 0, skippedExternal: 0, unreachable: 0 };
  const inventory = [];
  const seen = new Set();

  await sweepLevel({ page, session, profile, allowExternal, log, targetUrl, origin, inventory, counts, seen, depth: 0 });

  counts.total = inventory.length;
  counts.skippedExternal = allowExternal ? 0 : inventory.filter((e) => e.class === 'external').length;
  counts.unreachable = inventory.filter((e) => e.class === 'unreachable').length;

  const screenId = session.addScreen({ url: targetUrl, inventory });
  return { screenId, counts };
}

async function sweepLevel(ctx) {
  const { page, session, profile, allowExternal, log, targetUrl, origin, inventory, counts, seen, depth } = ctx;

  const raw = await page.evaluate(() => window.__ahaInventory());
  const level = raw
    .map((el) => {
      const key = `${el.selector}#${el.nth}`;
      const { class: cls, reason } = classify(el, profile, origin);
      return { key, id: inventory.length + 1, class: cls, reason, depth, ...el };
    })
    .filter((el) => !seen.has(el.key));

  for (const el of level) {
    seen.add(el.key);
    inventory.push(el);
  }

  const order = { safe: 0, last: 1 };
  const clickable = level
    .filter((el) => el.class === 'safe' || el.class === 'last' || (el.class === 'external' && allowExternal))
    .sort((a, b) => (order[a.class] ?? 2) - (order[b.class] ?? 2));

  if (depth === 0) {
    log(`  Sweeping ${targetUrl}`);
    log(`  ${level.length} interactive elements — ${clickable.length} will be clicked`);
  }

  for (const el of clickable) {
    const label = el.text ?? el.ariaLabel ?? el.testId ?? el.tag;

    const result = await page.evaluate(
      ([selector, nth]) => window.__ahaClickBySelector(selector, nth),
      [el.selector, el.nth],
    );
    if (result === 'gone') {
      el.class = 'unreachable';
      el.reason = 'element-gone: detached before the sweep reached it';
      counts.gone += 1;
      log(`  ⚠️  ${label} — element-gone`);
      continue;
    }

    session.addRaw({ kind: 'action', type: 'click', el, origin: 'auto' }, 'top');
    counts.swept += 1;
    log(`  ·  ${label}`);
    await page.waitForTimeout(SETTLE_MS);

    // Clicking a trigger may have revealed a submenu. Sweep it before recovering.
    if (el.expandable && depth < MAX_DEPTH && page.url() === targetUrl) {
      await sweepLevel({ ...ctx, depth: depth + 1 });
    }

    await recover(page, targetUrl);
  }
}

// Restores a known state after a click. Bounded because the sweep's scope is
// one screen: anything that left it is undone by going back.
async function recover(page, targetUrl) {
  if (page.url() !== targetUrl) {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
    return;
  }

  // A modal or drawer may have opened. Escape is harmless when nothing is open.
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);

  if (page.url() !== targetUrl) {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
  }
}
```

- [ ] **Step 2: Wire the `[s]` key into `record.mjs`**

Add to `recorder/record.mjs`, after the session is created and before the final log block:

```js
import { loadProfile } from './classify.mjs';
import { sweepScreen } from './sweep.mjs';

const profile = await loadProfile(process.env.AHA_TRACK_PROFILE ?? 'generic');
let sweeping = false;

// A native confirm()/alert() blocks the page until answered. Playwright would
// auto-dismiss anyway, but registering it explicitly makes the behaviour
// intentional and logs what was dismissed — the tester needs to know a
// confirmation was answered on their behalf.
page.on('dialog', async (dialog) => {
  console.log(`  (dismissed ${dialog.type()}: "${dialog.message().slice(0, 60)}")`);
  await dialog.dismiss().catch(() => {});
});

const onKey = async (key) => {
  if (key === '\u0003') return finish();          // Ctrl+C
  if (key !== 's' && key !== 'S') return;
  if (sweeping) return console.log('  (sweep already running)');
  sweeping = true;
  try {
    const { counts } = await sweepScreen({
      page, session, profile, allowExternal, log: (m) => console.log(m),
    });
    console.log(
      `  Done — ${counts.total} elements, ${counts.swept} clicked, ` +
        `${counts.skippedExternal} external skipped, ${counts.unreachable} unreachable ` +
        `(${counts.gone} vanished mid-sweep)\n`,
    );
  } catch (err) {
    console.log(`  sweep failed: ${err.message}`);
  } finally {
    sweeping = false;
  }
};

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', onKey);
}
```

Update the startup banner to mention the key:

```js
console.log('  Walk the feature. Press [s] on any screen to sweep it. Ctrl+C to finish.');
```

- [ ] **Step 3: Verify on a disposable survey**

Run: `node record.mjs http://localhost:5174/dashboard`

Press `s`. Expected:
- the terminal prints the inventory count, then one `·` line per clicked element
- destructive elements appear at the END of the `·` list, never the start
- opening a dropdown produces a second wave of `·` lines (the depth-1 sweep)
- the run ends on the same URL it started on
- any `confirm()` prints a `(dismissed confirm: …)` line rather than hanging

Confirm no survey was deleted. If one was, the classifier missed a destructive
signal — add its `data-testid` to `profiles/generic.json` and note it for
`profiles/aha-survey.json`.

- [ ] **Step 4: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/sweep.mjs \
        plugins/aha-tracking/skills/check-tracking/recorder/record.mjs
git commit -m "feat(tracking): sweep a screen on [s] with ordered clicks and state recovery"
```

---

## Phase 5 — Pairing, the skill, and the report

### Task 11: Pair actions to events and flag mechanical defects

**Files:**
- Create: `recorder/pair.mjs`
- Test: `recorder/test/pair.test.mjs`

**Interfaces:**
- Consumes: the `session.toJSON()` shape (Task 7)
- Produces: `pairSession(session, { windowMs = 1500 } = {}) → { pairs, transitions, orphans, checks }`. A `pair` is `{ action, events, flags }`; `transitions` are the pairs whose `action.type === 'navigate'`; `checks` is `{ signalDetected, totalActions, totalEvents, totalOrphans }`.

- [ ] **Step 1: Write the failing test**

`recorder/test/pair.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pairSession } from '../pair.mjs';

const build = (timeline) => ({ meta: { signalDetected: true }, screens: [], timeline });
const click = (seq, t, text) => ({ seq, t, kind: 'action', type: 'click', el: { text }, origin: 'auto' });
const ev = (seq, t, name, props = {}) => ({ seq, t, kind: 'event', name, props });

test('an event inside the window attaches to the preceding action', () => {
  const { pairs } = pairSession(build([click(1, 0, 'Publish'), ev(2, 200, 'survey.publish')]));
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].events[0].name, 'survey.publish');
  assert.deepEqual(pairs[0].flags, []);
});

test('an event beyond the window becomes an orphan', () => {
  const { pairs, orphans } = pairSession(build([click(1, 0, 'Publish'), ev(2, 5000, 'timer')]));
  assert.deepEqual(pairs[0].flags, ['no-event']);
  assert.equal(orphans.length, 1);
  assert.equal(orphans[0].name, 'timer');
});

test('an event with no preceding action is an orphan', () => {
  const { orphans } = pairSession(build([ev(1, 10, 'page.view')]));
  assert.equal(orphans.length, 1);
});

test('an action with no event is flagged no-event', () => {
  const { pairs } = pairSession(build([click(1, 0, 'Duplicate')]));
  assert.deepEqual(pairs[0].flags, ['no-event']);
});

test('the same event twice in one window is flagged duplicate', () => {
  const { pairs } = pairSession(
    build([click(1, 0, 'Save'), ev(2, 100, 'survey.save'), ev(3, 200, 'survey.save')]),
  );
  assert.ok(pairs[0].flags.includes('duplicate'));
});

test('an _anonymous name is flagged', () => {
  const { pairs } = pairSession(build([click(1, 0, 'x'), ev(2, 50, 'click_anonymous')]));
  assert.ok(pairs[0].flags.includes('anonymous-name'));
});

test('an undefined_action name is flagged', () => {
  const { pairs } = pairSession(build([click(1, 0, 'x'), ev(2, 50, 'undefined_action_thing')]));
  assert.ok(pairs[0].flags.includes('undefined-action'));
});

test('null, undefined and empty-string props are flagged', () => {
  const { pairs } = pairSession(
    build([click(1, 0, 'x'), ev(2, 50, 'survey.x', { survey_id: null, name: '' })]),
  );
  assert.ok(pairs[0].flags.includes('empty-props'));
});

test('a navigation attributes its follow-on event and lands in transitions', () => {
  const timeline = [
    { seq: 1, t: 0, kind: 'action', type: 'navigate', from: 'a', to: 'b' },
    ev(2, 300, 'survey.editor_opened'),
  ];
  const { transitions } = pairSession(build(timeline));
  assert.equal(transitions.length, 1);
  assert.equal(transitions[0].events[0].name, 'survey.editor_opened');
  assert.deepEqual(transitions[0].flags, []);
});

test('a navigation with no event is flagged, exposing a funnel gap', () => {
  const timeline = [{ seq: 1, t: 0, kind: 'action', type: 'navigate', from: 'a', to: 'b' }];
  const { transitions } = pairSession(build(timeline));
  assert.deepEqual(transitions[0].flags, ['no-event']);
});

test('a later action takes ownership of subsequent events', () => {
  const timeline = [click(1, 0, 'A'), click(2, 100, 'B'), ev(3, 150, 'survey.b')];
  const { pairs } = pairSession(build(timeline));
  assert.deepEqual(pairs[0].flags, ['no-event']);
  assert.equal(pairs[1].events[0].name, 'survey.b');
});

test('an empty timeline yields empty results', () => {
  const r = pairSession(build([]));
  assert.deepEqual(r.pairs, []);
  assert.equal(r.checks.totalActions, 0);
});

test('checks report the totals', () => {
  const r = pairSession(build([click(1, 0, 'A'), ev(2, 50, 'x'), ev(3, 9000, 'orphan')]));
  assert.deepEqual(r.checks, {
    signalDetected: true, totalActions: 1, totalEvents: 2, totalOrphans: 1,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/pair.test.mjs`
Expected: FAIL — `Cannot find module '../pair.mjs'`

- [ ] **Step 3: Write the implementation**

`recorder/pair.mjs`:

```js
// Attributes each event to the action that most plausibly caused it, then
// applies the mechanical defect checks — the ones a string comparison can
// make, so the LLM never has to.
//
// Pure: takes session.toJSON(), returns plain data.

const DEFAULT_WINDOW_MS = 1500;

function flagsFor(events) {
  const flags = [];
  if (events.length === 0) {
    flags.push('no-event');
    return flags;
  }

  const names = events.map((e) => e.name);
  if (new Set(names).size !== names.length) flags.push('duplicate');
  if (names.some((n) => n.includes('_anonymous'))) flags.push('anonymous-name');
  if (names.some((n) => n.includes('undefined_action'))) flags.push('undefined-action');

  const emptyProp = events.some((e) =>
    Object.values(e.props ?? {}).some((v) => v === null || v === undefined || v === ''),
  );
  if (emptyProp) flags.push('empty-props');

  return flags;
}

export function pairSession(session, { windowMs = DEFAULT_WINDOW_MS } = {}) {
  const timeline = [...(session.timeline ?? [])].sort((a, b) => a.seq - b.seq);
  const pairs = [];
  const orphans = [];
  let current = null;
  let totalEvents = 0;

  for (const entry of timeline) {
    if (entry.kind === 'action') {
      current = { action: entry, events: [], flags: [] };
      pairs.push(current);
      continue;
    }
    if (entry.kind !== 'event') continue;

    totalEvents += 1;
    if (current && entry.t - current.action.t <= windowMs) {
      current.events.push(entry);
    } else {
      orphans.push(entry);
    }
  }

  for (const pair of pairs) pair.flags = flagsFor(pair.events);

  return {
    pairs,
    transitions: pairs.filter((p) => p.action.type === 'navigate'),
    orphans,
    checks: {
      signalDetected: session.meta?.signalDetected ?? false,
      totalActions: pairs.length,
      totalEvents,
      totalOrphans: orphans.length,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/pair.test.mjs`
Expected: PASS — 13 tests

- [ ] **Step 5: Run the whole suite**

Run: `node --test test/`
Expected: PASS — all files

- [ ] **Step 6: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/recorder/pair.mjs \
        plugins/aha-tracking/skills/check-tracking/recorder/test/pair.test.mjs
git commit -m "feat(tracking): pair actions to events and flag mechanical defects"
```

---

### Task 12: The skill, its report template, and its reference

**Files:**
- Create: `plugins/aha-tracking/skills/check-tracking/SKILL.md`
- Create: `plugins/aha-tracking/skills/check-tracking/templates/report-template.md`
- Create: `plugins/aha-tracking/skills/check-tracking/references/event-naming.md`

**Interfaces:**
- Consumes: `pairSession` (Task 11), `session.json` (Task 7)
- Produces: the skill contract — invoked as `/check-tracking <session.json>`, writes one markdown report

- [ ] **Step 1: Write the report template**

`templates/report-template.md`:

```markdown
# Tracking check — {{feature}}

**Session**: `{{sessionPath}}`
**Recorded**: {{startedAt}} → {{endedAt}}
**Hooks armed**: {{hooksArmed}}
**allow-external**: {{allowExternal}}

## Summary

| Screen | Elements | ✅ | ❌ | ⚠️ |
|---|---|---|---|---|
{{summaryRows}}

## Screens

{{screenSections}}

## Transitions

| From → To | Event | Verdict |
|---|---|---|
{{transitionRows}}

## Events with no originating action

These fired without a preceding action inside the pairing window — page views,
timers, retries. Listed for completeness; **not** defects.

{{orphanRows}}

## Notes

{{notes}}
```

- [ ] **Step 2: Write the naming reference**

`references/event-naming.md`:

```markdown
# Event naming — what the checker can and cannot judge

## Slide plugins derive names automatically

`packages/ui/src/tracking.ts` builds the name as
`<action>_<objectName>_<otherInfo>`, snake_cased, per the
[2024 naming guideline](https://ahaslides.atlassian.net/wiki/spaces/AT/pages/826834947/Event+Tracking+-+Naming+Guideline+2024).

Two fallbacks are outright defects, and the recorder flags both mechanically:

| Fallback | Constant | Means |
|---|---|---|
| `..._anonymous` | `ANONYMOUS_ELEMENT` | the element has no `name` attribute, no named descendant, and no component name |
| `undefined_action` | `EVENT_ACTIONS` miss | the DOM event is outside the supported set |

Neither needs judgement — `pair.mjs` finds them with `String.includes`.

## aha-survey uses an explicit catalog

`frontend/src/analytics/events.ts` maps a symbol to a wire name, and
`mixpanelClient.ts` prepends `survey.`. So `dashboard.viewed` arrives as
`survey.dashboard.viewed`.

## What the LLM judges

Only what strings cannot:

1. **Does the name describe the action?** Clicking *Delete* and seeing
   `click_publish_button` is wrong in a way no comparison catches.
2. **Are the props plausible?** A missing `survey_id` on a survey-scoped event;
   a user email in a payload; a value contradicting the action.

## What the LLM must NOT do

- Do not judge conformance to the naming guideline. Report the observed name.
- Do not infer that an unexercised element lacks tracking. ⚠️ is not ❌.
- Do not claim the event reached Mixpanel. The recorder proves it was *sent*.
```

- [ ] **Step 3: Write the skill**

`SKILL.md`:

```markdown
---
name: check-tracking
description: Use when checking whether an AhaSlides feature fires its analytics events — triggers on "check tracking", "kiểm tra tracking", "which buttons are missing events", "verify analytics for <feature>", or when a tracking session.json is mentioned. Reads a session recorded by the tracking recorder and reports which elements and screen transitions fire events, which do not, and which could not be checked.
---

# AhaSlides — check event tracking

## Purpose

Turn a recorded session into a verdict. The recorder has already captured every
analytics payload the app sent, swept each screen, and paired actions to events.
This skill does the part scripts cannot: decide whether each event *name* fits
the action that produced it, whether its *props* are plausible, and write the
report.

## Inputs

1. **A `session.json`** produced by `recorder/record.mjs` (required).
2. **A task ID** (optional) — a Jira key matching `/AHA-\d+/`. Determines the
   output folder. Reject keys containing spaces, `..`, leading dots, or path
   separators, and re-prompt — never build a path from a malformed key.

## Recording a session first

If the user has no session yet, tell them to run:

```bash
cd <plugin>/skills/check-tracking/recorder
npm install                 # first run only
node record.mjs <url>       # add --allow-external only on a disposable account
```

Then: walk the feature, press `s` on each screen to sweep it, `Ctrl+C` to finish.

**Requires a local display.** Do not attempt this under `claude.ai/code`, over
SSH, or from a background agent — Chrome is launched headed on the tester's
machine.

## Process

### Step 1 — Load and gate

Read the session. Then run the pairing:

```bash
node -e "import('./pair.mjs').then(async m => {
  const s = JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));
  console.log(JSON.stringify(m.pairSession(s), null, 2));
})" <session.json>
```

**If `meta.signalDetected === false`, STOP.** Report "signal not detected — the
recorder captured no analytics payload, so this session cannot be judged" and
say which hooks were armed. Do **not** produce a findings report. Reporting
every element as missing when the real cause is an unmatched hook is the worst
possible output: uniformly wrong and confidently phrased.

### Step 2 — Classify every element on every screen

For each screen's `inventory`, cross-reference the pairs:

| Verdict | Condition |
|---|---|
| ✅ | The element was clicked and at least one event followed within the window |
| ❌ | The element was clicked and no event followed |
| ⚠️ | The element was never clicked — carry its `class` and `reason` through |

The three buckets must sum to the inventory total for that screen. Every ⚠️ line
names its reason and the action needed. Never write a bare "check manually".

### Step 3 — Judge names and props

For each ✅ pair, decide:

- **Name fit.** Does the event name describe what the element does? Quote the
  element label and the event name side by side when it does not.
- **Prop plausibility.** Flag a missing scope id, an email or other personal
  data, or a value contradicting the action.

Carry the mechanical flags through unchanged — `pair.mjs` already found
`no-event`, `duplicate`, `anonymous-name`, `undefined-action`, and
`empty-props`. Do not re-derive them; do not second-guess them.

See `references/event-naming.md` for what is and is not yours to judge.

### Step 4 — Transitions

Every entry in `transitions` with a `no-event` flag is a funnel gap. Report them
in their own table — they are the findings the manual method almost never
reaches.

### Step 5 — Write the report

Resolve the output path, `mkdir -p` the folder, fill
`templates/report-template.md`, and give a short chat summary: per-screen
counts, the headline finding, and the absolute path.

```
<outputs-root>/<task-id>/7-tracking-check.md
<outputs-root>/unscoped-tracking/<feature>-<YYYY-MM-DD>.md   # no task id
```

`<outputs-root>` is `$QA_WORKFLOW_OUTPUTS_DIR`, else
`$HOME/Documents/QA Workflow/AhaSlides/outputs`. Never write outside this root.
If the file exists, ask — overwrite, rename with a timestamp, or abort — never
overwrite silently.

## Hard rules

1. **Never produce findings when `signalDetected` is false.**
2. **Never downgrade ⚠️ to ❌.** Unexercised is unknown, not failing.
3. **Never claim the event reached Mixpanel.** The recorder proves it was sent.
4. **Never report coverage that was not achieved.** Name what the session never
   reached.
5. **Report only what the session contains.** Do not infer tracking from source
   code — the point of the recorder is runtime evidence.

## Known limits

- Coverage equals the screens the tester visited in the states they created.
- The 1500 ms pairing window is a heuristic; a debounced event may land in
  `orphans`. Orphans are reported, never counted as failures.
- An icon-only element with no accessible name and no `data-testid` is
  `unreachable` by design. That is also a genuine a11y defect worth raising.
```

- [ ] **Step 4: Verify the skill end to end**

Record a short session against `aha-survey` local, then invoke the skill with it.
Expected: a report whose per-screen buckets sum to the inventory total, and a
transitions table.

Also verify the gate: hand it a session with `meta.signalDetected: false` and
confirm the skill refuses rather than reporting everything as missing.

- [ ] **Step 5: Commit**

```bash
git add plugins/aha-tracking/skills/check-tracking/SKILL.md \
        plugins/aha-tracking/skills/check-tracking/templates/ \
        plugins/aha-tracking/skills/check-tracking/references/
git commit -m "feat(tracking): check-tracking skill, report template and naming reference"
```

---

## Phase 6 — Packaging

### Task 13: Plugin manifest, marketplace entry, and dependency bootstrap

**Files:**
- Create: `.claude-plugin/marketplace.json` (repo root)
- Create: `plugins/aha-tracking/.claude-plugin/plugin.json`
- Create: `plugins/aha-tracking/README.md`
- Modify: `plugins/aha-tracking/skills/check-tracking/SKILL.md` (bootstrap step)

**Interfaces:**
- Consumes: everything above
- Produces: an installable plugin — `/plugin marketplace add AhaSlides-Product/aha-slide-plugin` then `/plugin install aha-tracking`

- [ ] **Step 1: Write the marketplace manifest**

`.claude-plugin/marketplace.json` at the repo root:

```json
{
  "name": "ahaslides",
  "owner": {
    "name": "AhaSlides Product",
    "url": "https://github.com/AhaSlides-Product"
  },
  "plugins": [
    {
      "name": "aha-tracking",
      "source": "./plugins/aha-tracking",
      "description": "Records analytics events while a tester walks an AhaSlides feature, sweeps each screen, and reports which elements and transitions are missing tracking."
    }
  ]
}
```

- [ ] **Step 2: Write the plugin manifest**

`plugins/aha-tracking/.claude-plugin/plugin.json`:

```json
{
  "name": "aha-tracking",
  "description": "QA tooling for verifying analytics event tracking across AhaSlides apps",
  "version": "1.0.0",
  "author": { "name": "AhaSlides QA" },
  "repository": "https://github.com/AhaSlides-Product/aha-slide-plugin",
  "keywords": ["qa", "analytics", "mixpanel", "tracking"]
}
```

- [ ] **Step 3: Write the plugin README**

`plugins/aha-tracking/README.md`:

```markdown
# aha-tracking

Verifies that an AhaSlides feature fires the analytics events it should.

## Install

```
/plugin marketplace add AhaSlides-Product/aha-slide-plugin
/plugin install aha-tracking
```

## Use

```bash
cd <plugin-dir>/skills/check-tracking/recorder
npm install                 # first run on each machine
node record.mjs https://dev01.../dashboard
```

Chrome opens on a dedicated profile (`~/.aha-track-profile`) — log in once and
it persists. Walk the feature, press `s` on each screen to sweep it, `Ctrl+C`
to finish. Then in Claude Code:

```
/check-tracking session-<timestamp>.json
```

Add `--allow-external` only on a disposable account: it permits clicking
elements with consequences outside the test account (send email, upgrade).

## Requirements

- Node ≥ 18, Chrome installed, and a **local display**. Not usable under
  `claude.ai/code`, over SSH, or from a background agent.
- Per machine, not per account: the Chrome profile login, `node_modules`, and
  the written sessions.

## How it works

The recorder injects one script into every frame that wraps
`navigator.sendBeacon`, `fetch`, `XMLHttpRequest.send`, `mixpanel.track`, and
`xprops.trackGA4AndMixpanel` — so it captures events on production and inside
slide-plugin iframes, where the console shows nothing. Everything except the
final naming and props judgement is deterministic code.

## Tests

```bash
cd skills/check-tracking/recorder && node --test test/
```

The smoke tests need Chrome; they skip when it is absent.
```

- [ ] **Step 4: Add the bootstrap step to `SKILL.md`**

Insert into `SKILL.md` immediately before "### Step 1 — Load and gate":

```markdown
### Step 0 — Bootstrap dependencies

Plugin updates replace the cached plugin directory, so `node_modules` may be
missing even on a machine that has run this before. Check and install without
asking:

```bash
cd <plugin>/skills/check-tracking/recorder
[ -d node_modules ] || npm install
```

If `npm install` fails (no network, no npm), say so plainly and stop — the
recorder cannot run without `playwright-core`.
```

- [ ] **Step 5: Verify a clean install**

```bash
/plugin marketplace add /Users/<you>/Desktop/Ahaslide_repos/aha-slide-plugin/aha-slide-plugin
/plugin install aha-tracking
```

Expected: the plugin installs and `/check-tracking` appears. Run it against an
existing `session.json` to confirm the skill resolves its own paths from the
plugin cache directory.

- [ ] **Step 6: Run the full suite one final time**

Run: `cd plugins/aha-tracking/skills/check-tracking/recorder && node --test test/`
Expected: all tests pass (smoke tests may skip without Chrome).

- [ ] **Step 7: Commit**

```bash
git add .claude-plugin/ plugins/aha-tracking/.claude-plugin/ \
        plugins/aha-tracking/README.md \
        plugins/aha-tracking/skills/check-tracking/SKILL.md
git commit -m "feat(tracking): package aha-tracking as an installable plugin"
```

---

## Open questions resolved during execution

Record the answers in the spec as they are settled:

1. **Task 5 / Step 6** — does `xprops` exist at injection time, or does the
   `defineProperty` trap fire? If neither works, the bridge may be reached
   through a different object and the spec's capture section needs revising.
2. **Task 10 / Step 3** — can the app locale be forced to `en` before sweeping?
   If not, signal 5 (visible text) stays blind in 36 languages and the profiles
   must carry more `data-testid` patterns.
3. **Task 10 / Step 3** — which extra signals does each app profile need? Create
   `profiles/aha-survey.json` and `profiles/presenter.json` once the generic
   profile has been run against both.

## Deferred to a later plan

Phase 7 autopilot (`--auto "<flow description>"`), per the spec's Roadmap. It
sits on top of this engine and changes nothing below the driver.
