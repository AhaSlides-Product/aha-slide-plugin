import { reactive, onMounted } from 'vue';
import type { SlidePluginProps } from '@aha/ui';

/**
 * A composable that provides reactive access to zoid xprops.
 * Use this in your Vue components to access data passed from the parent.
 * 
 * @example
 * ```typescript
 * const xprops = useXProps();
 * console.log(xprops.presentation?.language);
 * ```
 */
export function useXProps() {
  const xprops = reactive<any>((window as any).xprops || {});

  onMounted(() => {
    if ((window as any).xprops) {
      // If xprops has an onProps method, we can use it to stay updated
      if (typeof (window as any).xprops.onProps === 'function') {
        (window as any).xprops.onProps((newProps: SlidePluginProps) => {
            console.log('newProps', newProps);
            Object.assign(xprops, newProps);
        });
      }
    }
  });

  return xprops;
}
