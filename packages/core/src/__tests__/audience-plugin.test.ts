import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAudiencePlugin } from '../audience-plugin'

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || MockResizeObserver

describe('createAudiencePlugin', () => {
  let mockXprops: Record<string, any>

  beforeEach(() => {
    mockXprops = {
      presentation: { id: 'p1' },
      slide: { id: 's1' },
      baseUrl: 'https://ahaslides.com',
      presentationColorPalette: ['#ff0000'],
      presentationLighterColorPalette: ['#ff8888'],
      audience: {
        audienceName: 'Alice',
        audienceEmoji: '🎉',
        audienceId: 'a1',
        audienceEmail: 'alice@test.com',
        audienceTeam: 'Team A',
        participantInfo: [{ type: 'phone', value: '123' }],
      },
      slideAttributes: { color: { hex: '#fff' } },
      timeLimit: 30,
      onProps: vi.fn(),
      onHeightChange: vi.fn(),
      uploadImage: vi.fn().mockResolvedValue({ url: 'http://img' }),
      showToastInfo: vi.fn(),
      showToastSuccess: vi.fn(),
      showToastError: vi.fn(),
      updateAudienceData: vi.fn(),
      openPluginModal: vi.fn(),
      closePluginModal: vi.fn(),
      onSubmitButtonHeightChange: vi.fn(),
      scrollTo: vi.fn(),
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

  it('default autoHeight is true — does not call onHeightChange(null)', () => {
    const plugin = createAudiencePlugin()
    plugin.init()
    // autoHeight true means autoReportHeight is called, not onHeightChange(null)
    expect(mockXprops.onHeightChange).not.toHaveBeenCalledWith(null)
  })

  it('reads initial audience state from xprops', () => {
    const plugin = createAudiencePlugin()
    expect(plugin.getAudienceName()).toBe('Alice')
    expect(plugin.getAudienceEmoji()).toBe('🎉')
    expect(plugin.getAudienceId()).toBe('a1')
    expect(plugin.getAudienceEmail()).toBe('alice@test.com')
    expect(plugin.getAudienceTeam()).toBe('Team A')
    expect(plugin.getParticipantInfo()).toEqual([{ type: 'phone', value: '123' }])
    expect(plugin.getSlideAttributes()).toEqual({ color: { hex: '#fff' } })
    expect(plugin.getTimeLimit()).toBe(30)
  })

  it('init() routes audience changes via onProps', () => {
    const plugin = createAudiencePlugin()
    plugin.init()
    const cb = mockXprops.onProps.mock.calls[0][0]

    cb({ audience: { audienceName: 'Bob' } })
    expect(plugin.getAudienceName()).toBe('Bob')

    cb({ slideAttributes: { font: 'Arial' } })
    expect(plugin.getSlideAttributes()).toEqual({ font: 'Arial' })

    cb({ timeLimit: 60 })
    expect(plugin.getTimeLimit()).toBe(60)
  })

  it('subscriptions fire on state changes', () => {
    const plugin = createAudiencePlugin()
    const fn = vi.fn()
    plugin.onAudienceNameChange(fn)
    plugin.init()
    const cb = mockXprops.onProps.mock.calls[0][0]
    cb({ audience: { audienceName: 'Charlie' } })
    expect(fn).toHaveBeenCalledWith('Charlie')
  })

  it('action pass-throughs work', () => {
    const plugin = createAudiencePlugin()

    plugin.showToastInfo('hi')
    expect(mockXprops.showToastInfo).toHaveBeenCalled()

    plugin.updateAudienceData({ audienceName: 'New' })
    expect(mockXprops.updateAudienceData).toHaveBeenCalledWith({ audienceName: 'New' })

    plugin.openPluginModal('/path', { key: 'val' })
    expect(mockXprops.openPluginModal).toHaveBeenCalledWith('/path', { key: 'val' })

    plugin.closePluginModal()
    expect(mockXprops.closePluginModal).toHaveBeenCalled()

    plugin.onSubmitButtonHeightChange(100)
    expect(mockXprops.onSubmitButtonHeightChange).toHaveBeenCalledWith(100)

    plugin.scrollTo(200)
    expect(mockXprops.scrollTo).toHaveBeenCalledWith(200)
  })

  it('actions are safe when xprops is undefined', () => {
    delete (window as any).xprops
    const plugin = createAudiencePlugin()
    expect(() => plugin.showToastInfo('test')).not.toThrow()
    expect(() => plugin.scrollTo(0)).not.toThrow()
  })

  it('destroy cleans up', () => {
    const plugin = createAudiencePlugin()
    plugin.init()
    expect(() => plugin.destroy()).not.toThrow()
  })
})
