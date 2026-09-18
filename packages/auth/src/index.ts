/**
 * Embedded sign-in for AhaSlides apps that delegate login to the platform but
 * do not want a full-page redirect.
 *
 * The platform's auth app (`aha-auth`) serves its login and signup forms at
 * `/authen/embed/*` built to be framed: they never navigate on success, they
 * postMessage the outcome to the host and let it take its own overlay down.
 * This package is the HOST half of that conversation — `signInWithFrame()` for
 * a whole flow, `createSignInFrame()` for the raw events.
 *
 * A host that needs an OAuth authorization code rather than just a session
 * passes `redirectUri`. That switches the embed into a popup-backed mode and
 * adds a second outcome — the consent card's answer — which is why `success`
 * stops being terminal there. See `awaitConsent` on `FrameSignInOptions`.
 *
 * It is a SIGNAL ORCHESTRATOR, not an auth library. It renders nothing, styles
 * nothing, and never sees a password or a token: the session arrives as a
 * cookie the frame sets, which is first-party to the host because the frame is
 * same-site. The only thing it reads of that cookie is whether one exists.
 *
 * WHY A FRAME AND NOT A POPUP (which is what v0.1 did): a popup needed a
 * closer page on the host's own origin, a BroadcastChannel to reach it, a
 * synchronous call to keep the user gesture, and a blocked-popup fallback. A
 * frame needs none of them, and gives the user a way back — its ✕ posts
 * `close`, where a popup could only be abandoned.
 *
 * The host must be an AhaSlides sub-domain, or the cookie the form sets is
 * dropped as third-party and nothing works. That is a property of the platform,
 * not a limitation here.
 *
 * Proven in aha-elearning's learner sign-in gate before being extracted here.
 */
export { signInWithFrame, cancelFrameSignIn } from './signInWithFrame.js';
export { createSignInFrame } from './frameSession.js';
export { authEmbedUrl, authEmbedOrigin, readAuthEmbedMessage } from './embed.js';
export { watchSessionSignal, hasSessionMarker } from './sessionSignal.js';
export {
  AUTH_EMBED_SOURCE,
  AUTH_EMBED_EVENT,
  EMBED_LOGIN_PATH,
  EMBED_SIGNUP_PATH,
  EMBED_REDIRECT_URI_PARAM,
  SESSION_MARKER_COOKIES,
} from './constants.js';
export type {
  FrameSignInOptions,
  SignInFrameOptions,
  SignInFrameSession,
  SignInOutcome,
  SignInStatus,
  AuthEmbedEvent,
  AuthEmbedMessage,
  AuthEmbedUser,
  AuthEmbedUrlOptions,
  WatchSessionOptions,
} from './types.js';
