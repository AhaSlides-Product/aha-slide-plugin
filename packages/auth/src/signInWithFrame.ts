import { createSignInFrame } from './frameSession.js';
import { watchSessionSignal } from './sessionSignal.js';
import type { FrameSignInOptions, SignInOutcome, SignInStatus } from './types.js';

/** What one identity re-check learned. `busy` is "ask again", not "no". */
type CheckResult = 'confirmed' | 'negative' | 'busy';

interface ActiveFlow {
  promise: Promise<SignInOutcome>;
  settle: (status: SignInStatus) => void;
}

let active: ActiveFlow | null = null;

/**
 * Frame the platform login and resolve once identity has been re-checked.
 *
 * The iframe is the host's to draw: `mount()` receives the URL and returns a
 * teardown, so this package stays free of DOM, CSS and framework. What it owns
 * is the part every host would otherwise re-implement — which origin may speak,
 * what each message means, the retry ladder after a success, and tearing the
 * whole thing down exactly once however the flow ends.
 *
 * Three ways in, in order of authority:
 *
 * `success` from the frame is the strong signal. The session cookie is already
 * set when it arrives (the frame is same-site, so what the form sets is
 * first-party to the host too) — nothing is transferred by the message itself,
 * which is why a `false` from `onDone()` here means a slow identity endpoint
 * rather than a failed login, and is worth asking again.
 *
 * The session-marker watch is the weak signal, for hosts the auth app refuses
 * to address (a dev server on a port). One check, no ladder: it is a guess that
 * something happened, so a negative simply leaves the form up.
 *
 * `close` is the user's answer. It settles `'abandoned'` unless a success
 * sequence is already running, which owns the outcome.
 *
 * @example
 * ```ts
 * const { status } = await signInWithFrame({
 *   baseUrl: PRESENTER_APP_URL,
 *   mount: (src) => renderOverlay(src),          // returns a teardown
 *   onDone: async () => (await refetchIdentity()).ok,
 * });
 * if (status === 'unresolved') location.assign(fullPageLoginUrl);
 * ```
 *
 * @throws If `baseUrl` is not an `http(s)` url, or `mount()` throws — both at
 * the call site, with nothing left subscribed.
 */
export function signInWithFrame(options: FrameSignInOptions): Promise<SignInOutcome> {
  const {
    mount,
    onDone,
    onReady,
    onSuccess,
    onClose,
    watchSession = true,
    sessionPollMs = 1000,
    maxChecks = 5,
    retryDelayMs = 400,
    timeoutMs = 10 * 60 * 1000,
    ...frameOptions
  } = options;

  // A flow is already up: hand back the SAME promise rather than framing a
  // second login over the first and racing two checks against one identity.
  if (active) return active.promise;

  // Subscribed BEFORE the promise exists, so a bad `baseUrl` throws at the call
  // site rather than leaving a flow that can never settle. The two callbacks
  // are wired through `handlers`, which the executor fills in below.
  const handlers: { success?: () => void; close?: () => void; marker?: () => void } = {};
  const session = createSignInFrame({
    ...frameOptions,
    onReady,
    onSuccess: (user) => {
      onSuccess?.(user);
      handlers.success?.();
    },
    onClose: () => {
      onClose?.();
      handlers.close?.();
    },
  });

  let settled = false;
  let checking = false;
  let checks = 0;
  let successSeen = false;
  let unwatch: (() => void) | undefined;
  let unmount: (() => void) | void;
  let unmounted = false;
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  // Assigned synchronously by the executor below, read only afterwards.
  let settleFlow!: (status: SignInStatus) => void;

  /**
   * Run the host's teardown, exactly once, and never before it exists.
   *
   * The `!unmount` guard is load-bearing rather than defensive: a host whose
   * `mount()` tears itself down synchronously (a component unmounting mid-call)
   * settles the flow BEFORE `mount` has returned the teardown, so this runs
   * once with nothing to call and once more from the tail below. Marking it
   * done on the empty first pass would strand the frame on screen forever.
   */
  const runUnmount = () => {
    if (unmounted || !unmount) return;
    unmounted = true;
    try {
      unmount();
    } catch {
      // A host teardown that throws must not strand the promise.
    }
  };

  const promise = new Promise<SignInOutcome>((resolve) => {
    const settle = (status: SignInStatus) => {
      if (settled) return;
      settled = true;
      if (timeoutTimer !== undefined) clearTimeout(timeoutTimer);
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      unwatch?.();
      session.dispose();
      runUnmount();
      if (active?.promise === promise) active = null;
      resolve({ status });
    };
    // Published before anything below runs: an executor that throws half-way
    // must still leave a flow that can be settled and a slot that can be freed.
    settleFlow = settle;

    /**
     * One identity re-check. Never throws.
     *
     * Three outcomes, not two: "a check is already running" is NOT the same
     * answer as "there is no session", and collapsing them lets a real login
     * settle as a failure when two signals arrive together — which they do, the
     * cookie watch and the `success` message being independent.
     */
    const check = async (): Promise<CheckResult> => {
      if (settled || checking) return 'busy';
      checking = true;
      try {
        return (await onDone()) === true ? 'confirmed' : 'negative';
      } catch {
        return 'negative';
      } finally {
        checking = false;
      }
    };

    const onStrongSignal = () => {
      if (settled) return;
      successSeen = true;
      void check().then((result) => {
        if (settled) return;
        if (result === 'confirmed') {
          settle('authenticated');
          return;
        }
        // Only a real negative spends an attempt: a 'busy' learned nothing, and
        // counting it would burn the budget and give up early.
        if (result === 'negative') {
          checks += 1;
          if (checks >= maxChecks) {
            settle('unresolved');
            return;
          }
        }
        retryTimer = setTimeout(onStrongSignal, retryDelayMs);
      });
    };

    handlers.success = onStrongSignal;
    handlers.close = () => {
      // A success already owns the outcome; its ladder will land on
      // 'authenticated' or 'unresolved'.
      if (!successSeen) settle('abandoned');
    };
    handlers.marker = () => {
      void check().then((result) => {
        if (result === 'confirmed') settle('authenticated');
        // Anything else: a guess that did not pan out. Leave the form up.
      });
    };

    timeoutTimer = setTimeout(() => settle('timeout'), timeoutMs);
  });

  // Registered AFTER construction: the executor runs synchronously inside the
  // Promise constructor, where `promise` is still in its temporal dead zone.
  active = { promise, settle: settleFlow };

  // Both of these can throw on a caller's own code — a custom session reader,
  // a host that cannot render — and both run OUTSIDE the promise executor for
  // that reason: an executor that throws rejects the promise silently, leaving
  // this module holding a dead flow that every later call would be handed.
  try {
    if (watchSession !== false) {
      unwatch = watchSessionSignal({
        intervalMs: sessionPollMs,
        read: typeof watchSession === 'function' ? watchSession : undefined,
        onAppear: () => handlers.marker?.(),
      });
    }
    unmount = mount(session.src);
  } catch (error) {
    // Nothing usable is rendered, so there is no flow to wait on. Tear the
    // subscription down, free the slot, and let the caller see its own error.
    settleFlow('cancelled');
    throw error;
  }

  // The host may have settled the flow from inside `mount()` — unmounting
  // synchronously, cancelling on a route change. The teardown it just handed
  // back still has to run.
  if (settled) runUnmount();

  return promise;
}

/**
 * Abandon the in-flight flow, if any, resolving its promise as `'cancelled'`.
 * Intended for host teardown (a React unmount) so listeners and timers do not
 * outlive the component that started them. The host's own `mount` teardown runs
 * as part of it, so the frame comes down with the flow.
 */
export function cancelFrameSignIn(): void {
  active?.settle('cancelled');
  active = null;
}
