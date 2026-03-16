export type Unsubscribe = () => void

export class Observable<T> {
  private value: T
  private listeners: Set<(value: T) => void> = new Set()

  constructor(initialValue: T) {
    this.value = initialValue
  }

  get(): T {
    return this.value
  }

  set(newValue: T): void {
    this.value = newValue
    this.listeners.forEach(fn => fn(newValue))
  }

  subscribe(fn: (value: T) => void): Unsubscribe {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  destroy(): void {
    this.listeners.clear()
  }
}
