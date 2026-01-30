/**
 * Mock BroadcastChannel implementation for testing useSync and useSyncReadOnly
 */
export class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  private listeners: Array<(event: MessageEvent) => void> = [];
  private static instances: Map<string, MockBroadcastChannel[]> = new Map();

  constructor(name: string) {
    this.name = name;
    if (!MockBroadcastChannel.instances.has(name)) {
      MockBroadcastChannel.instances.set(name, []);
    }
    MockBroadcastChannel.instances.get(name)!.push(this);
  }

  postMessage(message: any) {
    // Broadcast to all other instances with the same name
    const instances = MockBroadcastChannel.instances.get(this.name) || [];
    instances.forEach(instance => {
      if (instance !== this) {
        instance.listeners.forEach(listener => {
          listener({ data: message } as MessageEvent);
        });
        if (instance.onmessage) {
          instance.onmessage({ data: message } as MessageEvent);
        }
      }
    });
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    this.listeners.push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  close() {
    const instances = MockBroadcastChannel.instances.get(this.name) || [];
    const index = instances.indexOf(this);
    if (index > -1) {
      instances.splice(index, 1);
    }
    this.listeners = [];
    this.onmessage = null;
    this.onmessageerror = null;
  }

  static reset() {
    MockBroadcastChannel.instances.clear();
  }
}
