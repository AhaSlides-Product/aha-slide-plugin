// The whole flow: what each signal settles as, and that the frame always comes
// down exactly once.
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AUTH_EMBED_EVENT, AUTH_EMBED_SOURCE } from '../constants.js';
import { cancelFrameSignIn, signInWithFrame } from '../signInWithFrame.js';
import type { FrameSignInOptions } from '../types.js';

const AUTH = 'https://presenter.ahaslides.com';

/** What the framed auth page posts. `origin` defaults to the auth app's. */
function postFromFrame(type: string, origin = AUTH, user?: unknown): void {
  window.dispatchEvent(
    new MessageEvent('message', { data: { source: AUTH_EMBED_SOURCE, type, user }, origin }),
  );
}

let unmount: Mock<() => void>;
let mounted: string[];

function start(options: Partial<FrameSignInOptions> = {}) {
  return signInWithFrame({
    baseUrl: AUTH,
    mount: (src) => {
      mounted.push(src);
      return unmount;
    },
    onDone: () => true,
    watchSession: false,
    ...options,
  });
}

beforeEach(() => {
  unmount = vi.fn<() => void>();
  mounted = [];
});

afterEach(() => {
  cancelFrameSignIn();
  vi.useRealTimers();
  document.cookie = 'ahaLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('signInWithFrame', () => {
  it('mounts the framed login and settles authenticated once onDone confirms', async () => {
    const flow = start();

    expect(mounted).toHaveLength(1);
    expect(new URL(mounted[0]).pathname).toBe('/authen/embed/login');

    postFromFrame(AUTH_EMBED_EVENT.success);

    expect(await flow).toEqual({ status: 'authenticated' });
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  it('passes the advisory user to onSuccess', async () => {
    const onSuccess = vi.fn();
    const flow = start({ onSuccess });

    postFromFrame(AUTH_EMBED_EVENT.success, AUTH, { id: 7, email: 'a@b.com' });
    await flow;

    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ email: 'a@b.com' }));
  });

  it('reports ready without settling', async () => {
    const onReady = vi.fn();
    const flow = start({ onReady });

    postFromFrame(AUTH_EMBED_EVENT.ready);
    await Promise.resolve();
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(unmount).not.toHaveBeenCalled();

    postFromFrame(AUTH_EMBED_EVENT.success);
    expect(await flow).toEqual({ status: 'authenticated' });
  });

  it('settles abandoned when the user dismisses the form', async () => {
    const flow = start();

    postFromFrame(AUTH_EMBED_EVENT.close);

    expect(await flow).toEqual({ status: 'abandoned' });
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  // Any page can post a well-shaped success; acting on one would settle a flow
  // nobody completed.
  it('ignores messages from another origin', async () => {
    const onDone = vi.fn().mockReturnValue(true);
    const flow = start({ onDone });

    postFromFrame(AUTH_EMBED_EVENT.success, 'https://evil.example');
    postFromFrame(AUTH_EMBED_EVENT.close, 'https://evil.example');
    await Promise.resolve();

    expect(onDone).not.toHaveBeenCalled();
    expect(unmount).not.toHaveBeenCalled();

    postFromFrame(AUTH_EMBED_EVENT.close);
    expect(await flow).toEqual({ status: 'abandoned' });
  });

  // The cookie is already set when `success` arrives, so a negative check is a
  // slow identity endpoint, not a failed login — which is what the ladder is for.
  it('retries a negative check after success, then gives up as unresolved', async () => {
    vi.useFakeTimers();
    const onDone = vi.fn().mockResolvedValue(false);
    const flow = start({ onDone, maxChecks: 3, retryDelayMs: 10 });

    postFromFrame(AUTH_EMBED_EVENT.success);
    await vi.advanceTimersByTimeAsync(100);

    expect(await flow).toEqual({ status: 'unresolved' });
    expect(onDone).toHaveBeenCalledTimes(3);
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  it('settles authenticated when a retry finally confirms', async () => {
    vi.useFakeTimers();
    const onDone = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
    const flow = start({ onDone, retryDelayMs: 10 });

    postFromFrame(AUTH_EMBED_EVENT.success);
    await vi.advanceTimersByTimeAsync(50);

    expect(await flow).toEqual({ status: 'authenticated' });
  });

  it('treats a throwing onDone as a negative, never a crash', async () => {
    vi.useFakeTimers();
    const onDone = vi.fn().mockRejectedValue(new Error('network'));
    const flow = start({ onDone, maxChecks: 1 });

    postFromFrame(AUTH_EMBED_EVENT.success);
    await vi.advanceTimersByTimeAsync(10);

    expect(await flow).toEqual({ status: 'unresolved' });
  });

  // A close arriving after success must not pre-empt the ladder: the auth page
  // may tear itself down while our check is still in flight.
  it('lets a success sequence own the outcome over a later close', async () => {
    vi.useFakeTimers();
    const onDone = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
    const flow = start({ onDone, retryDelayMs: 10 });

    postFromFrame(AUTH_EMBED_EVENT.success);
    postFromFrame(AUTH_EMBED_EVENT.close);
    await vi.advanceTimersByTimeAsync(50);

    expect(await flow).toEqual({ status: 'authenticated' });
  });

  describe('session watch', () => {
    it('settles authenticated when the marker appears and checks out', async () => {
      vi.useFakeTimers();
      const flow = start({ watchSession: true, sessionPollMs: 10, onDone: () => true });

      document.cookie = 'ahaLoggedIn=1';
      await vi.advanceTimersByTimeAsync(20);

      expect(await flow).toEqual({ status: 'authenticated' });
      expect(unmount).toHaveBeenCalledTimes(1);
    });

    // It is a guess that something happened, not a report that it did — so a
    // negative leaves the form up rather than tearing it down as unresolved.
    it('leaves the form up when the marker does not check out', async () => {
      vi.useFakeTimers();
      const onDone = vi.fn().mockResolvedValue(false);
      const flow = start({ watchSession: true, sessionPollMs: 10, onDone });

      document.cookie = 'ahaLoggedIn=1';
      await vi.advanceTimersByTimeAsync(100);

      expect(unmount).not.toHaveBeenCalled();

      postFromFrame(AUTH_EMBED_EVENT.close);
      expect(await flow).toEqual({ status: 'abandoned' });
    });
  });

  it('settles timeout when nothing happens at all', async () => {
    vi.useFakeTimers();
    const flow = start({ timeoutMs: 1_000 });

    await vi.advanceTimersByTimeAsync(1_000);

    expect(await flow).toEqual({ status: 'timeout' });
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  it('cancels on host teardown and takes the frame down with it', async () => {
    const flow = start();

    cancelFrameSignIn();

    expect(await flow).toEqual({ status: 'cancelled' });
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  it('hands a re-entrant call the same flow rather than framing a second login', async () => {
    const first = start();
    const second = start();

    expect(second).toBe(first);
    expect(mounted).toHaveLength(1);

    postFromFrame(AUTH_EMBED_EVENT.close);
    await first;
  });

  it('frees the slot once a flow ends', async () => {
    const first = start();
    postFromFrame(AUTH_EMBED_EVENT.close);
    await first;

    const second = start();
    expect(second).not.toBe(first);
    expect(mounted).toHaveLength(2);
  });

  it('stops listening after it settles', async () => {
    const onDone = vi.fn().mockReturnValue(true);
    const flow = start({ onDone });

    postFromFrame(AUTH_EMBED_EVENT.close);
    await flow;

    postFromFrame(AUTH_EMBED_EVENT.success);
    await Promise.resolve();
    expect(onDone).not.toHaveBeenCalled();
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  // A bad base url must fail where it was written, with nothing subscribed and
  // no promise left hanging.
  it('throws at the call site on a base that is not http(s)', () => {
    const mount = vi.fn();
    expect(() => signInWithFrame({ baseUrl: 'javascript:alert(1)', mount, onDone: () => true }))
      .toThrow(/refusing javascript:/);
    expect(mount).not.toHaveBeenCalled();
  });

  it('rethrows a failing mount and leaves no flow behind', async () => {
    expect(() => start({ mount: () => { throw new Error('no dom'); } })).toThrow('no dom');

    // The slot is free: the next call frames a fresh login.
    const flow = start();
    expect(mounted).toHaveLength(1);
    postFromFrame(AUTH_EMBED_EVENT.close);
    await flow;
  });
});

// --- review reproductions (PR #136) ---
describe('review regressions', () => {
  it('survives a throwing session reader', async () => {
    expect(() =>
      start({ watchSession: () => { throw new Error('reader failed'); } }),
    ).toThrow('reader failed');

    const flow = start();
    expect(mounted).toHaveLength(1);
    postFromFrame(AUTH_EMBED_EVENT.close);
    expect(await flow).toEqual({ status: 'abandoned' });
  });

  it('runs the teardown when the flow is cancelled during mount', async () => {
    const teardown = vi.fn<() => void>();
    const flow = signInWithFrame({
      baseUrl: AUTH,
      watchSession: false,
      onDone: () => true,
      mount: () => { cancelFrameSignIn(); return teardown; },
    });

    expect(await flow).toEqual({ status: 'cancelled' });
    expect(teardown).toHaveBeenCalledTimes(1);
  });
});
