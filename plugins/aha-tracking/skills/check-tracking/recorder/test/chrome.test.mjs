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
