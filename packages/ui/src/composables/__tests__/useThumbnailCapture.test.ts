import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const toPng = vi.fn(async () => 'data:image/png;base64,ZZZ')
const sendThumbnail = vi.fn()
const registerThumbnailCaptureRequest = vi.fn()

vi.mock('html-to-image', () => ({ toPng: (node: HTMLElement, opts?: object) => toPng(node, opts) }))
vi.mock('@aha/ui-vanilla', () => ({ sendThumbnail, registerThumbnailCaptureRequest }))

// Import after mocks are declared
const { useThumbnailCapture } = await import('../useThumbnailCapture')

// happy-dom elements measure 0×0 and the composable skips zero-dimension
// captures by design — give measurable tests a real-looking rect.
function withRect(el: HTMLElement, width = 640, height = 360) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    width, height,
    top: 0, left: 0, right: width, bottom: height,
    x: 0, y: 0,
    toJSON: () => ({}),
  } as DOMRect)
  return el
}

afterEach(() => vi.clearAllMocks())

describe('useThumbnailCapture', () => {
  it('capture() snapshots the node and sends the data url', async () => {
    const el = withRect(document.createElement('div'))
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
    const target = ref<HTMLElement | null>(withRect(document.createElement('div')))
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

  it('skips capture for zero-dimension (hidden) elements', async () => {
    const el = document.createElement('div')
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      width: 0, height: 0,
      top: 0, left: 0, right: 0, bottom: 0,
      x: 0, y: 0,
      toJSON: () => ({}),
    })
    const target = ref<HTMLElement | null>(el)
    const { capture } = useThumbnailCapture(target)
    await capture()
    expect(toPng).not.toHaveBeenCalled()
    expect(sendThumbnail).not.toHaveBeenCalled()
  })

  it('the registered capture-request callback returns the capture promise', async () => {
    const el = withRect(document.createElement('div'))
    const target = ref<HTMLElement | null>(el)
    useThumbnailCapture(target)
    const registered = registerThumbnailCaptureRequest.mock.calls[0][0] as () => Promise<void>
    await registered()
    expect(sendThumbnail).toHaveBeenCalledWith('data:image/png;base64,ZZZ')
  })

  it('replaces the host callback with a no-op on component unmount', async () => {
    const { defineComponent, h, createApp } = await import('vue')
    const el = document.createElement('div')
    const target = ref<HTMLElement | null>(el)
    const Comp = defineComponent({
      setup() {
        useThumbnailCapture(target)
        return () => h('div')
      },
    })
    const host = document.createElement('div')
    const app = createApp(Comp)
    app.mount(host)
    expect(registerThumbnailCaptureRequest).toHaveBeenCalledTimes(1)
    app.unmount()
    expect(registerThumbnailCaptureRequest).toHaveBeenCalledTimes(2)
    const replacement = registerThumbnailCaptureRequest.mock.calls[1][0] as () => void
    replacement()
    expect(toPng).not.toHaveBeenCalled()
  })
})
