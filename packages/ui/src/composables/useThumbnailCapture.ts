import { getCurrentInstance, onUnmounted, type Ref } from 'vue'
import { toPng } from 'html-to-image'
import { sendThumbnail, registerThumbnailCaptureRequest } from '@aha/ui-vanilla'

export interface ThumbnailCaptureOptions {
  /** Width pixel budget for the captured image (height scales with the element's aspect ratio). Default 320. */
  maxWidth?: number
  /** Reserved for a future lossy (JPEG/WebP) encode path; currently unused by the PNG capture. */
  quality?: number
}

/**
 * Capture the given node to a PNG data URL and send it to the host.
 * Auto-registers a host capture-request handler (fired on switch-away/unmount)
 * and unregisters it when the owning component unmounts.
 * Call `capture()` yourself on save to refresh proactively.
 *
 * @param node - Ref to the root HTMLElement to capture.
 * @param options - Optional capture settings.
 */
export function useThumbnailCapture(
  node: Ref<HTMLElement | null>,
  options: ThumbnailCaptureOptions = {},
) {
  const { maxWidth = 320 } = options

  async function capture(): Promise<void> {
    const el = node.value
    if (!el) return
    try {
      const rect = el.getBoundingClientRect()
      // Hidden / not-yet-laid-out element: a 0-dimension capture could succeed
      // as a blank image and overwrite a good thumbnail on the host. Skip it.
      if (rect.width === 0 || rect.height === 0) return
      const pixelRatio = Math.min(1, maxWidth / rect.width)
      const dataUrl = await toPng(el, { pixelRatio, cacheBust: true })
      sendThumbnail(dataUrl)
    } catch {
      // Capture is best-effort; failures fall back to the icon. Never throw.
    }
  }

  // Register the host capture-request hook immediately so it works both inside
  // and outside a Vue component's setup() context. Returning the promise lets a
  // host that awaits the callback finish the capture before tearing down.
  registerThumbnailCaptureRequest(() => capture())

  // Inside a component, drop the host's reference on unmount: the closure
  // retains the element ref, and a stale callback would capture a dead node.
  if (getCurrentInstance()) {
    onUnmounted(() => {
      registerThumbnailCaptureRequest(() => {})
    })
  }

  return { capture }
}
