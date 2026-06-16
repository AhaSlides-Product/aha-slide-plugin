import type { Ref } from 'vue'
import { toPng } from 'html-to-image'
import { sendThumbnail, registerThumbnailCaptureRequest } from '@aha/ui-vanilla'

export interface ThumbnailCaptureOptions {
  /** Longest-edge pixel budget for the captured image. Default 320. */
  maxWidth?: number
  /** Capture quality 0..1 (applies to lossy encodes). Default 0.9. */
  quality?: number
}

/**
 * Capture the given node to a PNG data URL and send it to the host.
 * Auto-registers a host capture-request handler (fired on switch-away/unmount).
 * Call `capture()` yourself on save to refresh proactively.
 *
 * @param node - Ref to the root HTMLElement to capture.
 * @param options - Optional capture settings.
 */
export function useThumbnailCapture(
  node: Ref<HTMLElement | null>,
  options: ThumbnailCaptureOptions = {},
) {
  const { maxWidth = 320, quality = 0.9 } = options

  async function capture(): Promise<void> {
    const el = node.value
    if (!el) return
    try {
      const rect = el.getBoundingClientRect()
      const pixelRatio = rect.width > 0 ? Math.min(1, maxWidth / rect.width) : 1
      const dataUrl = await toPng(el, { pixelRatio, quality, cacheBust: true })
      sendThumbnail(dataUrl)
    } catch {
      // Capture is best-effort; failures fall back to the icon. Never throw.
    }
  }

  // Register the host capture-request hook immediately so it works both inside
  // and outside a Vue component's setup() context.
  registerThumbnailCaptureRequest(() => { void capture() })

  return { capture }
}
