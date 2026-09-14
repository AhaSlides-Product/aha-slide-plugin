import { DEFAULT_CHANNEL, DEFAULT_WINDOW_NAME, DONE_MESSAGE } from './constants.js';
import { resolveLoginUrl } from './url.js';
import type { SignInOptions, SignInOutcome, SignInStatus } from './types.js';

interface ActiveFlow {
  promise: Promise<SignInOutcome>;
  popup: Window | null;
  settle: (status: SignInStatus) => void;
  focus: () => void;
}

let active: ActiveFlow | null = null;

/** `closed` is readable here because nothing in this flow sets COOP. Under a
 *  `Cross-Origin-Opener-Policy: same-origin` opener the handle is severed and
 *  the read throws — treat that as "still open" and let the ping or the
 *  timeout decide, rather than reporting a close that may not have happened. */
function isClosed(popup: Window | null): boolean {
  if (!popup) return true;
  try {
    return popup.closed;
  } catch {
    return false;
  }
}

function openPopup(url: string, name: string, width: number, height: number): Window | null {
  let features = `popup=yes,width=${width},height=${height},scrollbars=yes,resizable=yes`;
  try {
    const dualLeft = window.screenLeft ?? window.screenX ?? 0;
    const dualTop = window.screenTop ?? window.screenY ?? 0;
    const outerW = window.innerWidth || document.documentElement?.clientWidth || width;
    const outerH = window.innerHeight || document.documentElement?.clientHeight || height;
    const left = Math.max(0, Math.round(dualLeft + (outerW - width) / 2));
    const top = Math.max(0, Math.round(dualTop + (outerH - height) / 2));
    features += `,left=${left},top=${top}`;
  } catch {
    // Centering is cosmetic; never let it stop the window opening.
  }
  try {
    // Deliberately NOT `noopener`: it would sever the handle we use to tell an
    // abandoned popup from an open one. The popup only ever navigates to our
    // own login origin, so the opener reference is not handed to a third party.
    return window.open(url, name, features);
  } catch {
    return null;
  }
}

/**
 * Open the platform login in a popup and resolve once identity has been
 * re-checked.
 *
 * Must be called SYNCHRONOUSLY from the click handler — an `await` before this
 * line loses the user gesture and the popup blocker eats the window.
 *
 * The flow listens on two independent signals. A BroadcastChannel ping from the
 * callback page is the fast path and works even while the opener already has
 * focus. `focus`/`visibilitychange` on the opener is the universal fallback:
 * closing a popup returns focus to whoever opened it, and that IS an event — no
 * polling of `popup.closed` anywhere.
 *
 * @example
 * ```ts
 * const login = new URL('/pages/login', PRESENTER_APP_URL);
 * login.searchParams.set('redirect', resolveSameOrigin('/auth-popup.html'));
 * const { status } = await signIn({
 *   url: login.toString(),
 *   onDone: async () => (await refetchIdentity()).ok,
 *   onBlocked: () => location.assign(fullPageLoginUrl),
 * });
 * ```
 */
export function signIn(options: SignInOptions): Promise<SignInOutcome> {
  const {
    url,
    onDone,
    onBlocked,
    channelName = DEFAULT_CHANNEL,
    windowName = DEFAULT_WINDOW_NAME,
    width = 480,
    height = 680,
    maxChecks = 5,
    retryDelayMs = 400,
    timeoutMs = 10 * 60 * 1000,
  } = options;

  // Resolve before touching anything: a bad url must throw at the call site,
  // not leave a half-open flow behind.
  const target = resolveLoginUrl(url);

  // Re-entrant click while a popup is already up: focus it and hand back the
  // SAME promise, so callers cannot end up with two flows racing one identity.
  if (active && !isClosed(active.popup)) {
    active.focus();
    return active.promise;
  }

  const popup = openPopup(target, windowName, width, height);
  if (!popup) {
    if (onBlocked) onBlocked(target);
    else globalThis.location?.assign(target);
    return Promise.resolve({ status: 'blocked' });
  }

  let settled = false;
  let checking = false;
  let checks = 0;
  let channel: BroadcastChannel | null = null;
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  // Assigned synchronously by the executor below, read only afterwards.
  let settleFlow!: (status: SignInStatus) => void;
  let focusPopup!: () => void;

  const promise = new Promise<SignInOutcome>((resolve) => {
    const cleanup = () => {
      if (timeoutTimer !== undefined) clearTimeout(timeoutTimer);
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      try {
        channel?.close();
      } catch {
        // already gone
      }
      globalThis.removeEventListener?.('focus', onWeakSignal);
      globalThis.document?.removeEventListener?.('visibilitychange', onVisibilityChange);
    };

    const settle = (status: SignInStatus) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (active?.promise === promise) active = null;
      resolve({ status });
    };

    /** One identity re-check. Never throws; a failing check is just "not yet". */
    const check = async (): Promise<boolean> => {
      if (settled || checking) return false;
      checking = true;
      try {
        return (await onDone()) === true;
      } catch {
        return false;
      } finally {
        checking = false;
      }
    };

    /**
     * The popup said it finished. Believe it enough to retry: the session is
     * already in the cookie jar, so a `false` here means a slow or flaky
     * identity endpoint, not a user who failed to log in.
     */
    const onStrongSignal = () => {
      if (settled) return;
      void check().then((ok) => {
        if (settled) return;
        if (ok) {
          settle('authenticated');
          return;
        }
        checks += 1;
        if (checks >= maxChecks) {
          settle('unresolved');
          return;
        }
        retryTimer = setTimeout(onStrongSignal, retryDelayMs);
      });
    };

    /**
     * Focus came back to us. That happens both when the popup closes and when
     * the user simply clicks the parent window, so it is only conclusive
     * alongside a closed popup — otherwise we re-check and keep waiting.
     */
    function onWeakSignal(): void {
      if (settled) return;
      void check().then((ok) => {
        if (settled) return;
        if (ok) settle('authenticated');
        else if (isClosed(popup)) settle('abandoned');
      });
    }

    function onVisibilityChange(): void {
      if (globalThis.document?.visibilityState === 'visible') onWeakSignal();
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(channelName);
        channel.onmessage = (event: MessageEvent) => {
          if ((event.data as { type?: string } | null)?.type === DONE_MESSAGE) onStrongSignal();
        };
      }
    } catch {
      // No channel: the focus fallback below is the whole mechanism, which is
      // why it is not optional.
    }

    globalThis.addEventListener?.('focus', onWeakSignal);
    globalThis.document?.addEventListener?.('visibilitychange', onVisibilityChange);
    timeoutTimer = setTimeout(() => settle('timeout'), timeoutMs);

    settleFlow = settle;
    focusPopup = () => {
      try {
        popup.focus();
      } catch {
        // Focus is a courtesy; the flow is unaffected.
      }
    };
  });

  // Registered AFTER construction: the executor runs synchronously inside the
  // Promise constructor, where `promise` is still in its temporal dead zone.
  active = { promise, popup, settle: settleFlow, focus: focusPopup };

  return promise;
}

/**
 * Abandon the in-flight flow, if any, resolving its promise as `'cancelled'`.
 * Intended for opener teardown (a React unmount) so listeners and timers do not
 * outlive the component that started them. The popup window is left alone —
 * the user may still be typing in it.
 */
export function cancelSignIn(): void {
  active?.settle('cancelled');
  active = null;
}
