import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { notifyDone } from '../complete.js';
import { installFakeBroadcastChannel, type FakeChannelRegistry } from './fakeBroadcastChannel.js';

let channels: FakeChannelRegistry;

beforeEach(() => {
  channels = installFakeBroadcastChannel();
});

afterEach(() => {
  channels.restore();
  vi.restoreAllMocks();
});

describe('notifyDone', () => {
  it('broadcasts a payload-free done message', () => {
    const listener = channels.listen('aha-auth');
    notifyDone({ close: false });
    expect(listener.messages).toEqual([{ type: 'aha-auth:done' }]);
  });

  it('carries no credential of any kind', () => {
    const listener = channels.listen('aha-auth');
    notifyDone({ close: false });
    expect(Object.keys(listener.messages[0] as object)).toEqual(['type']);
  });

  it('closes the window by default', () => {
    const close = vi.spyOn(globalThis, 'close').mockImplementation(() => {});
    notifyDone();
    expect(close).toHaveBeenCalled();
  });

  it('honours a custom channel name', () => {
    const wrong = channels.listen('aha-auth');
    const right = channels.listen('livelify-auth');
    notifyDone({ channelName: 'livelify-auth', close: false });
    expect(right.messages).toHaveLength(1);
    expect(wrong.messages).toHaveLength(0);
  });

  it('still closes when the channel constructor throws', () => {
    channels.breakConstructor();
    const close = vi.spyOn(globalThis, 'close').mockImplementation(() => {});
    expect(() => notifyDone()).not.toThrow();
    expect(close).toHaveBeenCalled();
  });
});
