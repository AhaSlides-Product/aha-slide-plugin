import { describe, expect, it } from 'vitest';
import { RelayClient, PROTOCOL_VERSION } from '@aha/ui-vanilla';
import { getRelaySession } from '@aha/common';
import type { ChannelMap, InboundFrame } from '@aha/ui-vanilla';

const MAP: ChannelMap = {
  signal: { topology: 'mesh', addressing: 'any', retained: false, logged: false },
  state: { topology: 'mesh', addressing: 'none', retained: true, logged: false },
  log: { topology: 'hub', addressing: 'presenter', retained: true, logged: true },
};

class FakeSocket {
  static last: FakeSocket | null = null;
  sent: string[] = [];
  listeners = new Map<string, Array<(ev: unknown) => void>>();

  constructor(
    readonly url: string,
    readonly protocols?: string[],
  ) {
    FakeSocket.last = this;
  }

  addEventListener(type: string, fn: (ev: unknown) => void): void {
    const l = this.listeners.get(type) ?? [];
    l.push(fn);
    this.listeners.set(type, l);
  }

  send(text: string): void {
    this.sent.push(text);
  }

  close(): void {
    this.emit('close', {});
  }

  emit(type: string, ev: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) fn(ev);
  }

  roster(): void {
    this.emit('open', {});
    this.emit('message', {
      data: JSON.stringify({
        v: PROTOCOL_VERSION,
        type: 'roster',
        participantId: 'me',
        role: 'participant',
        sessionKey: 's',
        participants: [],
        state: {},
        serverTime: Date.now(),
      }),
    });
  }
}

function withFakeSocket<T>(fn: () => T): T {
  const original = (globalThis as { WebSocket: unknown }).WebSocket;
  (globalThis as { WebSocket: unknown }).WebSocket = FakeSocket;
  try {
    return fn();
  } finally {
    (globalThis as { WebSocket: unknown }).WebSocket = original;
  }
}

function parse(sent: string[]): InboundFrame[] {
  return sent.map((t) => JSON.parse(t) as InboundFrame).filter((f) => f.channel !== undefined);
}

describe('getRelaySession', () => {
  it('derives the same key on both sides from the slide alone', () => {
    expect(getRelaySession({ slideId: 42, slideVersion: 3 })).toBe('slide-42-3');
  });

  it('gives a version bump a session of its own', () => {
    expect(getRelaySession({ slideId: 42, slideVersion: 4 })).not.toBe(
      getRelaySession({ slideId: 42, slideVersion: 3 }),
    );
  });
});

describe('RelayClient', () => {
  it('attaches to the derived session with its identity and role', () => {
    withFakeSocket(() => {
      const c = new RelayClient({
        url: 'wss://relay',
        sessionKey: getRelaySession({ slideId: 42, slideVersion: 3 }),
        role: 'presenter',
        participantId: 'me',
      });
      c.connect();
      expect(FakeSocket.last!.url).toBe('wss://relay/session/slide-42-3?pid=me&role=presenter');
      expect(FakeSocket.last!.protocols).toEqual(['liverelay.v1']);
      c.close();
    });
  });

  it('keeps one participant id across reconnects', () => {
    withFakeSocket(() => {
      const c = new RelayClient({ url: 'wss://relay', sessionKey: 's' });
      const id = c.id;
      expect(id).toMatch(/^[0-9a-f-]{36}$/);
      c.connect();
      expect(FakeSocket.last!.url).toContain(`pid=${id}`);
      c.close();
    });
  });

  it('replays only the newest frame of a retained channel after a gap', () => {
    withFakeSocket(() => {
      const c = new RelayClient({ url: 'wss://relay', sessionKey: 's', channels: MAP });
      c.connect();
      for (let i = 0; i < 5; i++) c.send('state', { x: i });
      FakeSocket.last!.roster();
      const frames = parse(FakeSocket.last!.sent);
      expect(frames).toHaveLength(1);
      expect(frames[0]!.payload).toEqual({ x: 4 });
      c.close();
    });
  });

  it('drops transient frames composed during a gap rather than replaying them stale', () => {
    withFakeSocket(() => {
      const c = new RelayClient({ url: 'wss://relay', sessionKey: 's', channels: MAP });
      c.connect();
      c.send('signal', { typing: true });
      FakeSocket.last!.roster();
      expect(parse(FakeSocket.last!.sent)).toEqual([]);
      c.close();
    });
  });
});
