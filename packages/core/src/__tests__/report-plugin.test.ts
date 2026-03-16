import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createReportPlugin } from '../report-plugin'

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || MockResizeObserver

describe('createReportPlugin', () => {
  let mockXprops: Record<string, any>

  beforeEach(() => {
    mockXprops = {
      token: 'tok-123',
      currentLanguage: 'en',
      locale: 'en-US',
      translationMap: { hello: 'Hello' },
      featureFlags: { newUI: 'true' },
      iframePath: '/report/slides',
      currentUser: { name: 'Admin' },
      onProps: vi.fn(),
      onHeightChange: vi.fn(),
      trackGA4AndMixpanel: vi.fn(),
      replaceRoute: vi.fn(),
      pushRoute: vi.fn(),
      openExportModalForPresentation: vi.fn(),
    }
    ;(window as any).xprops = mockXprops
  })

  afterEach(() => {
    delete (window as any).xprops
  })

  it('reads initial state from xprops', () => {
    const plugin = createReportPlugin()
    expect(plugin.getToken()).toBe('tok-123')
    expect(plugin.getCurrentLanguage()).toBe('en')
    expect(plugin.getLocale()).toBe('en-US')
    expect(plugin.getTranslationMap()).toEqual({ hello: 'Hello' })
    expect(plugin.getFeatureFlags()).toEqual({ newUI: 'true' })
    expect(plugin.getIframePath()).toBe('/report/slides')
    expect(plugin.getCurrentUser()).toEqual({ name: 'Admin' })
  })

  it('default autoHeight is true', () => {
    const plugin = createReportPlugin()
    plugin.init()
    // autoHeight true means autoReportHeight is called, NOT onHeightChange(null)
    expect(mockXprops.onHeightChange).not.toHaveBeenCalledWith(null)
  })

  it('init() registers onProps and routes updates', () => {
    const plugin = createReportPlugin()
    plugin.init()
    const cb = mockXprops.onProps.mock.calls[0][0]

    cb({ token: 'new-tok' })
    expect(plugin.getToken()).toBe('new-tok')

    cb({ currentLanguage: 'vi' })
    expect(plugin.getCurrentLanguage()).toBe('vi')

    cb({ locale: 'vi-VN' })
    expect(plugin.getLocale()).toBe('vi-VN')

    cb({ translationMap: { hi: 'Xin chào' } })
    expect(plugin.getTranslationMap()).toEqual({ hi: 'Xin chào' })

    cb({ featureFlags: { darkMode: 'true' } })
    expect(plugin.getFeatureFlags()).toEqual({ darkMode: 'true' })

    cb({ iframePath: '/new-path' })
    expect(plugin.getIframePath()).toBe('/new-path')

    cb({ currentUser: { name: 'User2' } })
    expect(plugin.getCurrentUser()).toEqual({ name: 'User2' })
  })

  it('subscriptions fire on changes', () => {
    const plugin = createReportPlugin()
    const fn = vi.fn()
    plugin.onTokenChange(fn)
    plugin.init()
    const cb = mockXprops.onProps.mock.calls[0][0]
    cb({ token: 'changed' })
    expect(fn).toHaveBeenCalledWith('changed')
  })

  it('trackGA4AndMixpanel passes TWO args to xprops', () => {
    const plugin = createReportPlugin()
    plugin.trackGA4AndMixpanel('event_name', { key: 'val' })
    expect(mockXprops.trackGA4AndMixpanel).toHaveBeenCalledWith('event_name', { key: 'val' })
  })

  it('action pass-throughs work', () => {
    const plugin = createReportPlugin()

    plugin.replaceRoute({ path: '/new' })
    expect(mockXprops.replaceRoute).toHaveBeenCalledWith({ path: '/new' }, undefined, undefined)

    plugin.pushRoute({ path: '/push' })
    expect(mockXprops.pushRoute).toHaveBeenCalledWith({ path: '/push' }, undefined, undefined)

    plugin.openExportModalForPresentation({ id: 'p1' })
    expect(mockXprops.openExportModalForPresentation).toHaveBeenCalledWith({ id: 'p1' })
  })

  it('actions are safe when xprops is undefined', () => {
    delete (window as any).xprops
    const plugin = createReportPlugin()
    expect(() => plugin.trackGA4AndMixpanel('ev', {})).not.toThrow()
    expect(() => plugin.replaceRoute({})).not.toThrow()
  })

  it('destroy cleans up', () => {
    const plugin = createReportPlugin()
    plugin.init()
    expect(() => plugin.destroy()).not.toThrow()
  })
})
