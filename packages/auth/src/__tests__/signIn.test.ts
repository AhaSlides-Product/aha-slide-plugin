import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { cancelSignIn, signIn } from '../signIn.js';
import { installFakeBroadcastChannel, type FakeChannelRegistry } from './fakeBroadcastChannel.js';

const LOGIN = 'https://presenter.example.com/pages/login';

let channels: FakeChannelRegistry;
let popup: { closed: boolean; focus: () => void };
let openSpy: MockInstance<typeof window.open>;

/** Let queued promise callbacks and zero-delay timers run. */
async function flush(times = 6): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

function broadcastDone(): void {
  const emitter = new (
    globalThis as unknown as {
      BroadcastChannel: new (n: string) => {
        postMessage(d: unknown): void;
      };
    }
  ).BroadcastChannel('aha-auth');
  emitter.postMessage({ type: 'aha-auth:done' });
}

beforeEach(() => {
  channels = installFakeBroadcastChannel();
  popup = { closed: false, focus: vi.fn() };
  openSpy = vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
});

afterEach(() => {
  cancelSignIn();
  channels.restore();
  vi.restoreAllMocks();
});

describe('signIn', () => {
  it('opens a popup rather than navigating', async () => {
    const onBlocked = vi.fn();

    const flow = signIn({ url: LOGIN, onDone: () => false, onBlocked });
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy.mock.calls[0][0]).toBe(LOGIN);
    // The full-page path is what `onBlocked` stands in for; it must stay unused.
    expect(onBlocked).not.toHaveBeenCalled();

    cancelSignIn();
    await expect(flow).resolves.toEqual({ status: 'cancelled' });
  });

  it('resolves as authenticated when the done ping arrives and identity confirms', async () => {
    const onDone = vi.fn().mockResolvedValue(true);
    const flow = signIn({ url: LOGIN, onDone });

    broadcastDone();

    await expect(flow).resolves.toEqual({ status: 'authenticated' });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  // The ping means the popup finished, so a false check is a slow identity
  // endpoint rather than a user who failed to log in — it must retry.
  it('retries after the ping and succeeds on a later check', async () => {
    const onDone = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
    const flow = signIn({ url: LOGIN, onDone, retryDelayMs: 0 });

    broadcastDone();

    await expect(flow).resolves.toEqual({ status: 'authenticated' });
    expect(onDone).toHaveBeenCalledTimes(2);
  });

  it('gives up as unresolved after maxChecks failed checks', async () => {
    const onDone = vi.fn().mockResolvedValue(false);
    const flow = signIn({ url: LOGIN, onDone, retryDelayMs: 0, maxChecks: 3 });

    broadcastDone();

    await expect(flow).resolves.toEqual({ status: 'unresolved' });
    expect(onDone).toHaveBeenCalledTimes(3);
  });

  it('treats a closed popup with no session as abandoned', async () => {
    const onDone = vi.fn().mockResolvedValue(false);
    const flow = signIn({ url: LOGIN, onDone });

    popup.closed = true;
    globalThis.dispatchEvent(new Event('focus'));

    await expect(flow).resolves.toEqual({ status: 'abandoned' });
  });

  // Focus also fires when the user just clicks the parent window. That must not
  // end the flow while the popup is still open.
  it('keeps waiting when focus returns but the popup is still open', async () => {
    const onDone = vi.fn().mockResolvedValue(false);
    const settled = vi.fn();
    void signIn({ url: LOGIN, onDone }).then(settled);

    globalThis.dispatchEvent(new Event('focus'));
    await flush();

    expect(onDone).toHaveBeenCalled();
    expect(settled).not.toHaveBeenCalled();
  });

  // The universal fallback: no channel at all, only focus.
  it('completes on focus alone when BroadcastChannel is unavailable', async () => {
    channels.breakConstructor();
    const flow = signIn({ url: LOGIN, onDone: () => true });

    popup.closed = true;
    globalThis.dispatchEvent(new Event('focus'));

    await expect(flow).resolves.toEqual({ status: 'authenticated' });
  });

  // Regression, PR #131 review. notifyDone() pings AND closes, so on the happy
  // path focus arrives while the ping's own onDone() is still in flight. With a
  // synchronous onDone the strong microtask wins and this passes trivially —
  // the delay is what makes the race real.
  it('reports a success as authenticated when the ping and the close race', async () => {
    const onDone = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(true), 10)));
    const flow = signIn({ url: LOGIN, onDone });

    broadcastDone();
    // The popup closes immediately after pinging, exactly as notifyDone() does.
    popup.closed = true;
    globalThis.dispatchEvent(new Event('focus'));

    await expect(flow).resolves.toEqual({ status: 'authenticated' });
  });

  // The same bug class one step later: the ping's check legitimately returns
  // false (slow session propagation) and a retry is pending. Focus must not
  // call that abandoned and cancel the retry the ping earned.
  it('lets the retry finish when focus lands between a negative check and it', async () => {
    // Negative for BOTH the ping's check and the focus check, so the focus path
    // reaches its terminal branch rather than confirming and masking the bug.
    const onDone = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValue(true);
    const flow = signIn({ url: LOGIN, onDone, retryDelayMs: 5 });

    broadcastDone();
    await flush(2); // first check resolves negative, retry scheduled

    popup.closed = true;
    globalThis.dispatchEvent(new Event('focus'));

    await expect(flow).resolves.toEqual({ status: 'authenticated' });
    expect(onDone.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  // Without a ping, focus IS the only signal, so a closed popup with no session
  // must still be abandoned — the guard above must not swallow this.
  it('still reports abandoned when the popup closes with no ping at all', async () => {
    const onDone = vi.fn().mockResolvedValue(false);
    const flow = signIn({ url: LOGIN, onDone });

    popup.closed = true;
    globalThis.dispatchEvent(new Event('focus'));

    await expect(flow).resolves.toEqual({ status: 'abandoned' });
  });

  it('falls back to onBlocked when the popup is blocked', async () => {
    openSpy.mockReturnValue(null);
    const onBlocked = vi.fn();

    await expect(signIn({ url: LOGIN, onDone: () => true, onBlocked })).resolves.toEqual({
      status: 'blocked',
    });
    expect(onBlocked).toHaveBeenCalledWith(LOGIN);
  });

  it('focuses the existing popup and reuses the promise on a second click', async () => {
    const onDone = vi.fn().mockResolvedValue(true);
    const first = signIn({ url: LOGIN, onDone });
    const second = signIn({ url: LOGIN, onDone });

    expect(second).toBe(first);
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(popup.focus).toHaveBeenCalledTimes(1);

    broadcastDone();
    await expect(first).resolves.toEqual({ status: 'authenticated' });
  });

  it('rejects an unsafe login url at the call site', () => {
    expect(() => signIn({ url: 'javascript:alert(1)', onDone: () => true })).toThrow();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('survives an onDone that throws', async () => {
    const onDone = vi.fn().mockRejectedValue(new Error('network'));
    const flow = signIn({ url: LOGIN, onDone, retryDelayMs: 0, maxChecks: 2 });

    broadcastDone();

    await expect(flow).resolves.toEqual({ status: 'unresolved' });
  });

  it('stops listening once settled', async () => {
    const onDone = vi.fn().mockResolvedValue(true);
    const flow = signIn({ url: LOGIN, onDone });

    broadcastDone();
    await flow;

    globalThis.dispatchEvent(new Event('focus'));
    await flush(2);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
