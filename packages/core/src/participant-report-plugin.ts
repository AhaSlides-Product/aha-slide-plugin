import { Observable } from './observable'
import { autoReportHeight, reportHeight } from './height'
import type { ParticipantReportPlugin, PluginBaseOptions } from './types'

export function createParticipantReportPlugin(options: PluginBaseOptions = {}): ParticipantReportPlugin {
  const opts: PluginBaseOptions = { autoHeight: true, ...options }
  const xprops = (window as any).xprops as Record<string, any> | undefined

  const answersObs = new Observable<any[] | undefined>(xprops?.answers)
  const imageUrlObs = new Observable<string | undefined>(xprops?.imageUrl)
  const presentationColorPaletteObs = new Observable<object | undefined>(xprops?.presentationColorPalette)

  let heightCleanup: (() => void) | null = null

  return {
    getAnswers: () => answersObs.get(),
    getImageUrl: () => imageUrlObs.get(),
    getPresentationColorPalette: () => presentationColorPaletteObs.get(),

    onAnswersChange: (fn) => answersObs.subscribe(fn),
    onImageUrlChange: (fn) => imageUrlObs.subscribe(fn),
    onPresentationColorPaletteChange: (fn) => presentationColorPaletteObs.subscribe(fn),

    reportHeight() {
      reportHeight()
    },

    init() {
      if (xprops && typeof xprops.onProps === 'function') {
        xprops.onProps((props: Record<string, any>) => {
          if ('answers' in props) answersObs.set(props.answers)
          if ('imageUrl' in props) imageUrlObs.set(props.imageUrl)
          if ('presentationColorPalette' in props) presentationColorPaletteObs.set(props.presentationColorPalette)
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
      answersObs.destroy()
      imageUrlObs.destroy()
      presentationColorPaletteObs.destroy()
    },
  }
}
