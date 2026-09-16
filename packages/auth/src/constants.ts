/**
 * Marker every message from the embedded auth pages carries. A host window
 * receives unrelated traffic all day — extensions, zoid, devtools — and this is
 * what lets a listener drop it before `type` is even looked at.
 */
export const AUTH_EMBED_SOURCE = 'ahaslides-auth';

/** The three things an embedded auth page ever says to its host. */
export const AUTH_EMBED_EVENT = {
  /** Sent once on mount: the form is up and the host can reveal the frame. */
  ready: 'ahaslides:auth:ready',
  /** Login or signup succeeded; the session cookie is already set. */
  success: 'ahaslides:auth:success',
  /** The user dismissed the form (✕ or backdrop); the host should unmount it. */
  close: 'ahaslides:auth:close',
} as const;

/** Path of the framed login form on the auth app. */
export const EMBED_LOGIN_PATH = '/authen/embed/login';

/** Path of the framed signup form on the auth app. */
export const EMBED_SIGNUP_PATH = '/authen/embed/signup';

/**
 * Non-httpOnly cookies the platform sets alongside the session. Their PRESENCE
 * is the only thing read — never their value, which is why this stays true to
 * the package's "never touches a credential" rule. `ahaLoggedIn` is the modern
 * companion (AHA-40764 hardened `ahaToken` to httpOnly); a readable `ahaToken`
 * can only be a pre-hardening leftover and is accepted as a legacy signal.
 */
export const SESSION_MARKER_COOKIES = ['ahaLoggedIn', 'ahaToken'] as const;
