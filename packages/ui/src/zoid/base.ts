import { ref, onMounted, type Ref } from 'vue';
import { throttle } from '../utils';
import type { UseSlidePluginOptions } from '@aha/ui-vanilla';

export type {
  BaseSlidePluginProps,
  PluginKeyboardEvent,
  UseSlidePluginOptions,
} from '@aha/ui-vanilla';

/**
 * Reports the document height to the parent application.
 */
export function reportHeight() {
  if (typeof window === 'undefined') return;

  const xprops = (window as any).xprops;
  if (!xprops || typeof xprops.onHeightChange !== 'function') {
    return;
  }

  const app = document.getElementById('app') || document.getElementById('root');
  const height = app
    ? app.scrollHeight
    : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  console.log('[SlidePlugin] Reporting height:', height);
  xprops.onHeightChange(height);
}

/**
 * Internal state for shared height reporting to prevent spam from multiple hooks.
 */
const sharedReportingState = {
  observer: null as ResizeObserver | null,
  mutObserver: null as MutationObserver | null,
  count: 0,
  wrapperId: undefined as string | undefined,
};

/**
 * Automatically reports the height of the document body to the parent via zoid xprops.
 * This should be called in the child application (iframe).
 *
 * @returns A cleanup function to stop observing height changes.
 */
export function autoReportHeight(wrapperId?: string) {
  const effectiveId = wrapperId || 'app';
  console.log('[SlidePlugin] autoReportHeight called', { wrapperId, effectiveId, currentCount: sharedReportingState.count });
  if (typeof window === 'undefined') return () => { };

  const xprops = (window as any).xprops;
  if (!xprops || typeof xprops.onHeightChange !== 'function') {
    return () => { };
  }

  sharedReportingState.count++;

  // If already reporting with the same effectiveId, just return a cleanup that decrements the count
  if (sharedReportingState.observer && sharedReportingState.wrapperId === effectiveId) {
    return () => {
      sharedReportingState.count--;
      if (sharedReportingState.count <= 0) {
        sharedReportingState.observer?.disconnect();
        sharedReportingState.mutObserver?.disconnect();
        sharedReportingState.observer = null;
        sharedReportingState.mutObserver = null;
        sharedReportingState.wrapperId = undefined;
      }
    };
  }

  // If reporting with a different effectiveId, disconnect previous and start new (last one wins for wrapperId)
  if (sharedReportingState.observer) {
    sharedReportingState.observer.disconnect();
    sharedReportingState.mutObserver?.disconnect();
  }

  sharedReportingState.wrapperId = effectiveId;

  const sendHeight = () => {
    const app = document.getElementById(effectiveId) || document.getElementById('root');
    const height = app
      ? app.scrollHeight
      : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    console.log('[SlidePlugin] Reporting height:', height);
    xprops.onHeightChange(height);
  };
  const throttledSendHeight = throttle(sendHeight, 100);

  const observer = new ResizeObserver(() => throttledSendHeight());
  observer.observe(document.body);
  const app = document.getElementById(effectiveId);
  if (app) {
    observer.observe(app);
  }
  sharedReportingState.observer = observer;

  // Fallback for changes that might not trigger ResizeObserver on the containers
  // Only add MutationObserver if no specific wrapperId was provided (using default)
  if (!wrapperId) {
    const mutObserver = new MutationObserver(() => throttledSendHeight());
    mutObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    sharedReportingState.mutObserver = mutObserver;
  }

  // Initial report
  sendHeight();

  // Also report after a short delay for any late rendering
  setTimeout(sendHeight, 300);

  return () => {
    sharedReportingState.count--;
    if (sharedReportingState.count <= 0) {
      sharedReportingState.observer?.disconnect();
      sharedReportingState.mutObserver?.disconnect();
      sharedReportingState.observer = null;
      sharedReportingState.mutObserver = null;
      sharedReportingState.wrapperId = undefined;
    }
  };
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

  /**
   * Filter profane words from text based on the presentation's profanity filter setting.
   * @param text - The text to filter.
   * @returns A promise resolving to the filtered text.
   */
  filterProfaneWords: ((text: string) => Promise<string>) | undefined;
}

/**
 * Base hook that provides common functionality for both presenter and audience plugins.
 *
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @param onPropsExtension - Optional callback to handle additional props updates.
 * @returns Reactive refs for common presentation and slide props, and shared actions.
 */
export function useBaseSlidePlugin(
  options: UseSlidePluginOptions = { autoHeight: false },
  onPropsExtension?: (newProps: any) => void
): BaseSlidePluginReturn & { xprops: any } {
  const presentationProps = ref<Record<string, any> | undefined>((window as any).xprops?.presentation);
  const presentationColorPaletteProps = ref<string[] | undefined>((window as any).xprops?.presentationColorPalette);
  const presentationLighterColorPaletteProps = ref<string[] | undefined>((window as any).xprops?.presentationLighterColorPalette);
  const slideProps = ref<Record<string, any> | undefined>((window as any).xprops?.slide);
  const baseUrl = ref<string | undefined>((window as any).xprops?.baseUrl);
  const trackGA4AndMixpanel = (window as any).xprops?.trackGA4AndMixpanel;

  onMounted(() => {
    let cleanup = () => { };
    if (options.autoHeight) {
      cleanup = autoReportHeight(typeof options.autoHeight === 'string' ? options.autoHeight : undefined);
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

  // TODO: Remove this migration wrapper after not having
  // any plugin_legacy_bucket_fallback event 
  const wrappedGetValues: BaseSlidePluginReturn['getValues'] = xprops?.getValues
    ? async (params: { bucket: string; key?: string }) => {
        // Matches bucket format from getBucket() in @aha/common/emqx: `s${slideId}-v${slideVersion}/${bucketName}`
        const match = params.bucket.match(/^s(\d+)-v(\d+)\/(.+)$/);
        if (!match) {
          return xprops.getValues(params);
        }

        const presentationId = presentationProps.value?.id;
        if (!presentationId) {
          return xprops.getValues(params);
        }

        const legacyBucket = `p${presentationId}-${params.bucket}`;
        const [result, legacyResult] = await Promise.all([
          xprops.getValues(params),
          xprops.getValues({ ...params, bucket: legacyBucket }),
        ]);

        if (result.length === 0 && legacyResult.length > 0) {
          trackGA4AndMixpanel?.('plugin_legacy_bucket_fallback', {
            eventAction: 'plugin_legacy_bucket_fallback',
            bucket: params.bucket,
            legacyBucket,
          });
          return legacyResult;
        }

        return result;
      }
    : undefined;

  return {
    presentationProps,
    presentationColorPaletteProps,
    presentationLighterColorPaletteProps,
    slideProps,
    baseUrl,
    subscribeTopic,
    unsubscribeTopic,
    reportHeight,
    xprops,
    trackGA4AndMixpanel,
    getValues: wrappedGetValues,
    filterProfaneWords: xprops?.filterProfaneWords,
  };
}
