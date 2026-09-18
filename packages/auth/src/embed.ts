import {
  AUTH_EMBED_EVENT,
  AUTH_EMBED_SOURCE,
  EMBED_LOGIN_PATH,
  EMBED_REDIRECT_URI_PARAM,
  EMBED_SIGNUP_PATH,
} from './constants.js';
import type { AuthEmbedMessage, AuthEmbedUrlOptions, AuthEmbedUser } from './types.js';

const EVENT_VALUES = new Set<string>(Object.values(AUTH_EMBED_EVENT));

/**
 * Parse and vet the auth app's base URL.
 *
 * `http(s)` only, and that is a security control rather than tidiness: the
 * result becomes an iframe `src`, so a `javascript:` base out of a mis-read
 * config would execute in the HOST document, not in a sandboxed frame. `new
 * URL('javascript:…')` parses happily and reports an origin of `"null"`, so
 * nothing downstream would catch it either.
 */
function requireHttpUrl(base: string): URL {
  if (typeof base !== 'string' || !base.trim()) {
    throw new Error('@aha/auth: an auth app base url is required');
  }
  let url: URL;
  try {
    url = new URL(base.trim());
  } catch {
    throw new Error(`@aha/auth: ${JSON.stringify(base)} is not a valid absolute url`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`@aha/auth: refusing ${url.protocol} auth app url`);
  }
  return url;
}

/**
 * Vet a `redirectUri` before it goes on the query string.
 *
 * Separate from {@link requireHttpUrl} because the two are rejected for
 * different reasons and the error has to say which one the caller got wrong.
 * This one is never framed — it is a destination the auth app's popup will
 * navigate to — so the risk is not script execution here but a value the auth
 * app silently discards: it re-validates with `safeExternalRedirect` and treats
 * anything it rejects as ABSENT, which drops the caller back into the ordinary
 * password flow with no error raised anywhere. Failing loudly at the call site
 * is the difference between a typo and a mode switch that mysteriously did
 * nothing.
 */
function requireRedirectUri(raw: string): string {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('@aha/auth: redirectUri must not be empty');
  }
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error(`@aha/auth: redirectUri ${JSON.stringify(raw)} is not an absolute url`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`@aha/auth: refusing ${url.protocol} redirectUri`);
  }
  return url.toString();
}

/**
 * The origin of the framed auth app — the ONLY origin whose messages count, and
 * the value `event.origin` is compared against.
 */
export function authEmbedOrigin(base: string): string {
  return requireHttpUrl(base).origin;
}

/**
 * URL of the framed login (or signup) form.
 *
 * The path is absolute, so a base carrying a path of its own contributes only
 * its origin — the auth app is always mounted at `/authen/*` on whatever host
 * serves it.
 */
export function authEmbedUrl(base: string, options: AuthEmbedUrlOptions = {}): string {
  const { signup = false, hostOrigin, dim, closable, redirectUri, query } = options;
  const url = new URL(signup ? EMBED_SIGNUP_PATH : EMBED_LOGIN_PATH, requireHttpUrl(base));

  const origin = hostOrigin ?? globalThis.location?.origin;
  if (origin) url.searchParams.set('origin', origin);
  // Only the non-defaults are sent, so a URL stays readable in a network log.
  if (dim === false) url.searchParams.set('dim', '0');
  if (closable === false) url.searchParams.set('closable', '0');
  // Checked here as well as on the far side: the auth app treats a redirect it
  // rejects as absent, which drops the caller back into the ordinary password
  // flow with no error anywhere. A typo would read as "the mode switch did
  // nothing", which is the hardest kind of bug to find.
  if (redirectUri !== undefined) {
    url.searchParams.set(EMBED_REDIRECT_URI_PARAM, requireRedirectUri(redirectUri));
  }
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);

  return url.toString();
}

/** Copy only the fields the contract names. A future field on the sender's side
 *  cannot then ride along into a host that was not expecting it. */
function readUser(raw: unknown): AuthEmbedUser | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const { id, email, firstName, lastName, avatar } = raw as AuthEmbedUser;
  return { id, email, firstName, lastName, avatar };
}

/**
 * Validate one `message` event and return what it carries, or `null` for
 * anything else — a different origin, another app's message, an unknown type.
 *
 * ORIGIN IS CHECKED FIRST, before the payload is inspected at all. Any page can
 * post a perfectly-shaped `success`; acting on one would hand a foreign origin
 * whatever the host does on sign-in.
 */
export function readAuthEmbedMessage(
  event: Pick<MessageEvent, 'origin' | 'data'>,
  expectedOrigin: string,
): AuthEmbedMessage | null {
  if (!expectedOrigin || event.origin !== expectedOrigin) return null;

  const data = event.data as {
    source?: unknown;
    type?: unknown;
    user?: unknown;
    granted?: unknown;
  } | null;
  if (!data || typeof data !== 'object') return null;
  if (data.source !== AUTH_EMBED_SOURCE) return null;
  if (typeof data.type !== 'string' || !EVENT_VALUES.has(data.type)) return null;

  const message: AuthEmbedMessage = { type: data.type as AuthEmbedMessage['type'] };
  if (message.type === AUTH_EMBED_EVENT.success) {
    const user = readUser(data.user);
    if (user) message.user = user;
  }
  // A consent that does not actually carry a decision is dropped rather than
  // defaulted: `granted` IS the user's answer, and guessing it either invents a
  // refusal nobody made or authorises on their behalf.
  if (message.type === AUTH_EMBED_EVENT.consent) {
    if (typeof data.granted !== 'boolean') return null;
    message.granted = data.granted;
  }
  return message;
}
