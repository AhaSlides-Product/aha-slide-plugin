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
    const stamp = new Date(record.t).toISOString().slice(11, 19);
    console.log(`  ${stamp}  ${record.via}  ${record.url}`);
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
