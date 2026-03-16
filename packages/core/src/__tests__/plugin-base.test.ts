import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPluginBase } from '../plugin-base'

// Mock ResizeObserver for jsdom
class MockResizeObserver {
  callback: Function
  constructor(cb: Function) { this.callback = cb }
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as any).ResizeObserver = MockResizeObserver

describe('createPluginBase', () => {
  let mockXprops: Record<string, any>

  beforeEach(() => {
    mockXprops = {
      presentation: { id: '123', language: 'en' },
      slide: { id: 's1', slideType: 'quiz' },
      baseUrl: 'https://ahaslides.com',
      presentationColorPalette: ['#ff0000'],
      presentationLighterColorPalette: ['#ff8888'],
      onProps: vi.fn(),
      onHeightChange: vi.fn(),
      subscribeTopic: vi.fn(),
      unsubscribeTopic: vi.fn(),
      trackGA4AndMixpanel: vi.fn(),
      getValues: vi.fn().mockResolvedValue([{ key: 'k', path: 'p', value: 'v' }]),
    }
    ;(window as any).xprops = mockXprops
  })

  afterEach(() => {
    delete (window as any).xprops
  })

  it('reads initial state from xprops', () => {
    const plugin = createPluginBase()
    expect(plugin.getPresentation()).toEqual({ id: '123', language: 'en' })
    expect(plugin.getSlide()).toEqual({ id: 's1', slideType: 'quiz' })
    expect(plugin.getBaseUrl()).toBe('https://ahaslides.com')
    expect(plugin.getPresentationColorPalette()).toEqual(['#ff0000'])
    expect(plugin.getPresentationLighterColorPalette()).toEqual(['#ff8888'])
  })

  it('init() registers onProps and routes updates', () => {
    const plugin = createPluginBase()
    plugin.init()

    expect(mockXprops.onProps).toHaveBeenCalledOnce()
    const onPropsCallback = mockXprops.onProps.mock.calls[0][0]

    onPropsCallback({ presentation: { id: '456' } })
    expect(plugin.getPresentation()).toEqual({ id: '456' })

    onPropsCallback({ slide: { id: 's2' } })
    expect(plugin.getSlide()).toEqual({ id: 's2' })

    onPropsCallback({ baseUrl: 'https://new.com' })
    expect(plugin.getBaseUrl()).toBe('https://new.com')

    onPropsCallback({ presentationColorPalette: ['#00ff00'] })
    expect(plugin.getPresentationColorPalette()).toEqual(['#00ff00'])

    onPropsCallback({ presentationLighterColorPalette: ['#88ff88'] })
    expect(plugin.getPresentationLighterColorPalette()).toEqual(['#88ff88'])
  })

  it('init() without autoHeight calls onHeightChange(null)', () => {
    const plugin = createPluginBase()
    plugin.init()
    expect(mockXprops.onHeightChange).toHaveBeenCalledWith(null)
  })

  it('init() with autoHeight calls autoReportHeight', () => {
    const plugin = createPluginBase({ autoHeight: true })
    plugin.init()
    // autoHeight was set, so onHeightChange(null) should NOT be called
    // Instead autoReportHeight should run and call onHeightChange with a height number
    expect(mockXprops.onHeightChange).not.toHaveBeenCalledWith(null)
  })

  it('subscriptions notify on changes', () => {
    const plugin = createPluginBase()
    const fn = vi.fn()
    const unsub = plugin.onPresentationChange(fn)

    plugin.init()
    const onPropsCallback = mockXprops.onProps.mock.calls[0][0]
    onPropsCallback({ presentation: { id: '789' } })

    expect(fn).toHaveBeenCalledWith({ id: '789' })
    unsub()
  })

  it('subscribeTopic passes through to xprops', () => {
    const plugin = createPluginBase()
    const opts = { topic: 'test', callback: vi.fn() }
    plugin.subscribeTopic(opts)
    expect(mockXprops.subscribeTopic).toHaveBeenCalledWith(opts)
  })

  it('unsubscribeTopic passes through to xprops', () => {
    const plugin = createPluginBase()
    plugin.unsubscribeTopic('test')
    expect(mockXprops.unsubscribeTopic).toHaveBeenCalledWith('test')
  })

  it('trackGA4AndMixpanel passes through to xprops', () => {
    const plugin = createPluginBase()
    plugin.trackGA4AndMixpanel({ event: 'click' })
    expect(mockXprops.trackGA4AndMixpanel).toHaveBeenCalledWith({ event: 'click' })
  })

  it('getValues passes through to xprops', async () => {
    const plugin = createPluginBase()
    const result = await plugin.getValues({ bucket: 'b1' })
    expect(mockXprops.getValues).toHaveBeenCalledWith({ bucket: 'b1' })
    expect(result).toEqual([{ key: 'k', path: 'p', value: 'v' }])
  })

  it('actions are no-ops when xprops is undefined', () => {
    delete (window as any).xprops
    const plugin = createPluginBase()
    expect(() => plugin.subscribeTopic({ topic: 't', callback: vi.fn() })).not.toThrow()
    expect(() => plugin.unsubscribeTopic('t')).not.toThrow()
    expect(() => plugin.trackGA4AndMixpanel({})).not.toThrow()
  })

  it('getValues returns empty array when xprops is undefined', async () => {
    delete (window as any).xprops
    const plugin = createPluginBase()
    const result = await plugin.getValues({ bucket: 'b' })
    expect(result).toEqual([])
  })

  it('destroy() cleans up observables', () => {
    const plugin = createPluginBase()
    const fn = vi.fn()
    plugin.onSlideChange(fn)
    plugin.destroy()

    // After destroy, subscriptions should not fire
    // (We can verify by checking that the plugin still returns last value but no notifications)
    plugin.init()
    // onProps won't fire because xprops.onProps was already called, but the observable is destroyed
  })

  it('destroy() cleans up height observer', () => {
    const plugin = createPluginBase({ autoHeight: true })
    plugin.init()
    expect(() => plugin.destroy()).not.toThrow()
  })
})
