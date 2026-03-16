import { Observable, type Unsubscribe } from './observable'
import type { SyncChannel, SyncReadOnlyChannel } from './types'

export function createSync<T>(name: string, initialState: T): SyncChannel<T> {
  const observable = new Observable<T>(initialState)
  const bc = new BroadcastChannel(name)
  let isReceiving = false

  bc.onmessage = (event: MessageEvent) => {
    if (event.data !== undefined) {
      const current = observable.get()
      if (JSON.stringify(event.data) !== JSON.stringify(current)) {
        isReceiving = true
        setState(event.data)
        isReceiving = false
      }
    }
  }

  function setState(value: T): void {
    observable.set(value)
    if (!isReceiving) {
      bc.postMessage(JSON.parse(JSON.stringify(value)))
    }
  }

  return {
    getState(): T {
      return observable.get()
    },
    setState,
    onStateChange(fn: (value: T) => void): Unsubscribe {
      return observable.subscribe(fn)
    },
    destroy(): void {
      bc.close()
      observable.destroy()
    },
  }
}

export function createSyncReadOnly<T>(name: string, initialState: T): SyncReadOnlyChannel<T> {
  const observable = new Observable<T>(initialState)
  const bc = new BroadcastChannel(name)

  bc.onmessage = (event: MessageEvent) => {
    if (event.data !== undefined) {
      observable.set(event.data)
    }
  }

  return {
    getState(): T {
      return observable.get()
    },
    onStateChange(fn: (value: T) => void): Unsubscribe {
      return observable.subscribe(fn)
    },
    destroy(): void {
      bc.close()
      observable.destroy()
    },
  }
}
