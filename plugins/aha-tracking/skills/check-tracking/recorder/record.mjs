#!/usr/bin/env node
// Entry point. Launches a headed Chrome on a dedicated profile, injects the
// in-page recorder, streams what it captures to the terminal, and writes
// session.json on exit.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { resolveChromePath } from './chrome.mjs';
import { createSession } from './session.mjs';
import { loadProfile } from './classify.mjs';
import { sweepScreen } from './sweep.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = join(homedir(), '.aha-track-profile');
const SESSION_DIR = join(HERE, 'sessions');

function parseArgs(argv) {
  const args = argv.slice(2);
  const url = args.find((a) => !a.startsWith('--'));
  if (!url) {
    console.error('usage: node record.mjs <url> [--allow-external]');
    process.exit(1);
  }
  return { url, allowExternal: args.includes('--allow-external') };
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

async function main() {
  const { url, allowExternal } = parseArgs(process.argv);
  const executablePath = resolveChromePath();
  const session = createSession({ allowExternal });

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    executablePath,
    headless: false,
    viewport: null,
    args: ['--start-maximized'],
  });

  await context.exposeBinding('__ahaTrackSink', (source, json) => {
    const record = JSON.parse(json);
    const frame =
      source.frame === source.page.mainFrame() ? 'top' : source.frame.url();

    const before = session.toJSON().timeline.length;
    session.addRaw(record, frame);
    const added = session.toJSON().timeline.slice(before);

    for (const entry of added) {
      if (entry.kind === 'action') {
        const el = entry.el ?? {};
        const label = el.text ?? el.ariaLabel ?? el.testId ?? el.tag ?? '?';
        console.log(`  ${entry.type.toUpperCase().padEnd(6)} ${label}`);
      } else if (entry.kind === 'event') {
        const where = entry.frame === 'top' ? '' : '  (iframe)';
        console.log(`    └─ ${entry.name}${where}`);
      }
    }
  });
  await context.addInitScript({ path: join(HERE, 'inpage.js') });

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

  // A native confirm()/alert() blocks the page until answered. Playwright
  // would auto-dismiss anyway; registering it explicitly makes the behaviour
  // intentional and logs what was dismissed — the tester needs to know a
  // confirmation was answered on their behalf.
  page.on('dialog', async (dialog) => {
    console.log(`  (dismissed ${dialog.type()}: "${dialog.message().slice(0, 60)}")`);
    await dialog.dismiss().catch(() => {});
  });

  console.log('');
  console.log(`  Recording. Profile: ${PROFILE_DIR}`);
  console.log(`  allow-external: ${allowExternal}`);
  console.log('  Walk the feature. Press [s] on any screen to sweep it. Ctrl+C to finish.');
  console.log('');

  let finished = false;
  const finish = async () => {
    if (finished) return;
    finished = true;

    await mkdir(SESSION_DIR, { recursive: true });
    const out = join(SESSION_DIR, `session-${stamp()}.json`);
    await writeFile(out, JSON.stringify(session.toJSON(), null, 2), 'utf8');

    if (!session.signalDetected) {
      console.log('\n  signal-not-detected: no analytics payload was captured.');
      console.log('  The hooks did not match this app. Do NOT read this as "no tracking".');
    }
    console.log(`\n  Session written: ${out}\n`);

    await context.close().catch(() => {});
    process.exit(session.signalDetected ? 0 : 2);
  };

  const profile = await loadProfile(process.env.AHA_TRACK_PROFILE ?? 'generic');
  let sweeping = false;

  const onKey = async (key) => {
    if (key === '\u0003') return finish(); // Ctrl+C — raw mode swallows SIGINT
    if (key !== 's' && key !== 'S') return;
    if (sweeping) {
      console.log('  (sweep already running)');
      return;
    }
    sweeping = true;
    try {
      const { counts } = await sweepScreen({
        page,
        session,
        profile,
        allowExternal,
        log: (m) => console.log(m),
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
  } else {
    console.log('  (stdin is not a TTY — [s] unavailable; recording only)');
  }

  process.on('SIGINT', finish);
  context.on('close', finish);
}

main().catch((err) => {
  console.error(`\n  ${err.message}\n`);
  process.exit(1);
});
