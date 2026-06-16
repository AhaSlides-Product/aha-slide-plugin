import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendThumbnail, registerThumbnailCaptureRequest } from '../thumbnail'

afterEach(() => {
  ;(window as any).xprops = undefined
})

describe('sendThumbnail', () => {
  it('forwards data url to xprops.setSlideThumbnail', () => {
    const setSlideThumbnail = vi.fn()
    ;(window as any).xprops = { setSlideThumbnail }
    sendThumbnail('data:image/png;base64,AAA')
    expect(setSlideThumbnail).toHaveBeenCalledWith('data:image/png;base64,AAA')
  })

  it('no-ops when xprops missing', () => {
    ;(window as any).xprops = undefined
    expect(() => sendThumbnail('data:image/png;base64,AAA')).not.toThrow()
  })

  it('no-ops when setSlideThumbnail is not provided', () => {
    ;(window as any).xprops = {}
    expect(() => sendThumbnail('data:image/png;base64,AAA')).not.toThrow()
  })
})

describe('registerThumbnailCaptureRequest', () => {
  it('wires host callback via onRequestThumbnailCapture', () => {
    const onRequestThumbnailCapture = vi.fn()
    ;(window as any).xprops = { onRequestThumbnailCapture }
    const cb = vi.fn()
    registerThumbnailCaptureRequest(cb)
    expect(onRequestThumbnailCapture).toHaveBeenCalledWith(cb)
  })

  it('no-ops when onRequestThumbnailCapture is not provided', () => {
    ;(window as any).xprops = {}
    const cb = vi.fn()
    expect(() => registerThumbnailCaptureRequest(cb)).not.toThrow()
  })

  it('no-ops when xprops is missing', () => {
    ;(window as any).xprops = undefined
    expect(() => registerThumbnailCaptureRequest(() => {})).not.toThrow()
  })
})
