import type { AUTH_EMBED_EVENT } from './constants.js';

/** One of the embed events. */
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
  /** Present on `consent` only: how the OAuth consent card was answered. */
  granted?: boolean;
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
  /**
   * Where the auth app should take the session once it has one — typically
   * general-api's `/api/auth/oauth/authorize`, which lands on the consent card.
   *
   * This is a MODE SWITCH, not just a destination. Passing one makes the embed
   * collect an email address and nothing else, and do the real sign-in in a
   * popup on the auth origin, because the point of a redirect is that the
   * session has somewhere to go afterwards and only a first-party window can
   * take it there. The frame then relays a `consent` event once the card is
   * answered. See {@link FrameSignInOptions.awaitConsent}.
   *
   * Must be an absolute `http(s)` URL. The auth app validates it again and
   * treats anything it rejects as absent — which would silently drop you back
   * into the ordinary password flow — so it is rejected here at the call site
   * instead.
   */
  redirectUri?: string;
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
  /**
   * The OAuth consent card was answered. Fires only in a {@link
   * AuthEmbedUrlOptions.redirectUri} flow, and always after `onSuccess`.
   *
   * `granted === true` does NOT mean the flow is complete: it means the user
   * pressed Allow and the popup is about to navigate to the redirect URI. The
   * authorization code lands at YOUR callback, and that callback is also what
   * closes the popup. `granted === false` is genuinely terminal.
   */
  onConsent?: (granted: boolean) => void;
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
  | 'cancelled'
  /**
   * Consent flow only. The user signed in and pressed Allow; the popup is on
   * its way to your redirect URI. Wait for your own callback — this is not yet
   * a code in hand.
   */
  | 'consent_granted'
  /** Consent flow only. The user signed in and refused the client. Terminal. */
  | 'consent_denied'
  /**
   * Consent flow only. Sign-in happened but the card was never answered within
   * `consentTimeoutMs` — the popup was closed or the user walked away. NOT a
   * fault and not a reason to send them to a full-page login: they are signed
   * in, so offer the authorisation again.
   */
  | 'consent_abandoned';

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
   *
   * NOT CALLED AT ALL in a consent flow — see {@link awaitConsent} for why the
   * question has no honest answer there.
   */
  onDone: () => boolean | Promise<boolean>;

  /**
   * Hold the flow open after `success` and let the `consent` event decide it.
   * Defaults to `true` whenever {@link AuthEmbedUrlOptions.redirectUri} is set.
   *
   * In this mode `success` means "the user now has a platform session", not
   * "the flow is over" — the popup still has to reach the authorize endpoint,
   * the consent card and finally your redirect URI. Two things follow, and both
   * are the point of the flag:
   *
   * - `onDone()` is never called and the session-marker watch is disabled.
   *   Both answer "does the HOST have a session yet", and the honest answer is
   *   "not until my own callback exchanges the code". Cross-site the host
   *   cannot see the cookie at all; same-site it CAN, which is worse — it would
   *   confirm, settle the flow, and tear the frame down mid-consent.
   * - The frame must stay mounted until `consent` arrives. The popup relays
   *   through `window.opener`, which IS the frame; unmounting it early drops
   *   the user's answer on the floor.
   *
   * Set `false` to keep the ordinary `authenticated`/`unresolved` semantics
   * with a `redirectUri` — correct when the target is not an authorize endpoint
   * and so will never produce a consent card.
   */
  awaitConsent?: boolean;

  /**
   * How long to wait for `consent` after `success`, in ms. Default 5 minutes,
   * matching the auth app's own popup budget (`POPUP_TIMEOUT_MS`).
   *
   * This is a host-side deadline by necessity: the bridge has no abandon or
   * timeout event, so a user who closes the popup or walks away from the card
   * produces no message at all. Without it such a flow would hang to
   * `timeoutMs`. Expiring settles `'consent_abandoned'`.
   */
  consentTimeoutMs?: number;

  /**
   * Watch the platform's session-marker cookie as a second completion signal,
   * for hosts the auth app will not postMessage (see `hostOrigin`). `true` uses
   * the built-in cookie read; pass your own predicate to override it; `false`
   * disables the watch. Default `true`, and forced off in a consent flow.
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
