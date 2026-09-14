function currentOrigin(): string {
  const origin = globalThis.location?.origin;
  if (!origin) {
    throw new Error('@aha/auth: no window.location — this module is browser-only.');
  }
  return origin;
}

/**
 * Resolve a same-origin path, refusing anything that could leave this origin.
 *
 * This is the invariant the whole design rests on: the popup must terminate on
 * the origin that opened it, because that is the only origin whose cookie the
 * opener can see and the only one a same-origin BroadcastChannel reaches. An
 * app served from two hosts (Livelify serves the same auth routes from both
 * `live-deck.` and `livelify.`) gets that for free from a path, and gets it
 * WRONG from a hardcoded absolute URL — the popup would set a host-only cookie
 * on the other host and the opener would wait forever.
 *
 * @param path Root-relative path, e.g. `/auth-popup.html`.
 * @throws If `path` is not rooted, is protocol-relative, or escapes the origin.
 */
export function resolveSameOrigin(path: string): string {
  if (typeof path !== 'string' || path[0] !== '/') {
    throw new Error(`@aha/auth: expected a rooted path, got ${JSON.stringify(path)}`);
  }
  // `//host` is protocol-relative and `/\host` is treated as an authority by
  // several parsers — both leave this origin while looking rooted.
  if (path[1] === '/' || path[1] === '\\') {
    throw new Error(`@aha/auth: refusing protocol-relative path ${JSON.stringify(path)}`);
  }
  const url = new URL(path, currentOrigin());
  if (url.origin !== currentOrigin()) {
    throw new Error(`@aha/auth: ${JSON.stringify(path)} resolves off-origin`);
  }
  return url.toString();
}

/**
 * Resolve the URL the popup opens at. Unlike the callback this MAY be
 * cross-origin — the platform login page lives on the presenter app — but it is
 * still restricted to `http(s)` so a bad config cannot turn into
 * `javascript:` execution in a window we opened.
 */
export function resolveLoginUrl(url: string): string {
  if (typeof url !== 'string' || !url.trim()) {
    throw new Error('@aha/auth: a login url is required');
  }
  const value = url.trim();
  if (value[0] === '/') return resolveSameOrigin(value);

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`@aha/auth: ${JSON.stringify(value)} is not a valid url or rooted path`);
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`@aha/auth: refusing ${parsed.protocol} login url`);
  }
  return parsed.toString();
}
