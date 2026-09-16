import { AUTH_EMBED_EVENT } from './constants.js';
import { authEmbedOrigin, authEmbedUrl, readAuthEmbedMessage } from './embed.js';
import type { SignInFrameOptions, SignInFrameSession } from './types.js';

/**
 * Subscribe to one framed auth page and hand back the URL to render.
 *
 * The low-level half of the frame flow: it owns the protocol (which origin may
 * speak, which messages mean what) and nothing else. It creates no element,
 * decides no policy, and holds no notion of success — `signInWithFrame()` is
 * the promise-shaped flow built on top, and most callers want that instead.
 *
 * Reach for this one when the host needs the events raw: a Vue app driving its
 * own transitions, a page that reveals the frame only on `ready`, a test
 * harness.
 *
 * @example
 * ```ts
 * const session = createSignInFrame({
 *   baseUrl: 'https://presenter.ahaslides.com',
 *   onReady: () => (iframe.style.opacity = '1'),
 *   onSuccess: () => refetchIdentity(),
 *   onClose: () => unmount(),
 * });
 * iframe.src = session.src;
 * // later
 * session.dispose();
 * ```
 */
export function createSignInFrame(options: SignInFrameOptions): SignInFrameSession {
  const { baseUrl, onReady, onSuccess, onClose, ...urlOptions } = options;

  // Both throw on a non-http(s) base, before any listener is attached — a bad
  // config must fail at the call site, not leave a subscription behind.
  const origin = authEmbedOrigin(baseUrl);
  const src = authEmbedUrl(baseUrl, urlOptions);

  let disposed = false;

  function onMessage(event: MessageEvent): void {
    const message = readAuthEmbedMessage(event, origin);
    if (!message || disposed) return;
    switch (message.type) {
      case AUTH_EMBED_EVENT.ready:
        onReady?.();
        return;
      case AUTH_EMBED_EVENT.close:
        onClose?.();
        return;
      default:
        onSuccess?.(message.user);
    }
  }

  globalThis.addEventListener?.('message', onMessage);

  return {
    src,
    origin,
    dispose(): void {
      if (disposed) return;
      disposed = true;
      globalThis.removeEventListener?.('message', onMessage);
    },
  };
}
