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

// Guarantees the browser is closed even when an assertion throws. Without this
// a failing test leaves Chrome running and `node --test` never exits.
async function withRecorder(fn) {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  try {
    const context = await browser.newContext();
    const records = [];
    await context.exposeBinding('__ahaTrackSink', (_source, json) => {
      records.push(JSON.parse(json));
    });
    await context.addInitScript({ path: INPAGE });
    const page = await context.newPage();
    return await fn({ page, records });
  } finally {
    await browser.close().catch(() => {});
  }
}

test('captures sendBeacon, fetch and XHR payloads', { skip: !chromePath, timeout: 60_000 }, async () => {
  await withRecorder(async ({ page, records }) => {
    await page.goto(`${server.url}/beacon.html`);
    await page.click('#go');
    await page.waitForTimeout(500);

    const vias = records.filter((r) => r.kind === 'raw').map((r) => r.via);
    assert.ok(vias.includes('sendBeacon'), `sendBeacon missing, got ${vias.join()}`);
    assert.ok(vias.includes('fetch'), `fetch missing, got ${vias.join()}`);
    assert.ok(vias.includes('xhr'), `xhr missing, got ${vias.join()}`);

    const beacon = records.find((r) => r.via === 'sendBeacon');
    assert.match(beacon.url, /\/track\//);
    assert.match(beacon.body, /^data=/);
  });
});

test('records the click that caused the payload', { skip: !chromePath, timeout: 60_000 }, async () => {
  await withRecorder(async ({ page, records }) => {
    await page.goto(`${server.url}/beacon.html`);
    await page.click('#go');
    await page.waitForTimeout(300);

    const actions = records.filter((r) => r.kind === 'action');
    assert.equal(actions.length >= 1, true, 'no action recorded');

    const click = actions.find((a) => a.type === 'click');
    assert.equal(click.el.tag, 'button');
    assert.equal(click.el.text, 'go');
    assert.equal(click.el.path, 'button#go');

    // The action must be recorded BEFORE the payload it caused, so pairing
    // can attribute the event to it.
    const firstAction = records.findIndex((r) => r.kind === 'action');
    const firstRaw = records.findIndex((r) => r.kind === 'raw');
    assert.ok(firstAction < firstRaw, 'action must precede the payload it caused');
  });
});

test('captures the zoid bridge and the mixpanel SDK', { skip: !chromePath, timeout: 60_000 }, async () => {
  await withRecorder(async ({ page, records }) => {
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

    const bridge = records.filter((r) => r.kind === 'bridge');
    const names = bridge.map((r) => r.name);
    assert.ok(names.includes('click_submit_button'), `bridge missing, got ${names.join()}`);
    assert.ok(names.includes('survey.sdk_event'), `sdk missing, got ${names.join()}`);
  });
});
