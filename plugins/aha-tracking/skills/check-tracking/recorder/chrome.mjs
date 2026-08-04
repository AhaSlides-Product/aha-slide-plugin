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
