import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reportHeight, autoReportHeight } from '../height'

describe('reportHeight', () => {
  beforeEach(() => {
    ;(window as any).xprops = undefined
  })
  afterEach(() => {
    delete (window as any).xprops
  })

  it('does nothing if window.xprops is undefined', () => {
    expect(() => reportHeight()).not.toThrow()
  })

  it('does nothing if onHeightChange is not a function', () => {
    ;(window as any).xprops = {}
    expect(() => reportHeight()).not.toThrow()
  })

  it('reports scrollHeight of #app element', () => {
    const onHeightChange = vi.fn()
    ;(window as any).xprops = { onHeightChange }
    const app = document.createElement('div')
    app.id = 'app'
    Object.defineProperty(app, 'scrollHeight', { value: 500 })
    document.body.appendChild(app)
    reportHeight()
    expect(onHeightChange).toHaveBeenCalledWith(500)
    document.body.removeChild(app)
  })
})

describe('autoReportHeight', () => {
  beforeEach(() => {
    ;(window as any).xprops = undefined
  })
  afterEach(() => {
    delete (window as any).xprops
  })

  it('returns cleanup function when xprops is undefined', () => {
    const cleanup = autoReportHeight()
    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('returns cleanup function when onHeightChange is not present', () => {
    ;(window as any).xprops = {}
    const cleanup = autoReportHeight()
    expect(typeof cleanup).toBe('function')
    cleanup()
  })
})
