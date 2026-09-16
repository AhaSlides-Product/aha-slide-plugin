import type { AUTH_EMBED_EVENT } from './constants.js';

/** One of the three embed events. */
export type AuthEmbedEvent = (typeof AUTH_EMBED_EVENT)[keyof typeof AUTH_EMBED_EVENT];

/**
 * The user object a `success` message carries.
 *
 * ADVISORY ONLY. It arrives over postMessage from a frame we do not control the
 * contents of, and nothing about it is verified here — the session itself lives
 * in a cookie, and `onDone()` asking the server is what decides whether anyone
 * is signed in. Use it to prefill a greeting, never to authorise anything.
 */
export interface AuthEmbedUser {
  id?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

/** A validated message from the framed auth page. */
export interface AuthEmbedMessage {
  type: AuthEmbedEvent;
  /** Present on `success` only, and only when the page sent one. */
  user?: AuthEmbedUser;
}

export interface AuthEmbedUrlOptions {
  /** Frame the signup form instead of the login form. Default `false`. */
  signup?: boolean;
  /**
   * The origin the auth page should address its replies to. Defaults to
   * `location.origin`. It is checked against the auth app's own allowlist, so
   * this is a convenience and never a trust decision — and an origin carrying a
   * PORT is rejected by every non-local build of that app, which is why a local
   * dev server hears nothing back (see `watchSessionSignal`).
   */
  hostOrigin?: string;
  /** `false` sends `dim=0`: the host is already dimming behind the frame. */
  dim?: boolean;
  /** `false` sends `closable=0`: the host draws its own dismiss control. */
  closable?: boolean;
  /** Extra query params carried through (`redirect`, `refby`, …). */
  query?: Record<string, string>;
}

export interface SignInFrameOptions extends AuthEmbedUrlOptions {
  /**
   * Origin serving the auth app, e.g. `https://presenter.ahaslides.com`. Must
   * be `http(s)` — it becomes an iframe `src`, which is executable surface.
   */
  baseUrl: string;
  /** The form painted and the host may reveal the frame. */
  onReady?: () => void;
  /** Login or signup succeeded. The `user` is advisory — see {@link AuthEmbedUser}. */
  onSuccess?: (user?: AuthEmbedUser) => void;
  /** The user dismissed the form. */
  onClose?: () => void;
}

export interface SignInFrameSession {
  /** Put this in your `<iframe src>`. */
  readonly src: string;
  /** The origin messages are accepted from — exposed for logging/tests. */
  readonly origin: string;
  /** Detach the message listener. Safe to call twice. */
  dispose(): void;
}

/** How a sign-in flow ended. */
export type SignInStatus =
  /** `onDone()` reported a live session. The only success. */
  | 'authenticated'
  /** The user dismissed the form without signing in. */
  | 'abandoned'
  /** Success was signalled but `onDone()` never reported a session. A real fault. */
  | 'unresolved'
  /** Nothing happened within `timeoutMs`. */
  | 'timeout'
  /** `cancelFrameSignIn()` was called (e.g. the host unmounted). */
  | 'cancelled';

export interface SignInOutcome {
  status: SignInStatus;
}

export interface FrameSignInOptions extends SignInFrameOptions {
  /**
   * Render the frame. Called synchronously with the URL to load; return a
   * teardown and it runs exactly once, before the promise resolves.
   *
   * This callback is what keeps the package DOM-free: it never creates an
   * element, sizes one, or decides what a loading state looks like.
   */
  mount: (src: string) => (() => void) | void;

  /**
   * Re-check identity and report whether a session now exists. Called on every
   * completion signal, so it MUST be idempotent and MUST NOT assume success.
   */
  onDone: () => boolean | Promise<boolean>;

  /**
   * Watch the platform's session-marker cookie as a second completion signal,
   * for hosts the auth app will not postMessage (see `hostOrigin`). `true` uses
   * the built-in cookie read; pass your own predicate to override it; `false`
   * disables the watch. Default `true`.
   */
  watchSession?: boolean | (() => boolean);

  /** Cadence of that watch, in ms. Default 1000. */
  sessionPollMs?: number;

  /**
   * How many times to re-check after a `success` before giving up with
   * `'unresolved'`. Retries absorb a slow identity endpoint. Default 5.
   */
  maxChecks?: number;

  /** Delay between those retries, in ms. Default 400. */
  retryDelayMs?: number;

  /** Abandon the flow entirely after this long. Default 10 minutes. */
  timeoutMs?: number;
}

export interface WatchSessionOptions {
  /** Runs once, when the marker appears. The watch stops itself first. */
  onAppear: () => void;
  /** Poll cadence in ms. Default 1000. */
  intervalMs?: number;
  /** Override the signal read. Defaults to the marker-cookie check. */
  read?: () => boolean;
}
