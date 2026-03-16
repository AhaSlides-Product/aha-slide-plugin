import { Observable } from './observable'
import { _createPluginBaseInternals } from './plugin-base'
import type { PresenterPlugin, PluginBaseOptions, ImageUploadResult, PluginKeyboardEvent, ConfirmModalPayload } from './types'

export function createPresenterPlugin(options: PluginBaseOptions = {}): PresenterPlugin {
  const opts: PluginBaseOptions = { autoHeight: false, ...options }
  const base = _createPluginBaseInternals(opts)
  const { xprops } = base

  const currentUserObs = new Observable<Record<string, any> | undefined>(xprops?.currentUser)

  return {
    ...base.baseProps(),

    // Additional state
    getCurrentUser: () => currentUserObs.get(),
    onCurrentUserChange: (fn) => currentUserObs.subscribe(fn),

    // Presenter-specific actions
    async getSlideAttributes(slideId?) {
      const response = await xprops?.getSlideAttributesAction?.(slideId)
      if (Array.isArray(response)) {
        return response.reduce((acc: Record<string, any>, item: any) => {
          if (item?.type) acc[item.type] = item.attributes
          return acc
        }, {})
      }
      return response ?? {}
    },

    upsertSlideAttribute(payload) {
      return xprops?.upsertSlideAttributeAction?.(payload) ?? Promise.resolve()
    },

    uploadImage(file: File) {
      return xprops?.uploadImage?.(file) ?? Promise.resolve({ path: '', url: '' })
    },

    openUploadImageModal() {
      return xprops?.openUploadImageModal?.() ?? Promise.resolve({ path: '', url: '' })
    },

    openEditImageModal(currentImageUrl: string) {
      return xprops?.openEditImageModal?.(currentImageUrl) ?? Promise.resolve({ path: '', url: '' })
    },

    onKeyboard(callback: (event: PluginKeyboardEvent) => void) {
      xprops?.onKeyboard?.(callback)
    },

    emitKeyboardEvent(event: PluginKeyboardEvent) {
      xprops?.emitKeyboardEvent?.(event)
    },

    showToastInfo(text, uniqName?, action?, options?) {
      xprops?.showToastInfo?.(text, uniqName, action, options)
    },

    showToastSuccess(text, uniqName?, action?, options?) {
      xprops?.showToastSuccess?.(text, uniqName, action, options)
    },

    showToastError(text, uniqName?, action?, options?) {
      xprops?.showToastError?.(text, uniqName, action, options)
    },

    setSubmissionCount(payload) {
      xprops?.sendVoteOutcome?.({ voteCount: payload.count, tooltip: payload.tooltip })
    },

    openPluginModal(path?) {
      xprops?.openPluginModal?.(path)
    },

    closePluginModal() {
      xprops?.closePluginModal?.()
    },

    showConfirmModal(payload: ConfirmModalPayload) {
      return xprops?.showConfirmModal?.(payload) ?? Promise.resolve(false)
    },

    clearSlideData(slideId: string) {
      return xprops?.clearSlideData?.(slideId) ?? Promise.resolve()
    },

    allowPDFRender() {
      xprops?.allowPDFRender?.()
    },

    getAccessToken() {
      return xprops?.token
    },

    // Lifecycle
    init() {
      base.initBase((props) => {
        if ('currentUser' in props) currentUserObs.set(props.currentUser)
      })
    },

    destroy() {
      base.destroyBase(currentUserObs)
    },
  }
}
