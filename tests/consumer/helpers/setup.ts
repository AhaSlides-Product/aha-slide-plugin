import { vi } from 'vitest';
import { config } from '@vue/test-utils';

interface MockBroadcastChannelInstance {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null;
  onmessageerror: ((event: MessageEvent) => void) | null;
  listeners: Array<(event: MessageEvent) => void>;
  postMessage: (message: unknown) => void;
  addEventListener: (_type: string, listener: (event: MessageEvent) => void) => void;
  removeEventListener: (_type: string, listener: (event: MessageEvent) => void) => void;
  close: () => void;
}

// Shared map: channel name -> instances (simulates multiple tabs/components on same channel).
const channelInstancesByName = new Map<string, MockBroadcastChannelInstance[]>();

// Mock BroadcastChannel for useSync tests. Must work when called with or without 'new'
// (some bundlers may call BroadcastChannel(name) without new).
// postMessage delivers to other instances of the same channel, not just this instance's listeners.
function MockBroadcastChannel(this: MockBroadcastChannelInstance, name: string): MockBroadcastChannelInstance {
  if (!(this instanceof MockBroadcastChannel)) {
    return new (MockBroadcastChannel as any)(name);
  }
  this.name = name;
  this.onmessage = null;
  this.onmessageerror = null;
  this.listeners = [];
  if (!channelInstancesByName.has(name)) {
    channelInstancesByName.set(name, []);
  }
  channelInstancesByName.get(name)!.push(this);

  this.postMessage = (message: unknown) => {
    const event = { data: message } as MessageEvent;
    const instances = channelInstancesByName.get(this.name) || [];
    instances.forEach((instance) => {
      if (instance !== this) {
        instance.listeners.forEach((l) => l(event));
        if (instance.onmessage) instance.onmessage(event);
      }
    });
  };
  this.addEventListener = (_type: string, listener: (event: MessageEvent) => void) => {
    this.listeners.push(listener);
  };
  this.removeEventListener = (_type: string, listener: (event: MessageEvent) => void) => {
    const i = this.listeners.indexOf(listener);
    if (i > -1) this.listeners.splice(i, 1);
  };
  this.close = () => {
    const instances = channelInstancesByName.get(this.name) || [];
    const index = instances.indexOf(this);
    if (index > -1) instances.splice(index, 1);
    this.listeners = [];
    this.onmessage = null;
    this.onmessageerror = null;
  };
  return this;
}
global.BroadcastChannel = MockBroadcastChannel as any;

// Mock window.xprops for zoid tests
Object.defineProperty(window, 'xprops', {
  writable: true,
  value: {},
});

// Mock ResizeObserver and MutationObserver for autoReportHeight tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

global.MutationObserver = class MutationObserver {
  constructor(_callback: MutationCallback) {}
  observe() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as any;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Configure Vue Test Utils
config.global.stubs = {};
