import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { createPluginBase, reportHeight as coreReportHeight, autoReportHeight as coreAutoReportHeight } from '@aha/core';
import type { PluginBaseOptions, ImageUploadResult, PluginKeyboardEvent, PluginBase } from '@aha/core';

// Re-export types and functions from @aha/core for backward compatibility
export { coreReportHeight as reportHeight, coreAutoReportHeight as autoReportHeight };
export type { PluginBaseOptions };

/**
 * Common properties shared between presenter and audience slide plugins.
 * @deprecated Import `BaseSlidePluginProps` from `@aha/core` instead.
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

    /** slide title */
    title?: string;
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
   * Action to track events to GA4 and Mixpanel.
   *
   * @param payload - The event payload to track.
   */
  trackGA4AndMixpanel?: (payload: any) => void;
}

/**
 * Represents a serializable subset of a KeyboardEvent.
 * Used for cross-domain communication via Zoid.
 * @deprecated Import `PluginKeyboardEvent` from `@aha/core` instead.
 */
export { PluginKeyboardEvent };

/**
 * Options for the composition hooks.
 */
export interface UseSlidePluginOptions {
  /**
   * Whether to automatically report content height to the parent.
   */
  autoHeight?: boolean | string;
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
  trackGA4AndMixpanel: ((eventName: string, payload: any) => void) | undefined;
  /**
   * Manually trigger a report of the current content height to the parent.
   */
  reportHeight: () => void;
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

  /**
   * Action to fetch values from a specific bucket and optional key from the parent application.
   *
   * @param params - The parameters containing bucket and optional key.
   * @returns A promise resolving to an array of objects containing key, path, and value.
   */
  getValues: ((params: { bucket: string, key?: string }) => Promise<{ key: string, path: string, value: string }[]>) | undefined;
}

/**
 * Base hook that provides common functionality for both presenter and audience plugins.
 *
 * @deprecated Use `createPluginBase` from `@aha/core` instead.
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @param onPropsExtension - Optional callback to handle additional props updates.
 * @returns Reactive refs for common presentation and slide props, and shared actions.
 */
export function useBaseSlidePlugin(
  options: UseSlidePluginOptions = { autoHeight: false },
  onPropsExtension?: (newProps: any) => void
): BaseSlidePluginReturn & { xprops: any } {
  const plugin = createPluginBase({
    autoHeight: options.autoHeight ?? false,
  });

  const presentationProps = ref<Record<string, any> | undefined>(plugin.getPresentation());
  const presentationColorPaletteProps = ref<string[] | undefined>(plugin.getPresentationColorPalette());
  const presentationLighterColorPaletteProps = ref<string[] | undefined>(plugin.getPresentationLighterColorPalette());
  const slideProps = ref<Record<string, any> | undefined>(plugin.getSlide());
  const baseUrl = ref<string | undefined>(plugin.getBaseUrl());

  const unsubs: (() => void)[] = [];

  onMounted(() => {
    plugin.init();

    unsubs.push(plugin.onPresentationChange((val) => { presentationProps.value = val; }));
    unsubs.push(plugin.onSlideChange((val) => { slideProps.value = val; }));
    unsubs.push(plugin.onBaseUrlChange((val) => { baseUrl.value = val; }));
    unsubs.push(plugin.onPresentationColorPaletteChange((val) => { presentationColorPaletteProps.value = val; }));
    unsubs.push(plugin.onPresentationLighterColorPaletteChange((val) => { presentationLighterColorPaletteProps.value = val; }));

    // Handle extension callback for derived hooks
    if (onPropsExtension) {
      const xprops = (window as any).xprops;
      if (xprops && typeof xprops.onProps === 'function') {
        xprops.onProps((newProps: any) => {
          onPropsExtension(newProps);
        });
      }
    }
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
    reportHeight: () => plugin.reportHeight(),
    xprops,
    trackGA4AndMixpanel: xprops?.trackGA4AndMixpanel ? (eventName: string, payload: any) => plugin.trackGA4AndMixpanel(payload) : undefined,
    getValues: xprops?.getValues ? (params: any) => plugin.getValues(params) : undefined,
  };
}
