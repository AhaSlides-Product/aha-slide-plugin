import { describe, it, expect, vi } from 'vitest'
import { Observable } from '../observable'

describe('Observable', () => {
  it('stores and returns initial value', () => {
    const obs = new Observable(42)
    expect(obs.get()).toBe(42)
  })

  it('updates value on set', () => {
    const obs = new Observable('hello')
    obs.set('world')
    expect(obs.get()).toBe('world')
  })

  it('notifies subscribers on set', () => {
    const obs = new Observable(0)
    const fn = vi.fn()
    obs.subscribe(fn)
    obs.set(1)
    expect(fn).toHaveBeenCalledWith(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('supports multiple subscribers', () => {
    const obs = new Observable('a')
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    obs.subscribe(fn1)
    obs.subscribe(fn2)
    obs.set('b')
    expect(fn1).toHaveBeenCalledWith('b')
    expect(fn2).toHaveBeenCalledWith('b')
  })

  it('unsubscribes correctly', () => {
    const obs = new Observable(0)
    const fn = vi.fn()
    const unsub = obs.subscribe(fn)
    unsub()
    obs.set(1)
    expect(fn).not.toHaveBeenCalled()
  })

  it('destroy clears all subscribers', () => {
    const obs = new Observable(0)
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    obs.subscribe(fn1)
    obs.subscribe(fn2)
    obs.destroy()
    obs.set(1)
    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).not.toHaveBeenCalled()
  })

  it('works with object values', () => {
    const obs = new Observable<{ name: string }>({ name: 'Alice' })
    const fn = vi.fn()
    obs.subscribe(fn)
    obs.set({ name: 'Bob' })
    expect(obs.get()).toEqual({ name: 'Bob' })
    expect(fn).toHaveBeenCalledWith({ name: 'Bob' })
  })

  it('works with undefined initial value', () => {
    const obs = new Observable<string | undefined>(undefined)
    expect(obs.get()).toBeUndefined()
    obs.set('value')
    expect(obs.get()).toBe('value')
  })
})
