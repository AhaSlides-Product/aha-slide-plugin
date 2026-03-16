import { throttle } from './utils';

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
