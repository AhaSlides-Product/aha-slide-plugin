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

  console.log('');
  console.log(`  Recording. Profile: ${PROFILE_DIR}`);
  console.log(`  allow-external: ${allowExternal}`);
  console.log('  Walk the feature. Ctrl+C to finish.');
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

  process.on('SIGINT', finish);
  context.on('close', finish);
}

main().catch((err) => {
  console.error(`\n  ${err.message}\n`);
  process.exit(1);
});
