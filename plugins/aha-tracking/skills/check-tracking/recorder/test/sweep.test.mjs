import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { resolveChromePath } from '../chrome.mjs';
import { loadProfile } from '../classify.mjs';
import { createSession } from '../session.mjs';
import { sweepScreen } from '../sweep.mjs';
import { pairSession } from '../pair.mjs';
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
let profile;

before(async () => {
  server = await startServer(join(HERE, 'fixtures'));
  profile = await loadProfile('generic');
  if (chromePath) {
    browser = await chromium.launch({ executablePath: chromePath, headless: true });
  }
});

after(async () => {
  await browser?.close().catch(() => {});
  await server?.close();
});

async function runSweep({ allowExternal = false } = {}) {
  const context = await browser.newContext();
  const session = createSession({ allowExternal });
  await context.exposeBinding('__ahaTrackSink', (source, json) => {
    session.addRaw(JSON.parse(json), 'top');
  });
  await context.addInitScript({ path: INPAGE });
  const page = await context.newPage();
  await page.goto(`${server.url}/sweep.html`);

  const result = await sweepScreen({ page, session, profile, allowExternal, settleMs: 40 });
  const order = await page.evaluate(() => window.__order);
  await context.close();
  return { ...result, order, session };
}

test('destructive elements are clicked LAST, never first', { skip: !chromePath, timeout: 120_000 }, async () => {
  const { order } = await runSweep();

  const deleteAt = order.indexOf('canvas-image-delete-btn');
  assert.ok(deleteAt >= 0, 'the destructive element must still be swept');

  const safeIds = ['preview-btn', 'rename-btn'];
  for (const id of safeIds) {
    const at = order.indexOf(id);
    assert.ok(at >= 0, `${id} was never clicked`);
    assert.ok(at < deleteAt, `${id} must be clicked before the destructive element`);
  }
});

test('external elements are skipped by default', { skip: !chromePath, timeout: 120_000 }, async () => {
  const { order, counts, inventory } = await runSweep();
  assert.ok(!order.includes('csat-send-btn'), 'send must not be clicked without --allow-external');
  assert.equal(counts.skippedExternal, 1);
  assert.equal(inventory.find((e) => e.testId === 'csat-send-btn').class, 'external');
});

test('--allow-external opts the external elements back in', { skip: !chromePath, timeout: 120_000 }, async () => {
  const { order, counts } = await runSweep({ allowExternal: true });
  assert.ok(order.includes('csat-send-btn'), 'send must be clicked with --allow-external');
  assert.equal(counts.skippedExternal, 0);
});

test('a collapsed menu is expanded and its contents swept', { skip: !chromePath, timeout: 120_000 }, async () => {
  const { order, inventory } = await runSweep();
  assert.ok(
    order.includes('menu-duplicate'),
    'a button only reachable after opening the menu must still be swept',
  );
  const duplicate = inventory.find((e) => e.testId === 'menu-duplicate');
  assert.equal(duplicate.depth, 1, 'the revealed element belongs to the nested level');
});

test('every swept element is recorded exactly once', { skip: !chromePath, timeout: 120_000 }, async () => {
  const { counts, session } = await runSweep();
  const actions = session.toJSON().timeline.filter((e) => e.kind === 'action');

  // Counting only origin:'auto' hid a real bug: el.click() also fired the
  // in-page listener, so each swept element produced a second entry labelled
  // 'manual'. Assert the TOTAL, which is what pair.mjs and the report see.
  assert.equal(
    actions.length,
    counts.swept,
    `expected ${counts.swept} action entries, got ${actions.length} ` +
      `(auto=${actions.filter((a) => a.origin === 'auto').length}, ` +
      `manual=${actions.filter((a) => a.origin === 'manual').length}) — duplicates double the report`,
  );
  assert.equal(actions.every((a) => a.origin === 'auto'), true);
});

test('a swept element yields one pair, not a phantom no-event twin', { skip: !chromePath, timeout: 120_000 }, async () => {
  const { counts, session } = await runSweep();
  const { checks } = pairSession(session.toJSON());
  assert.equal(checks.totalActions, counts.swept);
});

test('the three buckets sum to the inventory total', { skip: !chromePath, timeout: 120_000 }, async () => {
  const { counts, inventory } = await runSweep();
  const byClass = (c) => inventory.filter((e) => e.class === c).length;
  assert.equal(
    byClass('safe') + byClass('last') + byClass('external') + byClass('unreachable'),
    counts.total,
  );
  assert.equal(counts.total, inventory.length);
});
