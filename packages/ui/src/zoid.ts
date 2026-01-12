import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted } from 'vue';

/**
 * Interface for the properties expected by the SlidePluginIframe component.
 */
export interface SlidePluginProps {
  /** The URL of the plugin to be loaded in the iframe */
  url: string;
  /** Presentation-wide settings and data */
  presentation?: {
    language?: string;
    fontFamily?: string;
    showHyperLink?: boolean;
    filteringProfanity?: boolean;
    [key: string]: any;
  };
  /** Data specific to the currently active slide */
  slideActive?: {
    id?: string | number;
    textColour?: string;
    stopSubmission?: boolean;
    hideResult?: boolean;
    [key: string]: any;
  };
  /** 
   * Callback to report height changes from the child to the parent. 
   * Sending null signals the parent to use 100% height (useful for fixed-height or full-screen plugins).
   */
  onHeightChange?: (height: number | null) => void;
}

/**
 * SlidePluginIframe is a cross-domain component (zoid) that allows
 * Ahaslides parent applications to communicate with plugin iframes.
 * 
 * @example
 * ```typescript
 * import { SlidePluginIframe } from '@aha/ui';
 * 
 * // Initializing the component
 * const instance = SlidePluginIframe({
 *   url: 'https://plugin.example.com',
 *   onHeightChange: (height) => {
 *     console.log('New height:', height);
 *   }
 * });
 * 
 * // Rendering to a container
 * instance.render('#zoid-container');
 * ```
 */
export const SlidePluginIframe = zoid.create({
  tag: 'slide-plugin-iframe',
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
    slideActive: {
      type: 'object',
      required: false,
    },
    onHeightChange: {
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
  if (typeof window === 'undefined') return () => {};
  
  const xprops = (window as any).xprops;
  console.log('[SlidePlugin] xprops in autoReportHeight:', xprops);
  if (!xprops || typeof xprops.onHeightChange !== 'function') {
    console.warn('[SlidePlugin] xprops.onHeightChange is not a function');
    return () => {};
  }

  const sendHeight = () => {
    const height = document.body.scrollHeight;
    console.log('[SlidePlugin] Reporting height:', height);
    xprops.onHeightChange(height);
  };

  const observer = new ResizeObserver((entries) => {
    console.log('[SlidePlugin] Resize detected');
    sendHeight();
  });
  observer.observe(document.body);

  // Initial report
  setTimeout(sendHeight, 100); // Wait a bit for initial render

  return () => observer.disconnect();
}

/**
 * Options for the useSlidePlugin hook.
 */
export interface UseSlidePluginOptions {
  /** 
   * Whether to automatically report content height to the parent.
   * - If true (default): Child measures its height and tells the parent to resize.
   * - If false: Child tells the parent to use 100% height.
   */
  autoHeight?: boolean;
}

/**
 * Vue composition hook for slide plugin components.
 * 
 * Features:
 * 1. **Prop Management**: Provides reactive access to `presentationProps` and `slideActiveProps`.
 * 2. **Prop Diffing**: Automatically logs changes to specific keys when the parent updates props.
 * 3. **Height Reporting**: Handles automatic height reporting via {@link autoReportHeight}.
 * 
 * @example
 * ```typescript
 * // Standard auto-height usage
 * const { presentationProps } = useSlidePlugin();
 * 
 * // Fixed 100% height usage
 * const { slideActiveProps } = useSlidePlugin({ autoHeight: false });
 * ```
 * 
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for presentation and slide props.
 */
export function useSlidePlugin(options: UseSlidePluginOptions = { autoHeight: true }) {
  console.log('[SlidePlugin] useSlidePlugin called', options);
  const presentationProps = ref<SlidePluginProps['presentation']>((window as any).xprops?.presentation);
  const slideActiveProps = ref<SlidePluginProps['slideActive']>((window as any).xprops?.slideActive);

  /**
   * Compares incoming props with current values and logs differences.
   */
  const diffAndLog = (newProps: SlidePluginProps) => {
    // ... (diffing logic remains same)
    if (newProps.presentation) {
      const oldPresentation = presentationProps.value || {};
      Object.keys(newProps.presentation).forEach((key) => {
        if (newProps.presentation![key] !== oldPresentation[key]) {
          console.log(`[SlidePlugin] Key changed: presentation.${key}`, {
            from: oldPresentation[key],
            to: newProps.presentation![key],
          });
        }
      });
      presentationProps.value = { ...newProps.presentation };
    }

    if (newProps.slideActive) {
      const oldSlideActive = slideActiveProps.value || {};
      Object.keys(newProps.slideActive).forEach((key) => {
        if (newProps.slideActive![key] !== oldSlideActive[key]) {
          console.log(`[SlidePlugin] Key changed: slideActive.${key}`, {
            from: oldSlideActive[key],
            to: newProps.slideActive![key],
          });
        }
      });
      slideActiveProps.value = { ...newProps.slideActive };
    }
  };

  onMounted(() => {
    console.log('[SlidePlugin] useSlidePlugin onMounted');
    
    let cleanup = () => {};
    if (options.autoHeight !== false) {
      cleanup = autoReportHeight();
    } else {
      const xprops = (window as any).xprops;
      if (xprops && typeof xprops.onHeightChange === 'function') {
        console.log('[SlidePlugin] autoHeight is disabled, signaling parent to use 100% height');
        xprops.onHeightChange(null);
      }
    }

    // Set up prop listeners if xprops are available
    const xprops = (window as any).xprops;
    if (xprops && typeof xprops.onProps === 'function') {
      console.log('[SlidePlugin] Setting up xprops.onProps listener');
      xprops.onProps((newProps: SlidePluginProps) => {
        diffAndLog(newProps);
      });
    } else {
      console.warn('[SlidePlugin] xprops.onProps is not available');
    }

    return cleanup;
  });

  return {
    presentationProps,
    slideActiveProps,
  };
}
