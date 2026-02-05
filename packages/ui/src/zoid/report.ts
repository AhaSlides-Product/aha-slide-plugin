import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted, type Ref } from 'vue';
import { autoReportHeight, type UseSlidePluginOptions } from './base';

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
    translationMap?: Record<string, string>;
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
        translationMap: {
            type: 'object',
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
}

/**
 * Hook that provides functionality for the report slide plugin.
 * 
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for token and currentLanguage.
 */
export function useReportPlugin(
    options: UseSlidePluginOptions = { autoHeight: true }
): ReportReturn {
    const token = ref<string | undefined>((window as any).xprops?.token);
    const currentLanguage = ref<string | undefined>((window as any).xprops?.currentLanguage);
    const trackGA4AndMixpanel = (window as any).xprops?.trackGA4AndMixpanel;
    const replaceRoute = (window as any).xprops?.replaceRoute;
    const pushRoute = (window as any).xprops?.pushRoute;
    const openExportModalForPresentation = (window as any).xprops?.openExportModalForPresentation;
    const locale = ref<string | undefined>((window as any).xprops?.locale);
    const translationMap = ref<Record<string, string> | undefined>((window as any).xprops?.translationMap);

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
                if (newProps.token) token.value = newProps.token;
                if (newProps.currentLanguage) currentLanguage.value = newProps.currentLanguage;
            });
        }
        return cleanup;
    });

    return {
        token,
        currentLanguage,
        trackGA4AndMixpanel,
        replaceRoute,
        pushRoute,
        openExportModalForPresentation,
        locale,
        translationMap,
    };
}
