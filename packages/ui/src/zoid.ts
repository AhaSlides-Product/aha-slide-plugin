import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted, type Ref } from 'vue';
import { ImageUploadResult } from './image';

/**
 * Interface for the properties expected by the PresenterSlidePluginIframe component.
 */
export interface SlidePluginProps {
  /** The URL of the plugin to be loaded in the iframe */
  url: string;
  /** 
   * Presentation-wide settings and data that affect the plugin's appearance and behavior.
   */
  presentation?: {
    /** The unique identifier of the presentation */
    id?: string | number;
    /** The language code (e.g., 'en', 'vi') */
    language?: string;
    /** The font family name used in the presentation */
    fontFamily?: string;
    /** Whether to show hyperlinks in the content */
    showHyperLink?: boolean;
    /** Whether profanity filtering is enabled */
    filteringProfanity?: boolean;
    /** The unique access code of the presentation */
    uniqueAccessCode?: string;
    /** The share code of the presentation */
    shareCode?: string;
    /** The access code of the presentation */
    accessCode?: string;
    /** The teamplay object used in the presentation */
    teamplay?: Record<string, any>;
    /** Whether audience pacing is enabled */
    audiencePacing?: boolean;
    [key: string]: any;
  };
  /** 
   * Data specific to the currently active slide.
   */
  slide?: {
    /** The unique identifier of the slide */
    id?: string | number;
    /** The version of the slide */
    version?: number;
    /** Time allowed to answer the slide in seconds */
    timeToAnswer?: number;
    /** The timestamp when the quiz starts */
    quizTimestamp?: number;
    /** Whether multiple choices can be selected */
    multipleChoice?: boolean;
    /** Whether answering correctly awards points */
    isCorrectGetPoint?: boolean;
    /** Whether faster answers award more points */
    fastAnswerGetMorePoint?: boolean;
    /** Minimum points awarded */
    minPoint?: number;
    /** Maximum points awarded */
    maxPoint?: number;
    /** The type of the slide (e.g., 'multiple-choice', 'open-ended') */
    slideType?: string;
    /** Whether streak detection is enabled */
    isEnableStreakDetection?: boolean;
    /** Whether streak bonus is enabled */
    isEnableStreakBonus?: boolean;
    [key: string]: any;
  };
  /** 
   * Callback to report height changes from the child to the parent. 
   * Sending null signals the parent to use 100% height.
   * 
   * @param height - The new height in pixels, or null for 100% height.
   */
  onHeightChange?: (height: number | null) => void;
  /** 
   * Action to fetch all custom attributes for the current slide from the parent application.
   * 
   * @param slideId - Optional override for the slide identifier.
   * @returns A promise resolving to an object containing slide attributes.
   */
  getSlideAttributesAction?: (slideId?: string | number) => Promise<any>;
  /** 
   * Action to create or update a specific attribute for the current slide in the parent application.
   * 
   * @param payload - The attribute data to sync.
   * @returns A promise resolving when the update is complete.
   */
  upsertSlideAttributeAction?: (payload: { attributeKey: string; attributeValue: any }) => Promise<any>;
  /** The base URL of the parent application */
  baseUrl?: string;
  /** 
   * Subscribe to a specific MQTT topic.
   * 
   * @param options - Subscription options including type, topic, and callback.
   */
  subscribeTopic?: (options: { type?: string; topic: string; callback: (topic: string, message: any) => void }) => void;
  /** 
   * Unsubscribe from a specific MQTT topic.
   * 
   * @param topic - The topic to unsubscribe from.
   */
  unsubscribeTopic?: (topic: string) => void;
  /** 
   * Action to send counting data from the audience to the parent application.
   * 
   * @param payload - Optional payload for counting.
   * @returns A promise resolving when the counting is handled.
   */
  audienceSendCountingUniqueAction?: (payload?: any) => Promise<any>;
  /** 
   * Action to track events to GA4 and Mixpanel.
   * 
   * @param payload - The event payload to track.
   */
  trackGA4AndMixpanel?: (payload: any) => void;
  uploadImage: () => Promise<ImageUploadResult>;
}

/**
 * PresenterSlidePluginIframe is a cross-domain component (zoid) that allows
 * Ahaslides parent applications to communicate with plugin iframes in the presenter view.
 */
export const PresenterSlidePluginIframe = zoid.create({
  tag: 'presenter-slide-plugin-iframe',
  url: ({ props }: { props: SlidePluginProps }) => props.url,
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
    slide: {
      type: 'object',
      required: false,
    },
    onHeightChange: {
      type: 'function',
      required: false,
    },
    getSlideAttributesAction: {
      type: 'function',
      required: false,
    },
    upsertSlideAttributeAction: {
      type: 'function',
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
  },
});

/**
 * Interface for the properties expected by the AudienceSlidePluginIframe component.
 */
export interface AudienceSlidePluginProps {
  /** The URL of the plugin to be loaded in the iframe */
  url: string;
  /** 
   * Presentation-wide settings and data that affect the plugin's appearance and behavior.
   */
  presentation?: {
    /** The unique identifier of the presentation */
    id?: string | number;
    /** The language code (e.g., 'en', 'vi') */
    language?: string;
    /** The font family name used in the presentation */
    fontFamily?: string;
    /** Whether to show hyperlinks in the content */
    showHyperLink?: boolean;
    /** Whether profanity filtering is enabled */
    filteringProfanity?: boolean;
    /** The unique access code of the presentation */
    uniqueAccessCode?: string;
    /** The share code of the presentation */
    shareCode?: string;
    /** The access code of the presentation */
    accessCode?: string;
    /** The teamplay object used in the presentation */
    teamPlay?: Record<string, any>;
    /** Whether audience pacing is enabled */
    audiencePacing?: boolean;
    [key: string]: any;
  };
  /** 
   * Data specific to the currently active slide.
   */
  slide?: {
    /** The unique identifier of the slide */
    id?: string | number;
    /** The version of the slide */
    version?: number;
    /** Time allowed to answer the slide in seconds */
    timeToAnswer?: number;
    /** The timestamp when the quiz starts */
    quizTimestamp?: number;
    /** Whether multiple choices can be selected */
    multipleChoice?: boolean;
    /** Whether answering correctly awards points */
    isCorrectGetPoint?: boolean;
    /** Whether faster answers award more points */
    fastAnswerGetMorePoint?: boolean;
    /** Minimum points awarded */
    minPoint?: number;
    /** Maximum points awarded */
    maxPoint?: number;
    /** The type of the slide (e.g., 'multiple-choice', 'open-ended') */
    slideType?: string;
    /** Whether streak detection is enabled */
    isEnableStreakDetection?: boolean;
    /** Whether streak bonus is enabled */
    isEnableStreakBonus?: boolean;
    [key: string]: any;
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
   * Callback to report height changes from the child to the parent. 
   * Sending null signals the parent to use 100% height.
   * 
   * @param height - The new height in pixels, or null for 100% height.
   */
  onHeightChange?: (height: number | null) => void;
  /** 
   * Custom attributes associated with the current slide.
   */
  slideAttributes?: Record<string, any>;
  /** The base URL of the parent application */
  baseUrl?: string;
  /** 
   * Subscribe to a specific MQTT topic.
   * 
   * @param options - Subscription options including type, topic, and callback.
   */
  subscribeTopic?: (options: { type?: string; topic: string; callback: (topic: string, message: any) => void }) => void;
  /** 
   * Unsubscribe from a specific MQTT topic.
   * 
   * @param topic - The topic to unsubscribe from.
   */
  unsubscribeTopic?: (topic: string) => void;
  /** 
   * Action to send counting data from the audience to the parent application.
   * 
   * @param payload - Optional payload for counting.
   * @returns A promise resolving when the counting is handled.
   */
  audienceSendCountingUniqueAction?: (payload?: any) => Promise<any>;
  /** 
   * Action to track events to GA4 and Mixpanel.
   * 
   * @param payload - The event payload to track.
   */
  trackGA4AndMixpanel?: (payload: any) => void;
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
  },
});

/**
 * Automatically reports the height of the document body to the parent via zoid xprops.
 * This should be called in the child application (iframe).
 * 
 * @returns A cleanup function to stop observing height changes.
 */
export function autoReportHeight() {
  console.log('[SlidePlugin] autoReportHeight called');
  if (typeof window === 'undefined') return () => { };

  const xprops = (window as any).xprops;
  if (!xprops || typeof xprops.onHeightChange !== 'function') {
    return () => { };
  }

  const sendHeight = () => {
    const app = document.getElementById('app');
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      app ? app.scrollHeight : 0
    );
    console.log('[SlidePlugin] Reporting height:', height);
    xprops.onHeightChange(height);
  };

  const observer = new ResizeObserver(() => sendHeight());
  observer.observe(document.body);
  const app = document.getElementById('app');
  if (app) {
    observer.observe(app);
  }

  // Fallback for changes that might not trigger ResizeObserver on the containers
  const mutObserver = new MutationObserver(() => sendHeight());
  mutObserver.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  // Initial report
  sendHeight();

  // Also report after a short delay for any late rendering
  setTimeout(sendHeight, 300);

  return () => {
    observer.disconnect();
    mutObserver.disconnect();
  };
}

/**
 * Options for the composition hooks.
 */
export interface UseSlidePluginOptions {
  /** 
   * Whether to automatically report content height to the parent.
   */
  autoHeight?: boolean;
}

/**
 * Hook for Presenter Plugins (Canvas, Settings).
 * Provides access to presentation and slide data, as well as actions to manage slide attributes.
 * 
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for presentation and slide props, and actions for slide attributes.
 */
export function usePresenterPlugin(options: UseSlidePluginOptions = { autoHeight: true }): {
  presentationProps: Ref<Record<string, any> | undefined>;
  slideProps: Ref<Record<string, any> | undefined>;
  getSlideAttributesAction: (slideId?: string | number) => Promise<any>;
  upsertSlideAttributeAction: ((payload: { attributeKey: string; attributeValue: any; }) => Promise<any>) | undefined;
  baseUrl: Ref<string | undefined>;
  subscribeTopic: ((options: { type?: string; topic: string; callback: (topic: string, message: any) => void }) => void) | undefined;
  unsubscribeTopic: ((topic: string) => void) | undefined;
  audienceSendCountingUniqueAction: ((payload?: any) => Promise<any>) | undefined;
  uploadImage: (() => Promise<ImageUploadResult>) | undefined;
} {
  const presentationProps = ref<Record<string, any> | undefined>((window as any).xprops?.presentation);
  const slideProps = ref<Record<string, any> | undefined>((window as any).xprops?.slide);

  onMounted(() => {
    let cleanup = () => { };
    if (options.autoHeight !== false) {
      cleanup = autoReportHeight();
    } else {
      const xprops = (window as any).xprops;
      if (xprops && typeof xprops.onHeightChange === 'function') {
        xprops.onHeightChange(null);
      }
    }

    const xprops = (window as any).xprops;
    if (xprops && typeof xprops.onProps === 'function') {
      xprops.onProps((newProps: any) => {
        if (newProps.presentation) presentationProps.value = { ...newProps.presentation };
        if (newProps.slide) slideProps.value = { ...newProps.slide };
        if (newProps.baseUrl) baseUrl.value = newProps.baseUrl;
      });
    }
    return cleanup;
  });

  const xprops = (window as any).xprops;
  const baseUrl = ref<string | undefined>(xprops?.baseUrl);
  const originalGetAttributes = xprops?.getSlideAttributesAction;

  const getSlideAttributesAction = async (slideId?: string | number): Promise<any> => {
    if (typeof originalGetAttributes !== 'function') return undefined;
    const response = await originalGetAttributes(slideId);
    if (Array.isArray(response)) {
      return response.reduce((acc, item) => {
        if (item && item.type) {
          acc[item.type] = item.attributes;
        }
        return acc;
      }, {} as Record<string, any>);
    }
    return response;
  };

  const upsertSlideAttributeAction = xprops?.upsertSlideAttributeAction;
  const subscribeTopic = xprops?.subscribeTopic;
  const unsubscribeTopic = xprops?.unsubscribeTopic;
  const audienceSendCountingUniqueAction = xprops?.audienceSendCountingUniqueAction;
  const uploadImage = xprops?.uploadImage;

  return {
    presentationProps,
    slideProps,
    getSlideAttributesAction,
    upsertSlideAttributeAction,
    baseUrl,
    subscribeTopic,
    unsubscribeTopic,
    audienceSendCountingUniqueAction,
    uploadImage,
  };
}

/**
 * Hook for Audience Plugins.
 * Provides access to presentation, slide, and slideAttributes data.
 * 
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for presentation, slide, and slideAttributes props.
 */
export function useAudiencePlugin(options: UseSlidePluginOptions = { autoHeight: true }): {
  presentationProps: Ref<Record<string, any> | undefined>;
  slideProps: Ref<Record<string, any> | undefined>;
  slideAttributesProps: Ref<Record<string, any> | undefined>;
  baseUrl: Ref<string | undefined>;
  audienceName: Ref<string | undefined>;
  audienceEmoji: Ref<string | undefined>;
  audienceId: Ref<string | number | undefined>;
  audienceEmail: Ref<string | undefined>;
  audienceTeam: Ref<string | undefined>;
  subscribeTopic: ((options: { type?: string; topic: string; callback: (topic: string, message: any) => void }) => void) | undefined;
  unsubscribeTopic: ((topic: string) => void) | undefined;
  audienceSendCountingUniqueAction: ((payload?: any) => Promise<any>) | undefined;
} {
  const presentationProps = ref<Record<string, any> | undefined>((window as any).xprops?.presentation);
  const slideProps = ref<Record<string, any> | undefined>((window as any).xprops?.slide);
  const slideAttributesProps = ref<Record<string, any> | undefined>((window as any).xprops?.slideAttributes);

  const xprops = (window as any).xprops;
  const audienceName = ref<string | undefined>(xprops?.audienceName);
  const audienceEmoji = ref<string | undefined>(xprops?.audienceEmoji);
  const audienceId = ref<string | number | undefined>(xprops?.audienceId);
  const audienceEmail = ref<string | undefined>(xprops?.audienceEmail);
  const audienceTeam = ref<string | undefined>(xprops?.audienceTeam);

  onMounted(() => {
    let cleanup = () => { };
    if (options.autoHeight !== false) {
      cleanup = autoReportHeight();
    } else {
      const xprops = (window as any).xprops;
      if (xprops && typeof xprops.onHeightChange === 'function') {
        xprops.onHeightChange(null);
      }
    }

    const xprops = (window as any).xprops;
    if (xprops && typeof xprops.onProps === 'function') {
      xprops.onProps((newProps: any) => {
        if (newProps.presentation) presentationProps.value = { ...newProps.presentation };
        if (newProps.slide) slideProps.value = { ...newProps.slide };
        if (newProps.slideAttributes) slideAttributesProps.value = { ...newProps.slideAttributes };
        if (newProps.baseUrl) baseUrl.value = newProps.baseUrl;

        if (newProps.audienceName) audienceName.value = newProps.audienceName;
        if (newProps.audienceEmoji) audienceEmoji.value = newProps.audienceEmoji;
        if (newProps.audienceId) audienceId.value = newProps.audienceId;
        if (newProps.audienceEmail) audienceEmail.value = newProps.audienceEmail;
        if (newProps.audienceTeam) audienceTeam.value = newProps.audienceTeam;
      });
    }
    return cleanup;
  });

  const baseUrl = ref<string | undefined>(xprops?.baseUrl);
  const subscribeTopic = xprops?.subscribeTopic;
  const unsubscribeTopic = xprops?.unsubscribeTopic;
  const audienceSendCountingUniqueAction = xprops?.audienceSendCountingUniqueAction;

  return {
    presentationProps,
    slideProps,
    slideAttributesProps,
    baseUrl,
    audienceName,
    audienceEmoji,
    audienceId,
    audienceEmail,
    audienceTeam,
    subscribeTopic,
    unsubscribeTopic,
    audienceSendCountingUniqueAction
  };
}
