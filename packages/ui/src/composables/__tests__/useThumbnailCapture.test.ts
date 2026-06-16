import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const toPng = vi.fn(async () => 'data:image/png;base64,ZZZ')
const sendThumbnail = vi.fn()
const registerThumbnailCaptureRequest = vi.fn()

vi.mock('html-to-image', () => ({ toPng: (node: HTMLElement, opts?: object) => toPng(node, opts) }))
vi.mock('@aha/ui-vanilla', () => ({ sendThumbnail, registerThumbnailCaptureRequest }))

// Import after mocks are declared
const { useThumbnailCapture } = await import('../useThumbnailCapture')

afterEach(() => vi.clearAllMocks())

describe('useThumbnailCapture', () => {
  it('capture() snapshots the node and sends the data url', async () => {
    const el = document.createElement('div')
    const target = ref<HTMLElement | null>(el)
    const { capture } = useThumbnailCapture(target)
    await capture()
    expect(toPng).toHaveBeenCalledWith(el, expect.any(Object))
    expect(sendThumbnail).toHaveBeenCalledWith('data:image/png;base64,ZZZ')
  })

  it('capture() no-ops when node is null', async () => {
    const target = ref<HTMLElement | null>(null)
    const { capture } = useThumbnailCapture(target)
    await capture()
    expect(toPng).not.toHaveBeenCalled()
    expect(sendThumbnail).not.toHaveBeenCalled()
  })

  it('registers a capture-request handler on setup', () => {
    const target = ref<HTMLElement | null>(document.createElement('div'))
    useThumbnailCapture(target)
    expect(registerThumbnailCaptureRequest).toHaveBeenCalledWith(expect.any(Function))
  })

  it('capture swallows html-to-image errors', async () => {
    toPng.mockRejectedValueOnce(new Error('taint'))
    const target = ref<HTMLElement | null>(document.createElement('div'))
    const { capture } = useThumbnailCapture(target)
    await expect(capture()).resolves.toBeUndefined()
    expect(sendThumbnail).not.toHaveBeenCalled()
  })

  it('passes pixelRatio based on element width relative to maxWidth', async () => {
    const el = document.createElement('div')
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      width: 640, height: 360,
      top: 0, left: 0, right: 640, bottom: 360,
      x: 0, y: 0,
      toJSON: () => ({}),
    })
    const target = ref<HTMLElement | null>(el)
    const { capture } = useThumbnailCapture(target, { maxWidth: 320 })
    await capture()
    expect(toPng).toHaveBeenCalledWith(el, expect.objectContaining({ pixelRatio: 0.5 }))
  })

  it('calls registerThumbnailCaptureRequest exactly once per useThumbnailCapture call', () => {
    const target = ref<HTMLElement | null>(document.createElement('div'))
    useThumbnailCapture(target)
    expect(registerThumbnailCaptureRequest).toHaveBeenCalledTimes(1)
  })
})
