import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createParticipantReportPlugin } from '../participant-report-plugin'

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || MockResizeObserver

describe('createParticipantReportPlugin', () => {
  let mockXprops: Record<string, any>

  beforeEach(() => {
    mockXprops = {
      answers: [{ id: 1, text: 'A' }],
      imageUrl: 'http://img.png',
      presentationColorPalette: { primary: '#000' },
      onProps: vi.fn(),
      onHeightChange: vi.fn(),
    }
    ;(window as any).xprops = mockXprops
  })

  afterEach(() => {
    delete (window as any).xprops
  })

  it('reads initial state from xprops', () => {
    const plugin = createParticipantReportPlugin()
    expect(plugin.getAnswers()).toEqual([{ id: 1, text: 'A' }])
    expect(plugin.getImageUrl()).toBe('http://img.png')
    expect(plugin.getPresentationColorPalette()).toEqual({ primary: '#000' })
  })

  it('default autoHeight is true', () => {
    const plugin = createParticipantReportPlugin()
    plugin.init()
    expect(mockXprops.onHeightChange).not.toHaveBeenCalledWith(null)
  })

  it('init() registers onProps and routes updates', () => {
    const plugin = createParticipantReportPlugin()
    plugin.init()
    const cb = mockXprops.onProps.mock.calls[0][0]

    cb({ answers: [{ id: 2 }] })
    expect(plugin.getAnswers()).toEqual([{ id: 2 }])

    cb({ imageUrl: 'http://new.png' })
    expect(plugin.getImageUrl()).toBe('http://new.png')

    cb({ presentationColorPalette: { primary: '#fff' } })
    expect(plugin.getPresentationColorPalette()).toEqual({ primary: '#fff' })
  })

  it('subscriptions fire on changes', () => {
    const plugin = createParticipantReportPlugin()
    const fn = vi.fn()
    plugin.onAnswersChange(fn)
    plugin.init()
    const cb = mockXprops.onProps.mock.calls[0][0]
    cb({ answers: [{ id: 3 }] })
    expect(fn).toHaveBeenCalledWith([{ id: 3 }])
  })

  it('destroy cleans up', () => {
    const plugin = createParticipantReportPlugin()
    plugin.init()
    expect(() => plugin.destroy()).not.toThrow()
  })
})
