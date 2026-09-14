/** How a sign-in flow ended. */
export type SignInStatus =
  /** `onDone()` reported a live session. The only success. */
  | 'authenticated'
  /** The popup closed without ever producing a session — the user gave up. */
  | 'abandoned'
  /** `window.open` returned nothing: a popup blocker. `onBlocked` has run. */
  | 'blocked'
  /** Completion was signalled but `onDone()` never reported a session. A real fault. */
  | 'unresolved'
  /** Nothing happened within `timeoutMs`. */
  | 'timeout'
  /** `cancelSignIn()` was called (e.g. the opener unmounted). */
  | 'cancelled';

export interface SignInOutcome {
  status: SignInStatus;
}

export interface SignInOptions {
  /**
   * Where the popup starts. A path (`/auth/login?next=/`) is resolved against
   * `location.origin`; an absolute `http(s)` URL is allowed for apps whose login
   * page lives on another origin (e.g. the presenter app's `/pages/login`).
   * Everything else — `javascript:`, `data:`, protocol-relative `//host` — throws.
   */
  url: string;

  /**
   * Re-check identity and report whether a session now exists. Called on every
   * completion signal, so it MUST be idempotent and MUST NOT assume success —
   * a user who closes the popup without logging in is handled by this same path.
   */
  onDone: () => boolean | Promise<boolean>;

  /**
   * Called instead of opening a popup when the browser blocked it. Supply the
   * classic full-page redirect here. Defaults to `location.assign(url)`, which
   * is only correct if `url` is a sensible full-page destination — usually it
   * is not, because the popup URL points at a callback page that closes itself.
   */
  onBlocked?: (url: string) => void;

  /** BroadcastChannel name. Must match the popup side. Default `'aha-auth'`. */
  channelName?: string;

  /** `window.open` target name. Default `'aha-auth'`. */
  windowName?: string;

  /** Popup size in CSS pixels. Defaults 480 x 680. */
  width?: number;
  height?: number;

  /**
   * How many times to re-check after a completion ping before giving up with
   * `'unresolved'`. Retries absorb a slow identity endpoint. Default 5.
   */
  maxChecks?: number;

  /** Delay between those retries, in ms. Default 400. */
  retryDelayMs?: number;

  /** Abandon the flow entirely after this long. Default 10 minutes. */
  timeoutMs?: number;
}

export interface NotifyOptions {
  /** BroadcastChannel name. Must match the opener. Default `'aha-auth'`. */
  channelName?: string;
  /** Close the window after signalling. Default `true`. */
  close?: boolean;
}

export interface CallbackPageOptions {
  /** BroadcastChannel name. Must match the opener. Default `'aha-auth'`. */
  channelName?: string;
  /** `<title>` of the generated page. */
  title?: string;
  /** Text shown while the window is closing. */
  pendingText?: string;
  /**
   * Text shown when the window is still open half a second later — which means
   * there was no opener to return to, so nothing is going to close it.
   */
  settledText?: string;
  /** `lang` attribute of the generated page. Default `'en'`. */
  lang?: string;
}
