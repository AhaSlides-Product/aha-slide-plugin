import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, type Ref } from 'vue';
import {
  BaseSlidePluginProps,
  UseSlidePluginOptions,
  BaseSlidePluginReturn,
  useBaseSlidePlugin
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
    audienceSendCountingUniqueAction: {
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
  },
});

/**
 * Hook for Audience Plugins.
 * Provides access to presentation, slide, and slideAttributes data.
 * 
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
  uploadImage: (() => Promise<any>) | undefined;
  showToastInfo: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastSuccess: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastError: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  updateAudienceData: ((payload: {
    audienceName?: string;
    audienceEmail?: string;
    audienceEmoji?: string;
  }) => void) | undefined;
  openPluginModal: ((path?: string, data?: any) => void) | undefined;
  closePluginModal: (() => void) | undefined;
} {
  // Audience-specific reactive refs
  const xprops = (window as any).xprops;
  console.log('[useAudiencePlugin] Rendering with xprops:', xprops);
  const slideAttributesProps = ref<Record<string, any> | undefined>(xprops?.slideAttributes);
  const audienceName = ref<string | undefined>(xprops?.audience?.audienceName);
  const audienceEmoji = ref<string | undefined>(xprops?.audience?.audienceEmoji);
  const audienceId = ref<string | number | undefined>(xprops?.audience?.audienceId);
  const audienceEmail = ref<string | undefined>(xprops?.audience?.audienceEmail);
  const audienceTeam = ref<string | undefined>(xprops?.audience?.audienceTeam);

  const uploadImage = xprops?.uploadImage;
  const showToastInfo = xprops?.showToastInfo;
  const showToastSuccess = xprops?.showToastSuccess;
  const showToastError = xprops?.showToastError;
  const updateAudienceData = xprops?.updateAudienceData;
  const openPluginModal = xprops?.openPluginModal;
  const closePluginModal = xprops?.closePluginModal;

  // Extension callback to handle audience-specific props
  const handleAudienceProps = (newProps: any) => {
    if (newProps.slideAttributes) slideAttributesProps.value = { ...newProps.slideAttributes };
    if (newProps.audience) {
      if (newProps.audience.audienceName !== undefined) audienceName.value = newProps.audience.audienceName;
      if (newProps.audience.audienceEmoji !== undefined) audienceEmoji.value = newProps.audience.audienceEmoji;
      if (newProps.audience.audienceId !== undefined) audienceId.value = newProps.audience.audienceId;
      if (newProps.audience.audienceEmail !== undefined) audienceEmail.value = newProps.audience.audienceEmail;
      if (newProps.audience.audienceTeam !== undefined) audienceTeam.value = newProps.audience.audienceTeam;
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
    audienceSendCountingUniqueAction: baseHook.audienceSendCountingUniqueAction,
    slideAttributesProps,
    audienceName,
    audienceEmoji,
    audienceId,
    audienceEmail,
    audienceTeam,
    uploadImage,
    showToastInfo,
    showToastSuccess,
    showToastError,
    updateAudienceData,
    openPluginModal,
    closePluginModal,
  };
}
