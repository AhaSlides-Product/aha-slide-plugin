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
