import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { createAudiencePlugin } from '@aha/core';
import type { ParticipantInfo } from '@aha/core';
import {
  BaseSlidePluginProps,
  UseSlidePluginOptions,
  BaseSlidePluginReturn,
} from './base';

/**
 * Interface for the properties expected by the AudienceSlidePluginIframe component.
 */
export interface AudienceSlidePluginProps extends BaseSlidePluginProps {
  presentation?: BaseSlidePluginProps['presentation'] & {
    /** The teamplay object used in the presentation */
    teamPlay?: Record<string, any>;
  };
  /** Audience information such as name, email, emoji, ID, and team. */
  audience?: {
    /** The name of the audience participant */
    audienceName?: string;
    /** The emoji chosen by the audience participant */
    audienceEmoji?: string;
    /** The unique identifier of the audience participant */
    audienceId?: string | number;
    /** The email of the audience participant */
    audienceEmail?: string;
    /** The team name of the audience participant */
    audienceTeam?: string;
  };
  /**
   * Custom attributes associated with the current slide.
   */
  slideAttributes?: Record<string, any>;
  /**
   * Action to upload an image from the plugin iframe.
   */
  uploadImage?: () => Promise<any>;
  /**
   * Show an info toast message in the parent app.
   */
  showToastInfo?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Show a success toast message in the parent app.
   */
  showToastSuccess?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Show an error toast message in the parent app.
   */
  showToastError?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Update audience data such as name, email, and emoji.
   *
   * @param payload - The audience data to update.
   */
  updateAudienceData?: (payload: {
    /** The new audience name */
    audienceName?: string;
    /** The new audience email */
    audienceEmail?: string;
    /** The new audience emoji */
    audienceEmoji?: string;
  }) => void;
  /**
   * Open a full-screen modal in the audience app.
   */
  openPluginModal?: (path?: string, data?: any) => void;
  /**
   * Close the currently open plugin modal in the audience app.
   */
  closePluginModal?: () => void;
  /**
   * Callback function to report the vertical position of the submit button.
   */
  onSubmitButtonHeightChange?: (height: number) => void;
  /**
   * Remaining time for the current slide if hasTimeLimit is true.
   * @type {number|null}
   */
  timeLimit?: number | null;
  /**
   * Scroll the parent app to a specific offset relative to the iframe top.
   * @param yOffset - The vertical offset relative to the iframe top.
   */
  scrollTo?: (yOffset: number) => void;
}

/**
 * AudienceSlidePluginIframe is a cross-domain component (zoid) that allows
 * Ahaslides parent applications to communicate with plugin iframes in the audience view.
 */
export const AudienceSlidePluginIframe = zoid.create({
  tag: 'audience-slide-plugin-iframe',
  url: ({ props }: { props: AudienceSlidePluginProps }) => props.url,
  props: {
    url: {
      type: 'string',
      required: true,
      queryParam: false,
    },
    presentation: {
      type: 'object',
      required: false,
    },
    presentationColorPalette: {
      type: 'array',
      required: false,
    },
    presentationLighterColorPalette: {
      type: 'array',
      required: false,
    },
    slide: {
      type: 'object',
      required: false,
    },
    audience: {
      type: 'object',
      required: false,
    },
    onHeightChange: {
      type: 'function',
      required: false,
    },
    slideAttributes: {
      type: 'object',
      required: false,
    },
    baseUrl: {
      type: 'string',
      required: false,
    },
    subscribeTopic: {
      type: 'function',
      required: false,
    },
    unsubscribeTopic: {
      type: 'function',
      required: false,
    },
    trackGA4AndMixpanel: {
      type: 'function',
      required: false,
    },
    uploadImage: {
      type: 'function',
      required: false,
    },
    showToastInfo: {
      type: 'function',
      required: false,
    },
    showToastSuccess: {
      type: 'function',
      required: false,
    },
    showToastError: {
      type: 'function',
      required: false,
    },
    updateAudienceData: {
      type: 'function',
      required: false,
    },
    openPluginModal: {
      type: 'function',
      required: false,
    },
    closePluginModal: {
      type: 'function',
      required: false,
    },
    onSubmitButtonHeightChange: {
      type: 'function',
      required: false,
    },
    timeLimit: {
      type: 'number',
      required: false,
    },
    scrollTo: {
      type: 'function',
      required: false,
    },
  },
});

export { ParticipantInfo };

/**
 * Hook for Audience Plugins.
 * Provides access to presentation, slide, and slideAttributes data.
 *
 * @deprecated Use `createAudiencePlugin` from `@aha/core` instead.
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for presentation, slide, and slideAttributes props.
 */
export function useAudiencePlugin(options: UseSlidePluginOptions = { autoHeight: true }): BaseSlidePluginReturn & {
  slideAttributesProps: Ref<Record<string, any> | undefined>;
  audienceName: Ref<string | undefined>;
  audienceEmoji: Ref<string | undefined>;
  audienceId: Ref<string | number | undefined>;
  audienceEmail: Ref<string | undefined>;
  audienceTeam: Ref<string | undefined>;
  participantInfo: Ref<ParticipantInfo[] | undefined>;
  uploadImage: (() => Promise<any>) | undefined;
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
  scrollTo: ((yOffset: number) => void) | undefined;
} {
  const plugin = createAudiencePlugin({
    autoHeight: options.autoHeight ?? true,
  });

  const presentationProps = ref<Record<string, any> | undefined>(plugin.getPresentation());
  const presentationColorPaletteProps = ref<string[] | undefined>(plugin.getPresentationColorPalette());
  const presentationLighterColorPaletteProps = ref<string[] | undefined>(plugin.getPresentationLighterColorPalette());
  const slideProps = ref<Record<string, any> | undefined>(plugin.getSlide());
  const baseUrl = ref<string | undefined>(plugin.getBaseUrl());
  const slideAttributesProps = ref<Record<string, any> | undefined>(plugin.getSlideAttributes());
  const audienceName = ref<string | undefined>(plugin.getAudienceName());
  const audienceEmoji = ref<string | undefined>(plugin.getAudienceEmoji());
  const audienceId = ref<string | number | undefined>(plugin.getAudienceId());
  const audienceEmail = ref<string | undefined>(plugin.getAudienceEmail());
  const audienceTeam = ref<string | undefined>(plugin.getAudienceTeam());
  const participantInfo = ref<ParticipantInfo[] | undefined>(plugin.getParticipantInfo());
  const timeLimit = ref<number | null | undefined>(plugin.getTimeLimit());

  const unsubs: (() => void)[] = [];

  onMounted(() => {
    plugin.init();

    unsubs.push(plugin.onPresentationChange((val) => { presentationProps.value = val; }));
    unsubs.push(plugin.onSlideChange((val) => { slideProps.value = val; }));
    unsubs.push(plugin.onBaseUrlChange((val) => { baseUrl.value = val; }));
    unsubs.push(plugin.onPresentationColorPaletteChange((val) => { presentationColorPaletteProps.value = val; }));
    unsubs.push(plugin.onPresentationLighterColorPaletteChange((val) => { presentationLighterColorPaletteProps.value = val; }));
    unsubs.push(plugin.onSlideAttributesChange((val) => { slideAttributesProps.value = val; }));
    unsubs.push(plugin.onAudienceNameChange((val) => { audienceName.value = val; }));
    unsubs.push(plugin.onAudienceEmojiChange((val) => { audienceEmoji.value = val; }));
    unsubs.push(plugin.onAudienceIdChange((val) => { audienceId.value = val; }));
    unsubs.push(plugin.onAudienceEmailChange((val) => { audienceEmail.value = val; }));
    unsubs.push(plugin.onAudienceTeamChange((val) => { audienceTeam.value = val; }));
    unsubs.push(plugin.onParticipantInfoChange((val) => { participantInfo.value = val; }));
    unsubs.push(plugin.onTimeLimitChange((val) => { timeLimit.value = val; }));
  });

  onUnmounted(() => {
    unsubs.forEach((fn) => fn());
    plugin.destroy();
  });

  const xprops = (window as any).xprops;

  return {
    presentationProps,
    presentationColorPaletteProps,
    presentationLighterColorPaletteProps,
    slideProps,
    baseUrl,
    subscribeTopic: xprops?.subscribeTopic ? (opts: any) => plugin.subscribeTopic(opts) : undefined,
    unsubscribeTopic: xprops?.unsubscribeTopic ? (topic: string) => plugin.unsubscribeTopic(topic) : undefined,
    slideAttributesProps,
    audienceName,
    audienceEmoji,
    audienceId,
    audienceEmail,
    audienceTeam,
    uploadImage: xprops?.uploadImage
      ? () => plugin.uploadImage()
      : undefined,
    showToastInfo: xprops?.showToastInfo
      ? (text: string, uniqName?: string, action?: any, options?: any) => plugin.showToastInfo(text, uniqName, action, options)
      : undefined,
    showToastSuccess: xprops?.showToastSuccess
      ? (text: string, uniqName?: string, action?: any, options?: any) => plugin.showToastSuccess(text, uniqName, action, options)
      : undefined,
    showToastError: xprops?.showToastError
      ? (text: string, uniqName?: string, action?: any, options?: any) => plugin.showToastError(text, uniqName, action, options)
      : undefined,
    updateAudienceData: xprops?.updateAudienceData
      ? (payload: any) => plugin.updateAudienceData(payload)
      : undefined,
    openPluginModal: xprops?.openPluginModal
      ? (path?: string, data?: any) => plugin.openPluginModal(path, data)
      : undefined,
    closePluginModal: xprops?.closePluginModal
      ? () => plugin.closePluginModal()
      : undefined,
    onSubmitButtonHeightChange: xprops?.onSubmitButtonHeightChange
      ? (height: number) => plugin.onSubmitButtonHeightChange(height)
      : undefined,
    timeLimit,
    scrollTo: xprops?.scrollTo
      ? (yOffset: number) => plugin.scrollTo(yOffset)
      : undefined,
    participantInfo,
    reportHeight: () => plugin.reportHeight(),
    trackGA4AndMixpanel: xprops?.trackGA4AndMixpanel
      ? (eventName: string, payload: any) => plugin.trackGA4AndMixpanel(payload)
      : undefined,
    getValues: xprops?.getValues
      ? (params: any) => plugin.getValues(params)
      : undefined,
  };
}
