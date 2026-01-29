import { ref, onMounted, type Ref } from 'vue';

/**
 * Common properties shared between presenter and audience slide plugins.
 */
export interface BaseSlidePluginProps {
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
    /** Whether audience pacing is enabled */
    audiencePacing?: boolean;
    /** Whether the presentation is currently presenting */
    presenting?: boolean;
    /** The audience admission setting (e.g., 'auto', 'manual') */
    audienceAdmission?: string;
    [key: string]: any;
  };
  /**
   * Presentation-wide color palette attributes.
   */
  presentationColorPalette?: string[];
  /**
   * Presentation-wide lighter color palette attributes.
   */
  presentationLighterColorPalette?: string[];
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
    /** Whether the slide has a time limit */
    hasTimeLimit?: boolean;
    /** Whether to show voting results on audience devices */
    showVotingResultsOnAudience?: boolean;
    /** Whether image submission is allowed */
    imageSubmission?: boolean;
    /** The limit on the number of choices */
    limitChoice?: number;
    [key: string]: any;
  };
  /** 
   * Callback to report height changes from the child to the parent. 
   * Sending null signals the parent to use 100% height.
   * 
   * @param height - The new height in pixels, or null for 100% height.
   */
  onHeightChange?: (height: number | null) => void;
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
 * Represents a serializable subset of a KeyboardEvent.
 * Used for cross-domain communication via Zoid.
 */
export interface PluginKeyboardEvent {
  /** The key value of the event */
  key: string;
  /** The physical key code of the event */
  code: string;
  /** Whether the Ctrl key was pressed */
  ctrlKey: boolean;
  /** Whether the Shift key was pressed */
  shiftKey: boolean;
  /** Whether the Alt key was pressed */
  altKey: boolean;
  /** Whether the Meta key was pressed */
  metaKey: boolean;
  /** Whether the event is repeating */
  repeat: boolean;
  /** The location of the key on the keyboard */
  location: number;
  /** The legacy keyCode of the event */
  keyCode: number;
}

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
 * Common return type for slide plugin hooks.
 */
export interface BaseSlidePluginReturn {
  presentationProps: Ref<Record<string, any> | undefined>;
  presentationColorPaletteProps: Ref<string[] | undefined>;
  presentationLighterColorPaletteProps: Ref<string[] | undefined>;
  slideProps: Ref<Record<string, any> | undefined>;
  baseUrl: Ref<string | undefined>;
  /** 
   * Subscribe to a specific MQTT topic.
   * 
   * The topic is typically constructed using a bucket and a key: `${bucket}/${key}`.
   * You can also subscribe to multiple topics using a prefix followed by a `#` wildcard (e.g., `bucket/#`).
   * 
   * @example
   * ```typescript
   * subscribeTopic({
   *   topic: 'my-bucket/my-key',
   *   callback: (topic, message) => console.log(topic, message)
   * });
   * ```
   * 
   * Or subscribing to all changes in the bucket:
   * ```typescript
   * subscribeTopic({
   *   topic: 'my-bucket/#',
   *   callback: (topic, message) => console.log(topic, message)
   * });
   * ```
   */
  subscribeTopic: ((options: { type?: string; topic: string; callback: (topic: string, message: any) => void }) => void) | undefined;
  unsubscribeTopic: ((topic: string) => void) | undefined;
  audienceSendCountingUniqueAction: ((payload?: any) => Promise<any>) | undefined;
}

/**
 * Base hook that provides common functionality for both presenter and audience plugins.
 * 
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @param onPropsExtension - Optional callback to handle additional props updates.
 * @returns Reactive refs for common presentation and slide props, and shared actions.
 */
export function useBaseSlidePlugin(
  options: UseSlidePluginOptions = { autoHeight: true },
  onPropsExtension?: (newProps: any) => void
): BaseSlidePluginReturn & { xprops: any } {
  const presentationProps = ref<Record<string, any> | undefined>((window as any).xprops?.presentation);
  const presentationColorPaletteProps = ref<string[] | undefined>((window as any).xprops?.presentationColorPalette);
  const presentationLighterColorPaletteProps = ref<string[] | undefined>((window as any).xprops?.presentationLighterColorPalette);
  const slideProps = ref<Record<string, any> | undefined>((window as any).xprops?.slide);
  const baseUrl = ref<string | undefined>((window as any).xprops?.baseUrl);

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
        // Handle base props
        if (newProps.presentation) presentationProps.value = { ...newProps.presentation };
        if (newProps.presentationColorPalette) presentationColorPaletteProps.value = [...newProps.presentationColorPalette];
        if (newProps.presentationLighterColorPalette) presentationLighterColorPaletteProps.value = [...newProps.presentationLighterColorPalette];
        if (newProps.slide) slideProps.value = { ...newProps.slide };
        if (newProps.baseUrl) baseUrl.value = newProps.baseUrl;

        // Call extension callback if provided
        if (onPropsExtension) {
          onPropsExtension(newProps);
        }
      });
    }
    return cleanup;
  });

  const xprops = (window as any).xprops;
  const subscribeTopic = xprops?.subscribeTopic;
  const unsubscribeTopic = xprops?.unsubscribeTopic;
  const audienceSendCountingUniqueAction = xprops?.audienceSendCountingUniqueAction;

  return {
    presentationProps,
    presentationColorPaletteProps,
    presentationLighterColorPaletteProps,
    slideProps,
    baseUrl,
    subscribeTopic,
    unsubscribeTopic,
    audienceSendCountingUniqueAction,
    xprops,
  };
}
