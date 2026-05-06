/**
 * Framework-agnostic sync primitives — promoted from @aha/ui's Vue-specific
 * `useSync` so that React, Svelte, vanilla, etc. can share one implementation.
 *
 * Backed by `BroadcastChannel` to bridge same-origin tabs/iframes (e.g. the
 * presenter's Canvas iframe and Settings iframe).
 *
 * Per the design spec (docs/superpowers/specs/2026-05-05-content-slide-plugin-design.md §2.5),
 * frameworks wrap these primitives with thin adapters (e.g. a React hook that
 * subscribes via `useSyncExternalStore`).
 */

interface Listener<T> {
  (value: T): void;
}

export interface SyncStore<T> {
  /** Current local state. */
  get(): T;
  /** Update local state and broadcast it to other tabs. */
  set(value: T): void;
  /** Subscribe to remote updates. Returns an unsubscribe function. */
  subscribe(listener: Listener<T>): () => void;
  /** Tear down the BroadcastChannel. */
  close(): void;
}

export type ReadOnlySyncStore<T> = Omit<SyncStore<T>, 'set'>;

/** Two-way sync: local writes broadcast; incoming messages update local state. */
export function createSync<T>(name: string, initial: T): SyncStore<T> {
  let value = initial;
  let bc: BroadcastChannel | null = null;
  const listeners = new Set<Listener<T>>();

  if (typeof BroadcastChannel !== 'undefined' && name) {
    bc = new BroadcastChannel(name);
    bc.onmessage = (event) => {
      const incoming = event.data as T;
      if (incoming === undefined) return;
      if (jsonEq(incoming, value)) return;
      value = incoming;
      listeners.forEach((l) => l(value));
    };
  }

  return {
    get: () => value,
    set: (next: T) => {
      if (jsonEq(next, value)) return;
      value = next;
      listeners.forEach((l) => l(value));
      if (bc) {
        try {
          bc.postMessage(safeClone(next));
        } catch (err) {
          if (typeof console !== 'undefined') {
            console.warn(`[createSync:${name}] postMessage failed`, err);
          }
        }
      }
    },
    subscribe: (listener: Listener<T>) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    close: () => {
      listeners.clear();
      if (bc) {
        bc.close();
        bc = null;
      }
    },
  };
}

/** Read-only sync: subscribes to remote updates but never broadcasts. */
export function createReadOnlySync<T>(name: string, initial: T): ReadOnlySyncStore<T> {
  const store = createSync(name, initial);
  return {
    get: store.get,
    subscribe: store.subscribe,
    close: store.close,
  };
}

export interface HeightReporterOptions {
  /** CSS selector for the element whose height is reported. Defaults to '#root'. */
  rootSelector?: string;
  /** Min ms between reports. Defaults to 100. */
  throttleMs?: number;
}

export interface HeightReporter {
  start(): void;
  stop(): void;
}

/**
 * Continuously reports the document's content height to the host iframe via
 * `xprops.onHeightChange`. Works in any framework — pure DOM observers.
 */
export function createHeightReporter(options: HeightReporterOptions = {}): HeightReporter {
  const rootSelector = options.rootSelector ?? '#root';
  const throttleMs = options.throttleMs ?? 100;

  let observer: ResizeObserver | null = null;
  let lastSent = -1;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let started = false;

  const send = () => {
    timer = null;
    const root = document.querySelector(rootSelector) as HTMLElement | null;
    if (!root) return;
    const height = Math.ceil(root.getBoundingClientRect().height);
    if (height === lastSent) return;
    const xprops = (window as { xprops?: { onHeightChange?: (h: number) => void } }).xprops;
    const onHeightChange = xprops?.onHeightChange;
    if (typeof onHeightChange !== 'function') return;
    lastSent = height;
    onHeightChange(height);
  };

  const schedule = () => {
    if (timer !== null) return;
    timer = setTimeout(send, throttleMs);
  };

  return {
    start() {
      if (started || typeof window === 'undefined') return;
      started = true;
      const root = document.querySelector(rootSelector) as HTMLElement | null;
      if (!root || typeof ResizeObserver === 'undefined') return;
      observer = new ResizeObserver(schedule);
      observer.observe(root);
      // Defensive: ResizeObserver.observe() fires once initially per spec, but
      // historic Safari quirks and unmount-before-paint races have skipped it.
      // Schedule explicitly so the parent always gets at least one height ping.
      schedule();
    },
    stop() {
      started = false;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}

function jsonEq(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function safeClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
