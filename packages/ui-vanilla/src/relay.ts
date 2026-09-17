// Vendored from backend-live-session/liverelay/src/{protocol,client}.ts, which is
// upstream: fix there first, then copy. PROTOCOL_VERSION turns drift into a
// version mismatch on the roster frame rather than silent misbehaviour.

export const PROTOCOL_VERSION = 1;
export const SUBPROTOCOL = 'liverelay.v1';
export const PING = JSON.stringify({ v: PROTOCOL_VERSION, type: 'ping' });

export type Channel = string;
export type Topology = 'mesh' | 'hub';
export type Addressing = 'none' | 'presenter' | 'any';
export type Role = 'presenter' | 'participant';

export interface ChannelConfig {
  topology: Topology;
  addressing: Addressing;
  retained: boolean;
  logged: boolean;
  bufferMs?: number;
}

export type ChannelMap = Record<Channel, ChannelConfig>;

export interface InboundFrame {
  v: number;
  channel: Channel;
  payload: unknown;
  to?: string;
}

export interface RosterFrame {
  v: number;
  type: 'roster';
  participantId: string;
  role: Role;
  sessionKey: string;
  participants: Array<{ participantId: string; role: Role }>;
  state: Partial<Record<Channel, unknown>>;
  serverTime: number;
}

export interface RelayFrame {
  v: number;
  type: 'relay';
  channel: Channel;
  from: string;
  to?: string;
  payload: unknown;
  ts: number;
}

export interface BatchFrame {
  v: number;
  type: 'batch';
  channel: Channel;
  entries: Array<{ from: string; payload: unknown }>;
  ts: number;
}

export interface PresenceFrame {
  v: number;
  type: 'presence';
  event: 'join' | 'leave';
  participantId: string;
  role: Role;
  ts: number;
}

export interface ErrorFrame {
  v: number;
  type: 'error';
  code: 'bad_frame' | 'unknown_channel' | 'rate_limited' | 'too_large' | 'addressing_denied';
}

export type OutboundFrame = RosterFrame | RelayFrame | BatchFrame | PresenceFrame | ErrorFrame;

export type RelayState = 'connecting' | 'open' | 'reconnecting' | 'closed' | 'failed';

export interface RelayClientConfig {
  /** Relay origin, e.g. `wss://liverelay.ahaslides.io`. */
  url: string;
  /** Derived, never minted — `getRelaySession({slideId, slideVersion})` from `@aha/common`. */
  sessionKey: string;
  role?: Role;
  /** Kept across reconnects; generated when absent, which a page refresh then loses. */
  participantId?: string;
  channels?: ChannelMap;
  onRoster?: (frame: RosterFrame) => void;
  onFrame?: (frame: OutboundFrame) => void;
  onStateChange?: (state: RelayState) => void;
  maxBufferedFrames?: number;
  maxBackoffMs?: number;
  maxAttempts?: number;
}

const DEFAULT_MAX_BUFFERED = 100;
const DEFAULT_MAX_BACKOFF_MS = 15_000;
const DEFAULT_MAX_ATTEMPTS = 12;
const BASE_BACKOFF_MS = 250;
const PING_INTERVAL_MS = 25_000;

export class RelayClient {
  private ws: WebSocket | null = null;
  private state: RelayState = 'closed';
  private attempt = 0;
  private buffered = new Map<Channel, InboundFrame[]>();
  private participantId: string;
  private stopped = false;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private config: RelayClientConfig) {
    this.participantId = config.participantId ?? crypto.randomUUID();
  }

  get id(): string {
    return this.participantId;
  }

  connect(): void {
    this.stopped = false;
    this.open();
  }

  close(): void {
    this.stopped = true;
    this.clearPing();
    this.setState('closed');
    try {
      this.ws?.close(1000, 'client closed');
    } catch {
      return;
    }
  }

  send(channel: Channel, payload: unknown, to?: string): void {
    const frame: InboundFrame = {
      v: PROTOCOL_VERSION,
      channel,
      payload,
      ...(to === undefined ? {} : { to }),
    };
    if (this.ws && this.state === 'open') {
      try {
        this.ws.send(JSON.stringify(frame));
        return;
      } catch {
        this.buffer(frame);
        return;
      }
    }
    this.buffer(frame);
  }

  private buffer(frame: InboundFrame): void {
    const channelConfig = this.config.channels?.[frame.channel];
    const queue = this.buffered.get(frame.channel) ?? [];

    if (channelConfig?.logged) {
      queue.push(frame);
    } else if (channelConfig?.retained || channelConfig?.bufferMs) {
      queue.length = 0;
      queue.push(frame);
    } else if (channelConfig) {
      return;
    } else {
      queue.push(frame);
    }

    const max = this.config.maxBufferedFrames ?? DEFAULT_MAX_BUFFERED;
    if (queue.length > max) queue.splice(0, queue.length - max);
    this.buffered.set(frame.channel, queue);
  }

  private flushBuffer(ws: WebSocket): void {
    const pending = [...this.buffered.values()].flat();
    this.buffered.clear();
    for (const frame of pending) {
      try {
        ws.send(JSON.stringify(frame));
      } catch {
        this.buffer(frame);
      }
    }
  }

  private setState(next: RelayState): void {
    if (this.state === next) return;
    this.state = next;
    this.config.onStateChange?.(next);
  }

  private clearPing(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private backoffMs(): number {
    const max = this.config.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
    const exp = Math.min(max, BASE_BACKOFF_MS * 2 ** this.attempt);
    return Math.random() * exp;
  }

  private scheduleRetry(): void {
    const maxAttempts = this.config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    if (this.attempt >= maxAttempts) {
      this.setState('failed');
      return;
    }

    this.setState('reconnecting');
    const delay = this.backoffMs();
    this.attempt += 1;
    setTimeout(() => this.open(), delay);
  }

  private open(): void {
    if (this.stopped) return;
    this.setState(this.attempt === 0 ? 'connecting' : 'reconnecting');

    const url = new URL(`${this.config.url}/session/${encodeURIComponent(this.config.sessionKey)}`);
    url.searchParams.set('pid', this.participantId);
    url.searchParams.set('role', this.config.role ?? 'participant');
    if (this.config.channels) {
      url.searchParams.set('channels', JSON.stringify(this.config.channels));
    }
    const ws = new WebSocket(url.toString(), [SUBPROTOCOL]);
    this.ws = ws;

    ws.addEventListener('open', () => {
      this.attempt = 0;
      this.clearPing();
      this.pingTimer = setInterval(() => {
        try {
          ws.send(PING);
        } catch {
          return;
        }
      }, PING_INTERVAL_MS);
    });

    ws.addEventListener('message', (ev: MessageEvent) => {
      let frame: OutboundFrame | { type: 'pong' };
      try {
        frame = JSON.parse(ev.data as string);
      } catch {
        return;
      }
      if ((frame as { type: string }).type === 'pong') return;

      if ((frame as OutboundFrame).type === 'roster') {
        const roster = frame as RosterFrame;
        this.participantId = roster.participantId;
        this.setState('open');
        this.config.onRoster?.(roster);
        this.flushBuffer(ws);
        return;
      }

      this.config.onFrame?.(frame as OutboundFrame);
    });

    ws.addEventListener('close', () => {
      this.clearPing();
      if (this.stopped) {
        this.setState('closed');
        return;
      }
      this.scheduleRetry();
    });

    ws.addEventListener('error', () => {
      try {
        ws.close();
      } catch {
        return;
      }
    });
  }
}
