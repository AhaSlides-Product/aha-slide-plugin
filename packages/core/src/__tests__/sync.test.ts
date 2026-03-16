import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSync, createSyncReadOnly } from '../sync'

// --- Mock BroadcastChannel ---
type MockBCHandler = ((event: MessageEvent) => void) | null

class MockBroadcastChannel {
  static channels: Map<string, Set<MockBroadcastChannel>> = new Map()

  name: string
  onmessage: MockBCHandler = null
  closed = false

  constructor(name: string) {
    this.name = name
    if (!MockBroadcastChannel.channels.has(name)) {
      MockBroadcastChannel.channels.set(name, new Set())
    }
    MockBroadcastChannel.channels.get(name)!.add(this)
  }

  postMessage(data: any): void {
    if (this.closed) return
    const peers = MockBroadcastChannel.channels.get(this.name)
    if (!peers) return
    for (const peer of peers) {
      if (peer !== this && !peer.closed && peer.onmessage) {
        peer.onmessage(new MessageEvent('message', { data }))
      }
    }
  }

  close(): void {
    this.closed = true
    const peers = MockBroadcastChannel.channels.get(this.name)
    if (peers) {
      peers.delete(this)
      if (peers.size === 0) {
        MockBroadcastChannel.channels.delete(this.name)
      }
    }
  }

  static reset(): void {
    MockBroadcastChannel.channels.clear()
  }
}

// Install mock
beforeEach(() => {
  MockBroadcastChannel.reset()
  ;(globalThis as any).BroadcastChannel = MockBroadcastChannel
})

afterEach(() => {
  MockBroadcastChannel.reset()
})

describe('createSync', () => {
  it('returns initial state via getState', () => {
    const sync = createSync('test-1', 42)
    expect(sync.getState()).toBe(42)
    sync.destroy()
  })

  it('updates state via setState', () => {
    const sync = createSync('test-2', 'hello')
    sync.setState('world')
    expect(sync.getState()).toBe('world')
    sync.destroy()
  })

  it('fires onStateChange on local setState', () => {
    const sync = createSync('test-3', 0)
    const fn = vi.fn()
    sync.onStateChange(fn)
    sync.setState(1)
    expect(fn).toHaveBeenCalledWith(1)
    expect(fn).toHaveBeenCalledTimes(1)
    sync.destroy()
  })

  it('broadcasts to other channels with the same name', () => {
    const sync1 = createSync('shared', 'a')
    const sync2 = createSync('shared', 'a')
    const fn = vi.fn()
    sync2.onStateChange(fn)

    sync1.setState('b')
    expect(fn).toHaveBeenCalledWith('b')
    expect(sync2.getState()).toBe('b')

    sync1.destroy()
    sync2.destroy()
  })

  it('does not echo received messages back (no re-broadcast)', () => {
    const sync1 = createSync('echo-test', 0)
    const sync2 = createSync('echo-test', 0)

    // Spy on the underlying BroadcastChannel postMessage of sync1
    const channels = MockBroadcastChannel.channels.get('echo-test')!
    const channelsArray = Array.from(channels)
    const postMessageSpy0 = vi.spyOn(channelsArray[0], 'postMessage')
    const postMessageSpy1 = vi.spyOn(channelsArray[1], 'postMessage')

    // sync1 sets state -> should post to BC
    sync1.setState(5)
    expect(postMessageSpy0.mock.calls.length).toBe(1)

    // sync2 received the message and updated, but should NOT have posted back
    expect(sync2.getState()).toBe(5)
    expect(postMessageSpy1.mock.calls.length).toBe(0)

    sync1.destroy()
    sync2.destroy()
  })

  it('unsubscribe stops notifications', () => {
    const sync = createSync('unsub-test', 0)
    const fn = vi.fn()
    const unsub = sync.onStateChange(fn)
    unsub()
    sync.setState(1)
    expect(fn).not.toHaveBeenCalled()
    sync.destroy()
  })

  it('destroy closes the channel', () => {
    const sync = createSync('destroy-test', 0)
    const fn = vi.fn()
    sync.onStateChange(fn)
    sync.destroy()
    // After destroy, setting state should still work on the observable but not broadcast
    // The channel is closed, so no more messages
    expect(MockBroadcastChannel.channels.has('destroy-test')).toBe(false)
  })

  it('handles object values with deep clone', () => {
    const sync1 = createSync('obj-test', { count: 0 })
    const sync2 = createSync('obj-test', { count: 0 })
    const fn = vi.fn()
    sync2.onStateChange(fn)

    const obj = { count: 1 }
    sync1.setState(obj)

    // Verify sync2 received the value
    expect(fn).toHaveBeenCalledWith({ count: 1 })
    const received = sync2.getState()
    expect(received).toEqual({ count: 1 })

    // Verify it's a deep clone (not the same reference)
    // The postMessage sends JSON.parse(JSON.stringify(value))
    obj.count = 999
    expect(received.count).toBe(1) // should not be affected

    sync1.destroy()
    sync2.destroy()
  })

  it('ignores messages with same JSON value (dedup)', () => {
    const sync1 = createSync('dedup', { x: 1 })
    const sync2 = createSync('dedup', { x: 1 })
    const fn = vi.fn()
    sync2.onStateChange(fn)

    // Send same value — bc.onmessage checks JSON.stringify equality
    sync1.setState({ x: 1 })

    // The BroadcastChannel will deliver the message but sync2's handler
    // should see the same JSON and skip
    // Actually sync1 broadcasts, sync2 receives. sync2's current state is {x:1},
    // received is {x:1}, so JSON match -> skip
    expect(fn).not.toHaveBeenCalled()

    sync1.destroy()
    sync2.destroy()
  })

  it('fires onStateChange on remote changes', () => {
    const sync1 = createSync('remote-test', 'init')
    const sync2 = createSync('remote-test', 'init')
    const fn1 = vi.fn()
    sync1.onStateChange(fn1)

    // sync2 sets state, sync1 should receive
    sync2.setState('updated')
    expect(fn1).toHaveBeenCalledWith('updated')
    expect(sync1.getState()).toBe('updated')

    sync1.destroy()
    sync2.destroy()
  })
})

describe('createSyncReadOnly', () => {
  it('returns initial state', () => {
    const ro = createSyncReadOnly('ro-1', 10)
    expect(ro.getState()).toBe(10)
    ro.destroy()
  })

  it('has no setState method', () => {
    const ro = createSyncReadOnly('ro-2', 'x')
    expect((ro as any).setState).toBeUndefined()
    ro.destroy()
  })

  it('receives updates from a writable channel', () => {
    const writer = createSync('ro-sync', 0)
    const reader = createSyncReadOnly('ro-sync', 0)
    const fn = vi.fn()
    reader.onStateChange(fn)

    writer.setState(42)
    expect(fn).toHaveBeenCalledWith(42)
    expect(reader.getState()).toBe(42)

    writer.destroy()
    reader.destroy()
  })

  it('does not broadcast (read-only channels should not send messages)', () => {
    const reader = createSyncReadOnly('ro-no-broadcast', 0)
    const writer = createSync('ro-no-broadcast', 0)
    const fn = vi.fn()
    writer.onStateChange(fn)

    // Reader has no setState, so it can't send. Verify no messages reach writer.
    expect(fn).not.toHaveBeenCalled()

    writer.destroy()
    reader.destroy()
  })

  it('unsubscribe works', () => {
    const writer = createSync('ro-unsub', 0)
    const reader = createSyncReadOnly('ro-unsub', 0)
    const fn = vi.fn()
    const unsub = reader.onStateChange(fn)
    unsub()

    writer.setState(5)
    // The reader's BC onmessage still fires (updating internal state),
    // but the subscriber fn should not be called
    // Actually the observable.set is called, which would notify. But we unsubscribed.
    // Wait - the BC onmessage calls observable.set, which notifies subscribers.
    // But we unsubscribed from the observable, so fn should not fire.
    expect(fn).not.toHaveBeenCalled()

    writer.destroy()
    reader.destroy()
  })

  it('destroy closes the channel', () => {
    const reader = createSyncReadOnly('ro-destroy', 'a')
    reader.destroy()
    expect(MockBroadcastChannel.channels.has('ro-destroy')).toBe(false)
  })
})
