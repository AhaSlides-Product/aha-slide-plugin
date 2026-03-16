import { Observable } from './observable'
import { autoReportHeight, reportHeight } from './height'
import type { PluginBase, PluginBaseOptions } from './types'

export function createPluginBase(options: PluginBaseOptions = {}): PluginBase {
  const xprops = (window as any).xprops as Record<string, any> | undefined

  const presentationObs = new Observable<Record<string, any> | undefined>(xprops?.presentation)
  const slideObs = new Observable<Record<string, any> | undefined>(xprops?.slide)
  const baseUrlObs = new Observable<string | undefined>(xprops?.baseUrl)
  const presentationColorPaletteObs = new Observable<string[] | undefined>(xprops?.presentationColorPalette)
  const presentationLighterColorPaletteObs = new Observable<string[] | undefined>(xprops?.presentationLighterColorPalette)

  let heightCleanup: (() => void) | null = null

  const plugin: PluginBase = {
    // State accessors
    getPresentation: () => presentationObs.get(),
    getSlide: () => slideObs.get(),
    getBaseUrl: () => baseUrlObs.get(),
    getPresentationColorPalette: () => presentationColorPaletteObs.get(),
    getPresentationLighterColorPalette: () => presentationLighterColorPaletteObs.get(),

    // State subscriptions
    onPresentationChange: (fn) => presentationObs.subscribe(fn),
    onSlideChange: (fn) => slideObs.subscribe(fn),
    onBaseUrlChange: (fn) => baseUrlObs.subscribe(fn),
    onPresentationColorPaletteChange: (fn) => presentationColorPaletteObs.subscribe(fn),
    onPresentationLighterColorPaletteChange: (fn) => presentationLighterColorPaletteObs.subscribe(fn),

    // Actions
    reportHeight() {
      reportHeight()
    },
    subscribeTopic(opts) {
      xprops?.subscribeTopic?.(opts)
    },
    unsubscribeTopic(topic) {
      xprops?.unsubscribeTopic?.(topic)
    },
    trackGA4AndMixpanel(payload) {
      xprops?.trackGA4AndMixpanel?.(payload)
    },
    getValues(params) {
      return xprops?.getValues?.(params) ?? Promise.resolve([])
    },

    // Lifecycle
    init() {
      if (xprops && typeof xprops.onProps === 'function') {
        xprops.onProps((props: Record<string, any>) => {
          if ('presentation' in props) presentationObs.set(props.presentation)
          if ('slide' in props) slideObs.set(props.slide)
          if ('baseUrl' in props) baseUrlObs.set(props.baseUrl)
          if ('presentationColorPalette' in props) presentationColorPaletteObs.set(props.presentationColorPalette)
          if ('presentationLighterColorPalette' in props) presentationLighterColorPaletteObs.set(props.presentationLighterColorPalette)
        })
      }

      if (options.autoHeight) {
        const wrapperId = typeof options.autoHeight === 'string' ? options.autoHeight : undefined
        heightCleanup = autoReportHeight(wrapperId)
      } else if (xprops && typeof xprops.onHeightChange === 'function') {
        xprops.onHeightChange(null)
      }
    },

    destroy() {
      if (heightCleanup) {
        heightCleanup()
        heightCleanup = null
      }
      presentationObs.destroy()
      slideObs.destroy()
      baseUrlObs.destroy()
      presentationColorPaletteObs.destroy()
      presentationLighterColorPaletteObs.destroy()
    },
  }

  return plugin
}

// Expose internal helpers for extending plugins
export function _createPluginBaseInternals(options: PluginBaseOptions = {}) {
  const xprops = (window as any).xprops as Record<string, any> | undefined

  const presentationObs = new Observable<Record<string, any> | undefined>(xprops?.presentation)
  const slideObs = new Observable<Record<string, any> | undefined>(xprops?.slide)
  const baseUrlObs = new Observable<string | undefined>(xprops?.baseUrl)
  const presentationColorPaletteObs = new Observable<string[] | undefined>(xprops?.presentationColorPalette)
  const presentationLighterColorPaletteObs = new Observable<string[] | undefined>(xprops?.presentationLighterColorPalette)

  let heightCleanup: (() => void) | null = null

  return {
    xprops,
    presentationObs,
    slideObs,
    baseUrlObs,
    presentationColorPaletteObs,
    presentationLighterColorPaletteObs,
    get heightCleanup() { return heightCleanup },
    set heightCleanup(val) { heightCleanup = val },
    options,

    baseProps(): Omit<PluginBase, 'init' | 'destroy'> {
      return {
        getPresentation: () => presentationObs.get(),
        getSlide: () => slideObs.get(),
        getBaseUrl: () => baseUrlObs.get(),
        getPresentationColorPalette: () => presentationColorPaletteObs.get(),
        getPresentationLighterColorPalette: () => presentationLighterColorPaletteObs.get(),
        onPresentationChange: (fn) => presentationObs.subscribe(fn),
        onSlideChange: (fn) => slideObs.subscribe(fn),
        onBaseUrlChange: (fn) => baseUrlObs.subscribe(fn),
        onPresentationColorPaletteChange: (fn) => presentationColorPaletteObs.subscribe(fn),
        onPresentationLighterColorPaletteChange: (fn) => presentationLighterColorPaletteObs.subscribe(fn),
        reportHeight() { reportHeight() },
        subscribeTopic(opts) { xprops?.subscribeTopic?.(opts) },
        unsubscribeTopic(topic) { xprops?.unsubscribeTopic?.(topic) },
        trackGA4AndMixpanel(payload) { xprops?.trackGA4AndMixpanel?.(payload) },
        getValues(params) { return xprops?.getValues?.(params) ?? Promise.resolve([]) },
      }
    },

    initBase(extraOnProps?: (props: Record<string, any>) => void) {
      if (xprops && typeof xprops.onProps === 'function') {
        xprops.onProps((props: Record<string, any>) => {
          if ('presentation' in props) presentationObs.set(props.presentation)
          if ('slide' in props) slideObs.set(props.slide)
          if ('baseUrl' in props) baseUrlObs.set(props.baseUrl)
          if ('presentationColorPalette' in props) presentationColorPaletteObs.set(props.presentationColorPalette)
          if ('presentationLighterColorPalette' in props) presentationLighterColorPaletteObs.set(props.presentationLighterColorPalette)
          extraOnProps?.(props)
        })
      }

      if (options.autoHeight) {
        const wrapperId = typeof options.autoHeight === 'string' ? options.autoHeight : undefined
        heightCleanup = autoReportHeight(wrapperId)
      } else if (xprops && typeof xprops.onHeightChange === 'function') {
        xprops.onHeightChange(null)
      }
    },

    destroyBase(...extraObs: { destroy(): void }[]) {
      if (heightCleanup) {
        heightCleanup()
        heightCleanup = null
      }
      presentationObs.destroy()
      slideObs.destroy()
      baseUrlObs.destroy()
      presentationColorPaletteObs.destroy()
      presentationLighterColorPaletteObs.destroy()
      extraObs.forEach(o => o.destroy())
    },
  }
}
