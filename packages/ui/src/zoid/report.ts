import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted, type Ref } from 'vue';
import { autoReportHeight, type UseSlidePluginOptions } from './base';

/**
 * Properties for the report slide plugin.
 */
export interface ReportProps {
    /** The token for authentication/authorization */
    token: string;
    /** The current language code (e.g., 'en', 'vi') */
    currentLanguage: string;
    /** 
     * Callback to report height changes from the child to the parent. 
     * Sending null signals the parent to use 100% height.
     * 
     * @param height - The new height in pixels, or null for 100% height.
     */
    onHeightChange?: (height: number | null) => void;
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
    },
});

/**
 * Return type for the report slide plugin hook.
 */
export interface ReportReturn {
    token: Ref<string | undefined>;
    currentLanguage: Ref<string | undefined>;
}

/**
 * Hook that provides functionality for the report slide plugin.
 * 
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for token and currentLanguage.
 */
export function useReportPlugin(
    options: UseSlidePluginOptions = { autoHeight: true }
): ReportReturn & { xprops: any } {
    const token = ref<string | undefined>((window as any).xprops?.token);
    const currentLanguage = ref<string | undefined>((window as any).xprops?.currentLanguage);

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

    const xprops = (window as any).xprops;

    return {
        token,
        currentLanguage,
        xprops,
    };
}
