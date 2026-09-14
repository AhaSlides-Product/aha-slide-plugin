/**
 * A deterministic in-memory BroadcastChannel. jsdom's support varies by
 * version, and the real one delivers asynchronously across contexts, which
 * makes assertions racy — this delivers synchronously to every OTHER open
 * channel of the same name, exactly like the spec minus the task queue.
 */
export interface FakeChannelRegistry {
  listen(name: string): { messages: unknown[]; close(): void };
  breakConstructor(): void;
  restore(): void;
}

interface Instance {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null;
  closed: boolean;
}

export function installFakeBroadcastChannel(): FakeChannelRegistry {
  const original = (globalThis as Record<string, unknown>).BroadcastChannel;
  const instances: Instance[] = [];
  let broken = false;

  class FakeBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;
    private instance: Instance;

    constructor(name: string) {
      if (broken) throw new Error('BroadcastChannel unavailable');
      this.name = name;
      this.instance = { name, onmessage: null, closed: false };
      // Keep the record's handler in sync with the public property.
      Object.defineProperty(this, 'onmessage', {
        get: () => this.instance.onmessage,
        set: (fn) => {
          this.instance.onmessage = fn;
        },
      });
      instances.push(this.instance);
    }

    postMessage(data: unknown): void {
      for (const other of instances) {
        if (other === this.instance || other.closed || other.name !== this.name) continue;
        other.onmessage?.({ data } as MessageEvent);
      }
    }

    close(): void {
      this.instance.closed = true;
    }
  }

  (globalThis as Record<string, unknown>).BroadcastChannel = FakeBroadcastChannel;

  return {
    listen(name: string) {
      const messages: unknown[] = [];
      const channel = new FakeBroadcastChannel(name);
      channel.onmessage = (event) => {
        messages.push(event.data);
      };
      return { messages, close: () => channel.close() };
    },
    breakConstructor() {
      broken = true;
    },
    restore() {
      (globalThis as Record<string, unknown>).BroadcastChannel = original;
    },
  };
}
