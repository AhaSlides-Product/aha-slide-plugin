import { Observable } from './observable'
import { autoReportHeight, reportHeight } from './height'
import type { ReportPlugin, PluginBaseOptions } from './types'

export function createReportPlugin(options: PluginBaseOptions = {}): ReportPlugin {
  const opts: PluginBaseOptions = { autoHeight: true, ...options }
  const xprops = (window as any).xprops as Record<string, any> | undefined

  const tokenObs = new Observable<string | undefined>(xprops?.token)
  const currentLanguageObs = new Observable<string | undefined>(xprops?.currentLanguage)
  const localeObs = new Observable<string | undefined>(xprops?.locale)
  const translationMapObs = new Observable<Record<string, string> | undefined>(xprops?.translationMap)
  const featureFlagsObs = new Observable<Record<string, string> | undefined>(xprops?.featureFlags)
  const iframePathObs = new Observable<string | undefined>(xprops?.iframePath)
  const currentUserObs = new Observable<object | undefined>(xprops?.currentUser)

  let heightCleanup: (() => void) | null = null

  return {
    // State
    getToken: () => tokenObs.get(),
    getCurrentLanguage: () => currentLanguageObs.get(),
    getLocale: () => localeObs.get(),
    getTranslationMap: () => translationMapObs.get(),
    getFeatureFlags: () => featureFlagsObs.get(),
    getIframePath: () => iframePathObs.get(),
    getCurrentUser: () => currentUserObs.get(),

    // Subscriptions
    onTokenChange: (fn) => tokenObs.subscribe(fn),
    onCurrentLanguageChange: (fn) => currentLanguageObs.subscribe(fn),
    onLocaleChange: (fn) => localeObs.subscribe(fn),
    onTranslationMapChange: (fn) => translationMapObs.subscribe(fn),
    onFeatureFlagsChange: (fn) => featureFlagsObs.subscribe(fn),
    onIframePathChange: (fn) => iframePathObs.subscribe(fn),
    onCurrentUserChange: (fn) => currentUserObs.subscribe(fn),

    // Actions
    trackGA4AndMixpanel(eventName: string, payload: any) {
      xprops?.trackGA4AndMixpanel?.(eventName, payload)
    },
    replaceRoute(location, onComplete?, onAbort?) {
      xprops?.replaceRoute?.(location, onComplete, onAbort)
    },
    pushRoute(location, onComplete?, onAbort?) {
      xprops?.pushRoute?.(location, onComplete, onAbort)
    },
    openExportModalForPresentation(presentation) {
      xprops?.openExportModalForPresentation?.(presentation)
    },
    reportHeight() {
      reportHeight()
    },

    // Lifecycle
    init() {
      if (xprops && typeof xprops.onProps === 'function') {
        xprops.onProps((props: Record<string, any>) => {
          if ('token' in props) tokenObs.set(props.token)
          if ('currentLanguage' in props) currentLanguageObs.set(props.currentLanguage)
          if ('locale' in props) localeObs.set(props.locale)
          if ('translationMap' in props) translationMapObs.set(props.translationMap)
          if ('featureFlags' in props) featureFlagsObs.set(props.featureFlags)
          if ('iframePath' in props) iframePathObs.set(props.iframePath)
          if ('currentUser' in props) currentUserObs.set(props.currentUser)
        })
      }

      if (opts.autoHeight) {
        const wrapperId = typeof opts.autoHeight === 'string' ? opts.autoHeight : undefined
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
      tokenObs.destroy()
      currentLanguageObs.destroy()
      localeObs.destroy()
      translationMapObs.destroy()
      featureFlagsObs.destroy()
      iframePathObs.destroy()
      currentUserObs.destroy()
    },
  }
}
