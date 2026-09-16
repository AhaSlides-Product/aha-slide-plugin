import { SESSION_MARKER_COOKIES } from './constants.js';
import type { WatchSessionOptions } from './types.js';

/**
 * Whether a platform session marker is present in this document's cookie jar.
 *
 * PRESENCE ONLY — no value is read, nothing is parsed, and nothing is returned
 * but a boolean, so this stays inside the package's rule of never handling a
 * credential. It also cannot prove a session: the marker outlives an expired
 * one, so a `true` means "ask the server", never "signed in".
 */
export function hasSessionMarker(): boolean {
  let jar: string;
  try {
    jar = globalThis.document?.cookie ?? '';
  } catch {
    // Some embedded contexts throw on cookie access.
    return false;
  }
  if (!jar) return false;
  return jar
    .split('; ')
    .some((entry) => SESSION_MARKER_COOKIES.some((name) => entry.startsWith(`${name}=`)));
}

/**
 * Call `onAppear` once, when the session marker APPEARS.
 *
 * This exists because the auth app will not postMessage an origin it cannot
 * vouch for — notably any origin carrying a port, which is every local dev
 * server. There the framed form renders, logs the user in and says nothing at
 * all; the cookie it sets is shared (the frame is same-site) and is then the
 * only signal a host has.
 *
 * Only a false→true transition fires. The marker is already there for the
 * expired-session user — the one most likely to be staring at a login form — so
 * an absolute read would fire immediately and forever. A true→false transition
 * is a logout elsewhere and is deliberately not our business.
 *
 * Best-effort by construction: a host must work identically when this never
 * fires, which is exactly the deployed case.
 *
 * @returns Stop the watch. Safe to call after it has fired.
 */
export function watchSessionSignal(options: WatchSessionOptions): () => void {
  const { onAppear, intervalMs = 1000, read = hasSessionMarker } = options;

  let stopped = false;
  const before = read();

  const timer = setInterval(() => {
    if (stopped) return;
    // `before` true means we can never see an appearance; the interval keeps
    // running (harmlessly, until stopped) rather than pretending otherwise.
    if (before || !read()) return;
    stop();
    onAppear();
  }, intervalMs);

  function stop(): void {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
  }

  return stop;
}
