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

// How long to wait after a click for a debounced or deferred event to fire.
// Must stay in step with the pairing window in pair.mjs — an event that lands
// after the sweep has moved on is attributed to the wrong action.
const SETTLE_MS = 1500;
const MAX_DEPTH = 3;

export async function sweepScreen({
  page,
  session,
  profile,
  allowExternal,
  log = () => {},
  settleMs = SETTLE_MS,
}) {
  const targetUrl = page.url();
  const origin = new URL(targetUrl).origin;

  const counts = { total: 0, swept: 0, gone: 0, skippedExternal: 0, unreachable: 0 };
  const inventory = [];
  const seen = new Set();

  await sweepLevel({
    page, session, profile, allowExternal, log, settleMs,
    targetUrl, origin, inventory, counts, seen, depth: 0,
  });

  counts.total = inventory.length;
  counts.skippedExternal = allowExternal
    ? 0
    : inventory.filter((e) => e.class === 'external').length;
  counts.unreachable = inventory.filter((e) => e.class === 'unreachable').length;

  const screenId = session.addScreen({ url: targetUrl, inventory });
  return { screenId, counts, inventory };
}

async function sweepLevel(ctx) {
  const {
    page, session, profile, allowExternal, log, settleMs,
    targetUrl, origin, inventory, counts, seen, depth,
  } = ctx;

  const raw = await page.evaluate(() => window.__ahaInventory());

  const level = [];
  for (const el of raw) {
    const key = `${el.selector}#${el.nth}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const { class: cls, reason } = classify(el, profile, origin);
    const entry = { key, id: inventory.length + 1, class: cls, reason, depth, ...el };
    inventory.push(entry);
    level.push(entry);
  }

  const order = { safe: 0, last: 1 };
  const clickable = level
    .filter(
      (el) =>
        el.class === 'safe' ||
        el.class === 'last' ||
        (el.class === 'external' && allowExternal),
    )
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
    await page.waitForTimeout(settleMs);

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
