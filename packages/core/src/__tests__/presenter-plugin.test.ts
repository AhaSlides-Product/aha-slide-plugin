import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPresenterPlugin } from '../presenter-plugin'

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || MockResizeObserver

describe('createPresenterPlugin', () => {
  let mockXprops: Record<string, any>

  beforeEach(() => {
    mockXprops = {
      presentation: { id: 'p1' },
      slide: { id: 's1' },
      baseUrl: 'https://ahaslides.com',
      presentationColorPalette: ['#ff0000'],
      presentationLighterColorPalette: ['#ff8888'],
      currentUser: { presenterLanguage: 'en' },
      token: 'test-token',
      onProps: vi.fn(),
      onHeightChange: vi.fn(),
      getSlideAttributesAction: vi.fn(),
      upsertSlideAttributeAction: vi.fn().mockResolvedValue({}),
      uploadImage: vi.fn().mockResolvedValue({ path: '/img', url: 'http://img' }),
      openUploadImageModal: vi.fn().mockResolvedValue({ path: '/img2', url: 'http://img2' }),
      openEditImageModal: vi.fn().mockResolvedValue({ path: '/img3', url: 'http://img3' }),
      onKeyboard: vi.fn(),
      emitKeyboardEvent: vi.fn(),
      showToastInfo: vi.fn(),
      showToastSuccess: vi.fn(),
      showToastError: vi.fn(),
      sendVoteOutcome: vi.fn(),
      openPluginModal: vi.fn(),
      closePluginModal: vi.fn(),
      showConfirmModal: vi.fn().mockResolvedValue(true),
      clearSlideData: vi.fn().mockResolvedValue(undefined),
      allowPDFRender: vi.fn(),
      subscribeTopic: vi.fn(),
      unsubscribeTopic: vi.fn(),
      trackGA4AndMixpanel: vi.fn(),
      getValues: vi.fn().mockResolvedValue([]),
    }
    ;(window as any).xprops = mockXprops
  })

  afterEach(() => {
    delete (window as any).xprops
  })

  it('default autoHeight is false — calls onHeightChange(null)', () => {
    const plugin = createPresenterPlugin()
    plugin.init()
    expect(mockXprops.onHeightChange).toHaveBeenCalledWith(null)
  })

  it('reads initial state including currentUser', () => {
    const plugin = createPresenterPlugin()
    expect(plugin.getPresentation()).toEqual({ id: 'p1' })
    expect(plugin.getCurrentUser()).toEqual({ presenterLanguage: 'en' })
  })

  it('init() routes currentUser changes via onProps', () => {
    const plugin = createPresenterPlugin()
    plugin.init()
    const onPropsCallback = mockXprops.onProps.mock.calls[0][0]
    onPropsCallback({ currentUser: { presenterLanguage: 'vi' } })
    expect(plugin.getCurrentUser()).toEqual({ presenterLanguage: 'vi' })
  })

  it('onCurrentUserChange subscription works', () => {
    const plugin = createPresenterPlugin()
    const fn = vi.fn()
    plugin.onCurrentUserChange(fn)
    plugin.init()
    const cb = mockXprops.onProps.mock.calls[0][0]
    cb({ currentUser: { presenterLanguage: 'fr' } })
    expect(fn).toHaveBeenCalledWith({ presenterLanguage: 'fr' })
  })

  it('getSlideAttributes reduces array response to object', async () => {
    mockXprops.getSlideAttributesAction.mockResolvedValue([
      { type: 'color', attributes: { hex: '#fff' } },
      { type: 'font', attributes: { family: 'Arial' } },
      null,
    ])
    const plugin = createPresenterPlugin()
    const result = await plugin.getSlideAttributes()
    expect(result).toEqual({
      color: { hex: '#fff' },
      font: { family: 'Arial' },
    })
  })

  it('getSlideAttributes returns object response as-is', async () => {
    mockXprops.getSlideAttributesAction.mockResolvedValue({ custom: 'data' })
    const plugin = createPresenterPlugin()
    const result = await plugin.getSlideAttributes()
    expect(result).toEqual({ custom: 'data' })
  })

  it('setSubmissionCount calls sendVoteOutcome with mapped payload', () => {
    const plugin = createPresenterPlugin()
    plugin.setSubmissionCount({ count: 5, tooltip: 'votes' })
    expect(mockXprops.sendVoteOutcome).toHaveBeenCalledWith({ voteCount: 5, tooltip: 'votes' })
  })

  it('getAccessToken returns xprops.token', () => {
    const plugin = createPresenterPlugin()
    expect(plugin.getAccessToken()).toBe('test-token')
  })

  it('action pass-throughs call xprops functions', () => {
    const plugin = createPresenterPlugin()
    const cb = vi.fn()
    plugin.onKeyboard(cb)
    expect(mockXprops.onKeyboard).toHaveBeenCalledWith(cb)

    plugin.emitKeyboardEvent({ key: 'a', code: 'KeyA', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, repeat: false, location: 0, keyCode: 65 })
    expect(mockXprops.emitKeyboardEvent).toHaveBeenCalled()

    plugin.showToastInfo('hi')
    expect(mockXprops.showToastInfo).toHaveBeenCalledWith('hi', undefined, undefined, undefined)

    plugin.showToastSuccess('ok')
    expect(mockXprops.showToastSuccess).toHaveBeenCalled()

    plugin.showToastError('err')
    expect(mockXprops.showToastError).toHaveBeenCalled()

    plugin.openPluginModal('/path')
    expect(mockXprops.openPluginModal).toHaveBeenCalledWith('/path')

    plugin.closePluginModal()
    expect(mockXprops.closePluginModal).toHaveBeenCalled()

    plugin.allowPDFRender()
    expect(mockXprops.allowPDFRender).toHaveBeenCalled()
  })

  it('actions are safe when xprops is undefined', () => {
    delete (window as any).xprops
    const plugin = createPresenterPlugin()
    expect(() => plugin.showToastInfo('test')).not.toThrow()
    expect(() => plugin.setSubmissionCount({ count: 1 })).not.toThrow()
    expect(plugin.getAccessToken()).toBeUndefined()
  })

  it('destroy cleans up', () => {
    const plugin = createPresenterPlugin()
    plugin.init()
    expect(() => plugin.destroy()).not.toThrow()
  })
})
