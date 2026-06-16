import type { SlidePluginProps } from './presenter'

function xprops(): SlidePluginProps {
  if (typeof window === 'undefined') return {} as SlidePluginProps
  return ((window as { xprops?: SlidePluginProps }).xprops ?? {}) as SlidePluginProps
}

/**
 * Plugin → host: forward a captured thumbnail data URL.
 * No-ops gracefully if the host did not provide the action (e.g. flag off, older host).
 */
export function sendThumbnail(dataUrl: string): void {
  const fn = xprops().setSlideThumbnail
  if (typeof fn === 'function') fn(dataUrl)
}

/**
 * Register a callback the host invokes (before unmount / on switch-away)
 * to request the plugin capture its current thumbnail.
 * No-ops gracefully if the host did not provide the hook.
 */
export function registerThumbnailCaptureRequest(callback: () => void): void {
  const fn = xprops().onRequestThumbnailCapture
  if (typeof fn === 'function') fn(callback)
}
