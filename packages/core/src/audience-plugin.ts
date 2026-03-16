import { Observable } from './observable'
import { _createPluginBaseInternals } from './plugin-base'
import type { AudiencePlugin, PluginBaseOptions, ParticipantInfo } from './types'

export function createAudiencePlugin(options: PluginBaseOptions = {}): AudiencePlugin {
  const opts: PluginBaseOptions = { autoHeight: true, ...options }
  const base = _createPluginBaseInternals(opts)
  const { xprops } = base

  const slideAttributesObs = new Observable<Record<string, any> | undefined>(xprops?.slideAttributes)
  const audienceNameObs = new Observable<string | undefined>(xprops?.audience?.audienceName)
  const audienceEmojiObs = new Observable<string | undefined>(xprops?.audience?.audienceEmoji)
  const audienceIdObs = new Observable<string | number | undefined>(xprops?.audience?.audienceId)
  const audienceEmailObs = new Observable<string | undefined>(xprops?.audience?.audienceEmail)
  const audienceTeamObs = new Observable<string | undefined>(xprops?.audience?.audienceTeam)
  const participantInfoObs = new Observable<ParticipantInfo[] | undefined>(xprops?.audience?.participantInfo)
  const timeLimitObs = new Observable<number | null | undefined>(xprops?.timeLimit)

  return {
    ...base.baseProps(),

    // Additional state
    getSlideAttributes: () => slideAttributesObs.get(),
    getAudienceName: () => audienceNameObs.get(),
    getAudienceEmoji: () => audienceEmojiObs.get(),
    getAudienceId: () => audienceIdObs.get(),
    getAudienceEmail: () => audienceEmailObs.get(),
    getAudienceTeam: () => audienceTeamObs.get(),
    getParticipantInfo: () => participantInfoObs.get(),
    getTimeLimit: () => timeLimitObs.get(),

    // Subscriptions
    onSlideAttributesChange: (fn) => slideAttributesObs.subscribe(fn),
    onAudienceNameChange: (fn) => audienceNameObs.subscribe(fn),
    onAudienceEmojiChange: (fn) => audienceEmojiObs.subscribe(fn),
    onAudienceIdChange: (fn) => audienceIdObs.subscribe(fn),
    onAudienceEmailChange: (fn) => audienceEmailObs.subscribe(fn),
    onAudienceTeamChange: (fn) => audienceTeamObs.subscribe(fn),
    onParticipantInfoChange: (fn) => participantInfoObs.subscribe(fn),
    onTimeLimitChange: (fn) => timeLimitObs.subscribe(fn),

    // Actions
    uploadImage() {
      return xprops?.uploadImage?.() ?? Promise.resolve(undefined)
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
    updateAudienceData(payload) {
      xprops?.updateAudienceData?.(payload)
    },
    openPluginModal(path?, data?) {
      xprops?.openPluginModal?.(path, data)
    },
    closePluginModal() {
      xprops?.closePluginModal?.()
    },
    onSubmitButtonHeightChange(height) {
      xprops?.onSubmitButtonHeightChange?.(height)
    },
    scrollTo(yOffset) {
      xprops?.scrollTo?.(yOffset)
    },

    // Lifecycle
    init() {
      base.initBase((props) => {
        if ('slideAttributes' in props) slideAttributesObs.set(props.slideAttributes)
        if ('timeLimit' in props) timeLimitObs.set(props.timeLimit)
        if (props.audience) {
          const a = props.audience
          if ('audienceName' in a) audienceNameObs.set(a.audienceName)
          if ('audienceEmoji' in a) audienceEmojiObs.set(a.audienceEmoji)
          if ('audienceId' in a) audienceIdObs.set(a.audienceId)
          if ('audienceEmail' in a) audienceEmailObs.set(a.audienceEmail)
          if ('audienceTeam' in a) audienceTeamObs.set(a.audienceTeam)
          if ('participantInfo' in a) participantInfoObs.set(a.participantInfo)
        }
      })
    },

    destroy() {
      base.destroyBase(
        slideAttributesObs,
        audienceNameObs,
        audienceEmojiObs,
        audienceIdObs,
        audienceEmailObs,
        audienceTeamObs,
        participantInfoObs,
        timeLimitObs,
      )
    },
  }
}
