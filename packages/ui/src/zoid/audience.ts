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
    audienceName: {
      type: 'string',
      required: false,
    },
    audienceEmoji: {
      type: 'string',
      required: false,
    },
    audienceId: {
      type: 'string',
      required: false,
    },
    audienceEmail: {
      type: 'string',
      required: false,
    },
    audienceTeam: {
      type: 'string',
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
} {
  // Audience-specific reactive refs
  const xprops = (window as any).xprops;
  const slideAttributesProps = ref<Record<string, any> | undefined>(xprops?.slideAttributes);
  const audienceName = ref<string | undefined>(xprops?.audienceName);
  const audienceEmoji = ref<string | undefined>(xprops?.audienceEmoji);
  const audienceId = ref<string | number | undefined>(xprops?.audienceId);
  const audienceEmail = ref<string | undefined>(xprops?.audienceEmail);
  const audienceTeam = ref<string | undefined>(xprops?.audienceTeam);

  const uploadImage = xprops?.uploadImage;
  const showToastInfo = xprops?.showToastInfo;
  const showToastSuccess = xprops?.showToastSuccess;
  const showToastError = xprops?.showToastError;

  // Extension callback to handle audience-specific props
  const handleAudienceProps = (newProps: any) => {
    if (newProps.slideAttributes) slideAttributesProps.value = { ...newProps.slideAttributes };
    if (newProps.audienceName) audienceName.value = newProps.audienceName;
    if (newProps.audienceEmoji) audienceEmoji.value = newProps.audienceEmoji;
    if (newProps.audienceId) audienceId.value = newProps.audienceId;
    if (newProps.audienceEmail) audienceEmail.value = newProps.audienceEmail;
    if (newProps.audienceTeam) audienceTeam.value = newProps.audienceTeam;
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
  };
}
