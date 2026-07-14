import { ref, onMounted, onUnmounted, readonly } from 'vue';

/**
 * Host-driven keep-alive preload flag (host setting `enablePreloadIframe`).
 *
 * The host preloads the next slide's iframe with `active: false` so all the
 * plugin's JS/CSS/HTML bundles download + parse + execute ahead of time, while
 * this flag stays `false` — the slide's real component must NOT render and must
 * NOT consume slide data yet. The moment the slide becomes active the host flips
 * it to `true` via zoid `updateProps` (no iframe reload), and the real component
 * renders with full data instantly (bundles already loaded).
 *
 * Backward compatible: when the host never passes `active` (value `undefined`),
 * the slide is treated as active and renders immediately, as before.
 */
export function usePreloadActive() {
  const xprops = (window as any).xprops;
  // Only an explicit `false` means "still preloading"; undefined => active.
  const isActive = ref(xprops?.active !== false);
  let handle: { cancel?: () => void } | undefined;

  onMounted(() => {
    if (xprops && typeof xprops.onProps === 'function') {
      handle = xprops.onProps((newProps: any) => {
        if (newProps && newProps.active !== undefined) {
          isActive.value = newProps.active !== false;
        }
      });
    }
  });

  onUnmounted(() => handle?.cancel?.());

  return { isActive: readonly(isActive) };
}
