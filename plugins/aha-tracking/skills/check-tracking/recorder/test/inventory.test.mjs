import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { resolveChromePath } from '../chrome.mjs';
import { classify, loadProfile } from '../classify.mjs';
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
let browser;
let page;

before(async () => {
  server = await startServer(join(HERE, 'fixtures'));
  if (!chromePath) return;
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const context = await browser.newContext();
  await context.exposeBinding('__ahaTrackSink', () => {});
  await context.addInitScript({ path: INPAGE });
  page = await context.newPage();
  await page.goto(`${server.url}/inventory.html`);
});

after(async () => {
  await browser?.close().catch(() => {});
  await server?.close();
});

test('enumerates interactive elements and skips hidden ones', { skip: !chromePath, timeout: 60_000 }, async () => {
  const inv = await page.evaluate(() => window.__ahaInventory());
  const texts = inv.map((e) => e.text);

  assert.ok(texts.includes('Preview'));
  assert.ok(texts.includes('Div button'), 'role=button must be enumerated');
  assert.ok(texts.includes('Disabled'), 'disabled elements are enumerated, then classified');
  assert.ok(!texts.includes('Hidden'), 'display:none must be skipped');
  assert.ok(!inv.some((e) => e.name === 'secret'), 'hidden inputs must be skipped');
});

test('prefers data-testid for the selector, falls back to a path', { skip: !chromePath }, async () => {
  const inv = await page.evaluate(() => window.__ahaInventory());
  const preview = inv.find((e) => e.text === 'Preview');
  assert.equal(preview.selector, '[data-testid="preview-btn"]');

  const div = inv.find((e) => e.text === 'Div button');
  assert.match(div.selector, /div/);
});

test('classification over a real DOM matches the intended buckets', { skip: !chromePath }, async () => {
  const profile = await loadProfile('generic');
  const inv = await page.evaluate(() => window.__ahaInventory());
  const origin = new URL(page.url()).origin;
  const by = (text) => classify(inv.find((e) => e.text === text), profile, origin);

  assert.equal(by('Preview').class, 'safe');
  assert.equal(by('Settings').class, 'safe');
  assert.equal(by('Delete image').class, 'last');
  assert.equal(by('削除').class, 'last', 'ant-btn-dangerous must win with no English text');
  assert.equal(by('Docs').class, 'last', 'cross-origin link leaves the screen');
  assert.equal(by('Disabled').class, 'unreachable');
});

test('flags an aria-expanded=false trigger as expandable', { skip: !chromePath }, async () => {
  const inv = await page.evaluate(() => window.__ahaInventory());
  assert.equal(inv.find((e) => e.text === 'Menu').expandable, true);
  assert.equal(inv.find((e) => e.text === 'Preview').expandable, false);
});

test('clicks by selector and reports a detached element as gone', { skip: !chromePath }, async () => {
  await page.goto(`${server.url}/inventory.html`);
  const inv = await page.evaluate(() => window.__ahaInventory());
  const vanish = inv.find((e) => e.text === 'Vanishes on click');

  const first = await page.evaluate(
    ([s, n]) => window.__ahaClickBySelector(s, n),
    [vanish.selector, vanish.nth],
  );
  assert.equal(first, 'clicked');

  const second = await page.evaluate(
    ([s, n]) => window.__ahaClickBySelector(s, n),
    [vanish.selector, vanish.nth],
  );
  assert.equal(second, 'gone', 'a removed element must report gone, never silently succeed');
});

test('a selector still resolves after the element is destroyed and rebuilt', { skip: !chromePath }, async () => {
  await page.goto(`${server.url}/inventory.html`);
  const inv = await page.evaluate(() => window.__ahaInventory());
  const row = inv.find((e) => e.testId === 'row-action');

  // Rebuild the row — a cached node reference or index would now be stale.
  await page.click('#rerender');

  const result = await page.evaluate(
    ([s, n]) => window.__ahaClickBySelector(s, n),
    [row.selector, row.nth],
  );
  assert.equal(result, 'clicked');
  assert.equal(await page.evaluate(() => window.__rowClicked), true);
});
