import { ref, type Ref } from 'vue';
import {
  useBaseSlidePlugin,
  type BaseSlidePluginReturn,
} from './base';
import {
  initZoidForAudience,
  type ParticipantInfo,
  type Team,
  type JoinGamePayload,
  type JoinGameResult,
  type UseSlidePluginOptions,
} from '@aha/ui-vanilla';

export type {
  AudienceSlidePluginProps,
  ParticipantInfo,
  Team,
  JoinGamePayload,
  JoinGameResult,
} from '@aha/ui-vanilla';

/**
 * AudienceSlidePluginIframe is a cross-domain component (zoid) that allows
 * Ahaslides parent applications to communicate with plugin iframes in the audience view.
 */
export const AudienceSlidePluginIframe = initZoidForAudience();

/**
 * Hook for Audience Plugins.
 * Provides access to presentation, slide, and slideAttributes data.
 *
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for presentation, slide, and slideAttributes props.
 */
export function useAudiencePlugin(options: UseSlidePluginOptions = { autoHeight: true }): BaseSlidePluginReturn & {
  slideAttributesProps: Ref<Record<string, any> | undefined>;
  currentUser: Ref<Record<string, any> | undefined>;
  isParticipantVerificationEnabled: Ref<boolean>;
  audienceName: Ref<string | undefined>;
  audienceEmoji: Ref<string | undefined>;
  audienceId: Ref<string | number | undefined>;
  audienceEmail: Ref<string | undefined>;
  audienceTeam: Ref<string | undefined>;
  audienceQuizTeam: Ref<string | number | undefined>;
  participantInfo: Ref<ParticipantInfo[] | undefined>;
  uploadImage: (() => Promise<any>) | undefined;
  /**
   * Upload a base64 `data:` image URL from the plugin iframe.
   */
  uploadImageData: ((dataUrl: string) => Promise<any>) | undefined;
  /**
   * Notify the host that this participant is (or has stopped) typing, so the
   * presenter shows its "… is typing" indicator. Call with `true` while typing
   * and `false` when the field is cleared/blurred or the answer is submitted.
   */
  emitTyping: ((isTyping: boolean) => void) | undefined;
  showToastInfo: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastSuccess: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastError: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  updateAudienceData: ((payload: {
    audienceName?: string;
    audienceEmail?: string;
    audienceEmoji?: string;
    participantInfo?: ParticipantInfo[];
  }) => void) | undefined;
  openPluginModal: ((path?: string, data?: any) => void) | undefined;
  closePluginModal: (() => void) | undefined;
  onSubmitButtonHeightChange: ((height: number) => void) | undefined;
  timeLimit: Ref<number | null | undefined>;
  /** False while the host holds the quiz in the game lobby (wait for Start); true once started or when there's no lobby. Defaults to true (fail-open). */
  autoStartGame: Ref<boolean>;
  scrollTo: ((yOffset: number) => void) | undefined;
  getWindowHeight: (() => Promise<number>) | undefined;
  /** Teams the audience can join (when team play is enabled on the host). */
  teams: Ref<Team[] | undefined>;
  /** Join the game/presentation as a participant; see {@link Team}. */
  joinGame: ((payload: JoinGamePayload) => Promise<JoinGameResult>) | undefined;
} {
  // Audience-specific reactive refs
  const xprops = (window as any).xprops;
  const slideAttributesProps = ref<Record<string, any> | undefined>(xprops?.slideAttributes);
  const currentUser = ref<Record<string, any> | undefined>(xprops?.currentUser);
  const isParticipantVerificationEnabled = ref<boolean>(xprops?.isParticipantVerificationEnabled ?? false);
  const audienceName = ref<string | undefined>(xprops?.audience?.audienceName);
  const audienceEmoji = ref<string | undefined>(xprops?.audience?.audienceEmoji);
  const audienceId = ref<string | number | undefined>(xprops?.audience?.audienceId);
  const audienceEmail = ref<string | undefined>(xprops?.audience?.audienceEmail);
  const audienceTeam = ref<string | undefined>(xprops?.audience?.audienceTeam);
  const audienceQuizTeam = ref<string | number | undefined>(xprops?.audience?.audienceQuizTeam);
  const participantInfo = ref<ParticipantInfo[] | undefined>(xprops?.audience?.participantInfo);
  const teams = ref<Team[] | undefined>(xprops?.teams);
  const joinGame = xprops?.joinGame;

  const uploadImage = xprops?.uploadImage;
  const uploadImageData = xprops?.uploadImageData;
  const emitTyping = xprops?.emitTyping;
  const showToastInfo = xprops?.showToastInfo;
  const showToastSuccess = xprops?.showToastSuccess;
  const showToastError = xprops?.showToastError;
  const updateAudienceData = xprops?.updateAudienceData;
  const openPluginModal = xprops?.openPluginModal;
  const closePluginModal = xprops?.closePluginModal;
  const onSubmitButtonHeightChange = xprops?.onSubmitButtonHeightChange;
  const timeLimit = ref<number | null | undefined>(xprops?.timeLimit);
  const autoStartGame = ref<boolean>(xprops?.autoStartGame ?? true);
  const scrollTo = xprops?.scrollTo;
  const getWindowHeight = xprops?.getWindowHeight;

  // Extension callback to handle audience-specific props
  const handleAudienceProps = (newProps: any) => {

    if (newProps.currentUser !== undefined) currentUser.value = newProps.currentUser;
    if (newProps.isParticipantVerificationEnabled !== undefined) isParticipantVerificationEnabled.value = newProps.isParticipantVerificationEnabled;
    if (newProps.slideAttributes) {
      slideAttributesProps.value = { ...newProps.slideAttributes };
      console.log('[handleAudienceProps] slideAttributesProps:', slideAttributesProps.value);
    }
    if (newProps.audience) {
      if (newProps.audience.audienceName !== undefined) audienceName.value = newProps.audience.audienceName;
      if (newProps.audience.audienceEmoji !== undefined) audienceEmoji.value = newProps.audience.audienceEmoji;
      if (newProps.audience.audienceId !== undefined) audienceId.value = newProps.audience.audienceId;
      if (newProps.audience.audienceEmail !== undefined) audienceEmail.value = newProps.audience.audienceEmail;
      if (newProps.audience.audienceTeam !== undefined) audienceTeam.value = newProps.audience.audienceTeam;
      if (newProps.audience.audienceQuizTeam !== undefined) audienceQuizTeam.value = newProps.audience.audienceQuizTeam;
      if (newProps.audience.participantInfo !== undefined) participantInfo.value = newProps.audience.participantInfo;
    }
    if (newProps.autoStartGame !== undefined) {
      autoStartGame.value = newProps.autoStartGame;
    } else if ('autoStartGame' in newProps) {
      autoStartGame.value = true;
    }
    if (newProps.timeLimit !== undefined) {
      timeLimit.value = newProps.timeLimit;
    }
    if (newProps.teams !== undefined) {
      // Guard against a non-array value arriving over the cross-domain bridge —
      // spreading a non-iterable would throw.
      teams.value = Array.isArray(newProps.teams) ? [...newProps.teams] : newProps.teams;
    }
  };

  const baseHook = useBaseSlidePlugin(options, handleAudienceProps);

  return {
    presentationProps: baseHook.presentationProps,
    presentationColorPaletteProps: baseHook.presentationColorPaletteProps,
    presentationLighterColorPaletteProps: baseHook.presentationLighterColorPaletteProps,
    slideProps: baseHook.slideProps,
    baseUrl: baseHook.baseUrl,
    subscribeTopic: baseHook.subscribeTopic,
    unsubscribeTopic: baseHook.unsubscribeTopic,
    slideAttributesProps,
    currentUser,
    isParticipantVerificationEnabled,
    audienceName,
    audienceEmoji,
    audienceId,
    audienceEmail,
    audienceTeam,
    audienceQuizTeam,
    uploadImage,
    uploadImageData,
    emitTyping,
    showToastInfo,
    showToastSuccess,
    showToastError,
    updateAudienceData,
    openPluginModal,
    closePluginModal,
    onSubmitButtonHeightChange,
    timeLimit,
    autoStartGame,
    scrollTo,
    getWindowHeight,
    participantInfo,
    teams,
    joinGame,
    reportHeight: baseHook.reportHeight,
    trackGA4AndMixpanel: baseHook.trackGA4AndMixpanel,
    getValues: baseHook.getValues,
    filterProfaneWords: baseHook.filterProfaneWords,
  };
}
