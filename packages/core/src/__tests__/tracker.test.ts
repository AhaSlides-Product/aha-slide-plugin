import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTracker } from '../tracker'

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit | undefined
  elements: Element[] = []

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    MockIntersectionObserver.instances.push(this)
  }

  observe(el: Element) {
    this.elements.push(el)
  }

  unobserve() {}

  disconnect() {
    this.elements = []
  }

  // Test helper: simulate intersection
  trigger(isIntersecting: boolean) {
    this.callback(
      this.elements.map((el) => ({ isIntersecting, target: el } as any)),
      this as any,
    )
  }

  static instances: MockIntersectionObserver[] = []
  static reset() {
    MockIntersectionObserver.instances = []
  }
}
;(globalThis as any).IntersectionObserver = MockIntersectionObserver

describe('createTracker', () => {
  let element: HTMLElement
  let mockTrackFn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    MockIntersectionObserver.reset()
    element = document.createElement('div')
    document.body.appendChild(element)
    mockTrackFn = vi.fn()
    ;(window as any).xprops = { trackGA4AndMixpanel: mockTrackFn }
  })

  afterEach(() => {
    document.body.removeChild(element)
    delete (window as any).xprops
  })

  it('tracks click events by default', () => {
    const tracker = createTracker({ element, name: 'button', otherInfo: 'save' })
    element.click()
    expect(mockTrackFn).toHaveBeenCalledWith('click_button_save', {
      eventAction: 'click_button_save',
    })
    tracker.destroy()
  })

  it('builds event name filtering empty parts', () => {
    const tracker = createTracker({ element })
    element.click()
    expect(mockTrackFn).toHaveBeenCalledWith('click', { eventAction: 'click' })
    tracker.destroy()
  })

  it('maps mouseenter to hover', () => {
    const tracker = createTracker({ element, events: ['mouseenter'], name: 'card' })
    element.dispatchEvent(new Event('mouseenter'))
    expect(mockTrackFn).toHaveBeenCalledWith('hover_card', { eventAction: 'hover_card' })
    tracker.destroy()
  })

  it('maps dblclick to double_click', () => {
    const tracker = createTracker({ element, events: ['dblclick'], name: 'item' })
    element.dispatchEvent(new Event('dblclick'))
    expect(mockTrackFn).toHaveBeenCalledWith('double_click_item', { eventAction: 'double_click_item' })
    tracker.destroy()
  })

  it('tracks focus and blur events', () => {
    const tracker = createTracker({ element, events: ['focus', 'blur'], name: 'input' })
    element.dispatchEvent(new Event('focus'))
    expect(mockTrackFn).toHaveBeenCalledWith('focus_input', { eventAction: 'focus_input' })
    element.dispatchEvent(new Event('blur'))
    expect(mockTrackFn).toHaveBeenCalledWith('blur_input', { eventAction: 'blur_input' })
    tracker.destroy()
  })

  it('uses IntersectionObserver for view events', () => {
    const tracker = createTracker({ element, events: ['view'], name: 'section' })
    expect(MockIntersectionObserver.instances).toHaveLength(1)
    const obs = MockIntersectionObserver.instances[0]
    expect(obs.options?.threshold).toBe(0.1)

    obs.trigger(true)
    expect(mockTrackFn).toHaveBeenCalledWith('view_section', { eventAction: 'view_section' })

    mockTrackFn.mockClear()
    obs.trigger(false)
    expect(mockTrackFn).not.toHaveBeenCalled()

    tracker.destroy()
  })

  it('includes customProps in tracked events', () => {
    const tracker = createTracker({ element, name: 'btn', customProps: { slideId: 's1' } })
    element.click()
    expect(mockTrackFn).toHaveBeenCalledWith('click_btn', {
      eventAction: 'click_btn',
      slideId: 's1',
    })
    tracker.destroy()
  })

  it('updateProps merges new props for subsequent events', () => {
    const tracker = createTracker({ element, name: 'btn', customProps: { a: 1 } })
    tracker.updateProps({ b: 2 })
    element.click()
    expect(mockTrackFn).toHaveBeenCalledWith('click_btn', {
      eventAction: 'click_btn',
      a: 1,
      b: 2,
    })
    tracker.destroy()
  })

  it('destroy removes event listeners', () => {
    const tracker = createTracker({ element, name: 'btn' })
    tracker.destroy()
    element.click()
    expect(mockTrackFn).not.toHaveBeenCalled()
  })

  it('destroy disconnects IntersectionObserver', () => {
    const tracker = createTracker({ element, events: ['view'], name: 'sec' })
    const obs = MockIntersectionObserver.instances[0]
    const disconnectSpy = vi.spyOn(obs, 'disconnect')
    tracker.destroy()
    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('is safe when xprops is undefined', () => {
    delete (window as any).xprops
    const tracker = createTracker({ element, name: 'btn' })
    expect(() => element.click()).not.toThrow()
    tracker.destroy()
  })
})
