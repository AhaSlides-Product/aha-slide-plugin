import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { createReportPlugin } from '@aha/core';
import type { UseSlidePluginOptions } from './base';

/**
 * Properties for the report slide plugin.
 */
export interface ReportProps {
  /** The token for authentication/authorization */
  token?: string;
  /** The current language code (e.g., 'en', 'vi') */
  currentLanguage?: string;
  /**
   * Callback to report height changes from the child to the parent.
   * Sending null signals the parent to use 100% height.
   *
   * @param height - The new height in pixels, or null for 100% height.
   */
  onHeightChange?: (height: number | null) => void;
  /**
   * Action to track events to GA4 and Mixpanel.
   *
   * @param payload - The event payload to track.
   */
  trackGA4AndMixpanel?: (eventName: string, payload: any) => void;
  replaceRoute?: (location: any, onComplete?: Function, onAbort?: Function) => void;
  pushRoute?: (location: any, onComplete?: Function, onAbort?: Function) => void;
  openExportModalForPresentation?: (presentation: any) => void;
  locale?: string;
  currentUser?: object;
  featureFlags?: object;
  translationMap?: Record<string, string>;
  iframePath?: string;
}

/**
 * ReportIframe is a cross-domain component (zoid) that allows
 * Ahaslides parent applications to communicate with plugin iframes in the report view.
 */
export const ReportIframe = zoid.create({
  tag: 'report-app-iframe',
  url: ({ props }: { props: ReportProps & { url: string } }) => props.url,
  props: {
    url: {
      type: 'string',
      required: true,
      queryParam: false,
    },
    token: {
      type: 'string',
      required: true,
    },
    currentLanguage: {
      type: 'string',
      required: false,
      defaultValue: 'en',
    },
    onHeightChange: {
      type: 'function',
      required: false,
    },
    trackGA4AndMixpanel: {
      type: 'function',
      required: false,
    },
    replaceRoute: {
      type: 'function',
      required: false,
    },
    pushRoute: {
      type: 'function',
      required: false,
    },
    openExportModalForPresentation: {
      type: 'function',
      required: false,
    },
    locale: {
      type: 'string',
      required: false,
      defaultValue: 'en',
    },
    featureFlags: {
      type: 'object',
      required: false,
    },
    currentUser: {
      type: 'object',
      required: false,
    },
    translationMap: {
      type: 'object',
      required: false,
    },
    iframePath: {
      type: 'string',
      required: false,
    },
  },
});

/**
* Return type for the report slide plugin hook.
*/
export interface ReportReturn {
  token: Ref<string | undefined>;
  currentLanguage: Ref<string | undefined>;
  trackGA4AndMixpanel: ((eventName: string, payload: any) => void) | undefined;
  replaceRoute: ((location: any, onComplete?: Function, onAbort?: Function) => void) | undefined;
  pushRoute: ((location: any, onComplete?: Function, onAbort?: Function) => void) | undefined;
  openExportModalForPresentation: ((presentation: any) => void) | undefined;
  locale: Ref<string | undefined>;
  translationMap: Ref<Record<string, string> | undefined>;
  iframePath: Ref<string | undefined>;
  featureFlags: Ref<Record<string, string> | undefined>;
}

/**
* Hook that provides functionality for the report slide plugin.
*
* @deprecated Use `createReportPlugin` from `@aha/core` instead.
* @param options - Configure hook behavior (e.g., disable auto-height).
* @returns Reactive refs for token and currentLanguage.
*/
export function useReportPlugin(
  options: UseSlidePluginOptions = { autoHeight: true }
): ReportReturn {
  const plugin = createReportPlugin({
    autoHeight: options.autoHeight !== false,
  });

  const token = ref<string | undefined>(plugin.getToken());
  const currentLanguage = ref<string | undefined>(plugin.getCurrentLanguage());
  const locale = ref<string | undefined>(plugin.getLocale());
  const translationMap = ref<Record<string, string> | undefined>(plugin.getTranslationMap());
  const featureFlags = ref<Record<string, string> | undefined>(plugin.getFeatureFlags());
  const iframePath = ref<string | undefined>(plugin.getIframePath());

  const unsubs: (() => void)[] = [];

  onMounted(() => {
    plugin.init();

    unsubs.push(plugin.onTokenChange((val) => { token.value = val; }));
    unsubs.push(plugin.onCurrentLanguageChange((val) => { currentLanguage.value = val; }));
    unsubs.push(plugin.onLocaleChange((val) => { locale.value = val; }));
    unsubs.push(plugin.onTranslationMapChange((val) => { translationMap.value = val; }));
    unsubs.push(plugin.onFeatureFlagsChange((val) => { featureFlags.value = val; }));
    unsubs.push(plugin.onIframePathChange((val) => { iframePath.value = val; }));
  });

  onUnmounted(() => {
    unsubs.forEach((fn) => fn());
    plugin.destroy();
  });

  const xprops = (window as any).xprops;

  return {
    token,
    currentLanguage,
    trackGA4AndMixpanel: xprops?.trackGA4AndMixpanel
      ? (eventName: string, payload: any) => plugin.trackGA4AndMixpanel(eventName, payload)
      : undefined,
    replaceRoute: xprops?.replaceRoute
      ? (location: any, onComplete?: Function, onAbort?: Function) => plugin.replaceRoute(location, onComplete, onAbort)
      : undefined,
    pushRoute: xprops?.pushRoute
      ? (location: any, onComplete?: Function, onAbort?: Function) => plugin.pushRoute(location, onComplete, onAbort)
      : undefined,
    openExportModalForPresentation: xprops?.openExportModalForPresentation
      ? (presentation: any) => plugin.openExportModalForPresentation(presentation)
      : undefined,
    locale,
    translationMap,
    featureFlags,
    iframePath,
  };
}
