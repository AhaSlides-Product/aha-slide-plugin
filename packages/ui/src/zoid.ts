import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted } from 'vue';

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
    /** The language code (e.g., 'en', 'vi') */
    language?: string;
    /** The font family name used in the presentation */
    fontFamily?: string;
    /** Whether to show hyperlinks in the content */
    showHyperLink?: boolean;
    /** Whether profanity filtering is enabled */
    filteringProfanity?: boolean;
    [key: string]: any;
  };
  /** 
   * Data specific to the currently active slide.
   */
  slide?: {
    /** The unique identifier of the slide */
    id?: string | number;
    /** The base text color for content */
    textColour?: string;
    /** Whether submissions are currently locked */
    stopSubmission?: boolean;
    /** Whether results are hidden from the audience */
    hideResult?: boolean;
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
   * @returns A promise resolving to an object containing slide attributes.
   */
  getSlideAttributesAction?: () => Promise<any>;
  /** 
   * Action to create or update a specific attribute for the current slide in the parent application.
   * 
   * @param payload - The attribute data to sync.
   * @returns A promise resolving when the update is complete.
   */
  upsertSlideAttributeAction?: (payload: { attributeKey: string; attributeValue: any }) => Promise<any>;
  /** The base URL of the parent application */
  baseUrl?: string;
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
  presentation?: Record<string, any>;
  /** 
   * Data specific to the currently active slide.
   */
  slide?: Record<string, any>;
  /** 
   * Callback to report height changes from the child to the parent. 
   * Sending null signals the parent to use 100% height.
   * 
   * @param height - The new height in pixels, or null for 100% height.
   */
  onHeightChange?: (height: number | null) => void;
  /** The base URL of the parent application */
  baseUrl?: string;
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
    onHeightChange: {
      type: 'function',
      required: false,
    },
    baseUrl: {
      type: 'string',
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
  if (typeof window === 'undefined') return () => {};
  
  const xprops = (window as any).xprops;
  if (!xprops || typeof xprops.onHeightChange !== 'function') {
    return () => {};
  }

  const sendHeight = () => {
    const height = document.body.scrollHeight;
    xprops.onHeightChange(height);
  };

  const observer = new ResizeObserver(() => sendHeight());
  observer.observe(document.body);
  setTimeout(sendHeight, 100);

  return () => observer.disconnect();
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
export function usePresenterPlugin(options: UseSlidePluginOptions = { autoHeight: true }) {
  const presentationProps = ref<Record<string, any> | undefined>((window as any).xprops?.presentation);
  const slideProps = ref<Record<string, any> | undefined>((window as any).xprops?.slide);

  onMounted(() => {
    let cleanup = () => {};
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
  
  const getSlideAttributesAction = async () => {
    if (typeof originalGetAttributes !== 'function') return undefined;
    const response = await originalGetAttributes();
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

  return { 
    presentationProps, 
    slideProps, 
    getSlideAttributesAction, 
    upsertSlideAttributeAction,
    baseUrl
  };
}

/**
 * Hook for Audience Plugins.
 * Provides access to presentation, slide, and slideAttributes data.
 * 
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for presentation, slide, and slideAttributes props.
 */
export function useAudiencePlugin(options: UseSlidePluginOptions = { autoHeight: true }) {
  const presentationProps = ref<Record<string, any> | undefined>((window as any).xprops?.presentation);
  const slideProps = ref<Record<string, any> | undefined>((window as any).xprops?.slide);

  onMounted(() => {
    let cleanup = () => {};
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

  return { presentationProps, slideProps, baseUrl };
}
