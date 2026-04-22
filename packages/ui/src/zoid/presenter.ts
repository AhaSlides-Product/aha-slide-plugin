import { ref, type Ref } from 'vue';
import { ImageUploadResult } from '../image';
import {
  useBaseSlidePlugin,
  type BaseSlidePluginReturn,
} from './base';
import {
  initZoidForPresenter,
  type PluginKeyboardEvent,
  type UseSlidePluginOptions,
  type ConfirmModalPayload,
  type BroadcastActionResult,
} from '@aha/ui-vanilla';

export type {
  SlidePluginProps,
  ConfirmModalPayload,
  BroadcastActionResult,
} from '@aha/ui-vanilla';

/**
 * PresenterSlidePluginIframe is a cross-domain component (zoid) that allows
 * Ahaslides parent applications to communicate with plugin iframes in the presenter view.
 */
export const PresenterSlidePluginIframe = initZoidForPresenter();

export type PresenterPluginReturn = BaseSlidePluginReturn & {
  getSlideAttributesAction: (slideId?: string | number) => Promise<any>;
  upsertSlideAttributeAction: ((payload: { slideId?: string | number, attributeKey: string; attributeValue: any; }) => Promise<any>) | undefined;
  onKeyboard: ((callback: (event: PluginKeyboardEvent) => void) => void) | undefined;
  emitKeyboardEvent: ((event: PluginKeyboardEvent) => void) | undefined;
  uploadImage: ((file: File) => Promise<ImageUploadResult>) | undefined;
  openUploadImageModal: (() => Promise<ImageUploadResult>) | undefined;
  openEditImageModal: ((currentImageUrl: string) => Promise<ImageUploadResult>) | undefined;
  currentUserProps: Ref<Record<string, any> | undefined>;
  showToastInfo: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastSuccess: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastError: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  setSubmissionCount: ((payload: { count: number; tooltip?: string }) => void) | undefined;
  /**
   * Open a full-screen modal with a custom path.
   * @param path - The custom path for the modal iframe.
   */
  openPluginModal: ((path?: string) => void) | undefined;
  /**
   * Close the currently open plugin modal.
   */
  closePluginModal: (() => void) | undefined;

  /**
   * Access token for the current user.
   */
  accessToken: string | undefined;

  /**
   * Show a confirm modal in the parent app.
   * @param payload - The confirm modal data.
   * @returns A promise resolving to a boolean indicating whether the user confirmed.
   */
  showConfirmModal: ((payload: ConfirmModalPayload) => Promise<boolean>) | undefined;

  /**
   * Clear the slide data in the parent app.
   */
  clearSlideData: ((slideId: string) => Promise<void>) | undefined;

  /**
   * Method to allow PDF rendering after the plugin has finished loading and rendering its UI.
   */
  allowPDFRender: (() => void) | undefined;

  /**
   * Register a callback to be notified when slide attributes change.
   * @param callback - Called with { presentationId, slideId, attributes } when attributes change.
   */
  onSlideAttributesChanged: ((callback: (payload: { presentationId: string | number; slideId: string | number; attributes: Record<string, any> }) => void) => void) | undefined;

  /**
   * Action to emit a broadcast action from the plugin iframe to the parent application.
   */
  emitBroadcastAction: ((key: string, args: any[]) => void) | undefined;
}

/**
 * Hook for Presenter Plugins (Canvas, Settings).
 * Provides access to presentation and slide data, as well as actions to manage slide attributes.
 *
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for presentation and slide props, and actions for slide attributes.
 */
export function usePresenterPlugin(options: UseSlidePluginOptions = {}): PresenterPluginReturn {
  const currentUserProps = ref<Record<string, any> | undefined>((window as any).xprops?.currentUser);

  const baseHook = useBaseSlidePlugin(options, (newProps) => {
    if (newProps.currentUser) currentUserProps.value = { ...newProps.currentUser };
  });
  const { xprops } = baseHook;

  ensureBroadcastListenerRegistered();

  const originalGetAttributes = xprops?.getSlideAttributesAction;
  const getSlideAttributesAction = async (slideId?: string | number): Promise<any> => {
    if (typeof originalGetAttributes !== 'function') return undefined;
    const response = await originalGetAttributes(slideId);
    if (Array.isArray(response)) {
      return response.reduce((acc, item) => {
        if (item && item.type) {
          acc[item.type] = item.attributes;
        }
        return acc;
      }, {} as Record<string, any>);
    }
    return response;
  };

  const upsertSlideAttributeAction = xprops?.upsertSlideAttributeAction;
  const uploadImage = xprops?.uploadImage;
  const onKeyboard = xprops?.onKeyboard;
  const emitKeyboardEvent = xprops?.emitKeyboardEvent;
  const openUploadImageModal = xprops?.openUploadImageModal;
  const openEditImageModal = xprops?.openEditImageModal;

  return {
    presentationProps: baseHook.presentationProps,
    presentationColorPaletteProps: baseHook.presentationColorPaletteProps,
    presentationLighterColorPaletteProps: baseHook.presentationLighterColorPaletteProps,
    slideProps: baseHook.slideProps,
    currentUserProps,
    baseUrl: baseHook.baseUrl,
    subscribeTopic: baseHook.subscribeTopic,
    unsubscribeTopic: baseHook.unsubscribeTopic,
    getValues: baseHook.getValues,
    getSlideAttributesAction,
    upsertSlideAttributeAction,
    uploadImage,
    onKeyboard,
    emitKeyboardEvent,
    openUploadImageModal,
    openEditImageModal,
    showToastInfo: xprops?.showToastInfo,
    showToastSuccess: xprops?.showToastSuccess,
    showToastError: xprops?.showToastError,
    // rename sendVoteCount to setSubmissionCount to avoid confusion
    setSubmissionCount: (payload: { count: number, tooltip?: string }) => xprops?.sendVoteOutcome({ voteCount: payload.count, ...payload }),
    openPluginModal: xprops?.openPluginModal,
    closePluginModal: xprops?.closePluginModal,
    reportHeight: baseHook.reportHeight,
    accessToken: xprops?.token,
    showConfirmModal: xprops?.showConfirmModal,
    clearSlideData: xprops?.clearSlideData,
    trackGA4AndMixpanel: baseHook.trackGA4AndMixpanel,
    allowPDFRender: xprops?.allowPDFRender,
    onSlideAttributesChanged: xprops?.onSlideAttributesChanged,
    emitBroadcastAction: xprops?.emitBroadcastAction,
    filterProfaneWords: baseHook.filterProfaneWords,
  };
}

const broadcastRegistry: Record<string, Function> = {};

/**
 * Tracks keys that were emitted by this plugin instance and are waiting for
 * the host echo. When the host calls `onBroadcastAction` back for a key in
 * this set, we skip local execution to prevent the function from running twice.
 */
const pendingSkip = new Set<string>();

/**
 * Registers the onBroadcastAction listener exactly once at the module level.
 * This prevents duplicate registrations when usePresenterPlugin is called
 * multiple times (e.g., multiple components or component remounts).
 */
let broadcastListenerRegistered = false;
function ensureBroadcastListenerRegistered(): void {
  if (broadcastListenerRegistered) return;
  const xprops = (window as any).xprops;
  if (xprops?.onBroadcastAction) {
    xprops.onBroadcastAction((key: string, args: any[]) => {
      // Skip if this plugin was the one that initiated the broadcast —
      // the local fn was already executed in the wrapper, so we don't
      // want to run it again when the host echoes the action back.
      if (pendingSkip.has(key)) {
        pendingSkip.delete(key);
        return;
      }
      const fn = broadcastRegistry[key];
      if (fn) {
        fn(...args);
      }
    });
    broadcastListenerRegistered = true;
  }
}

/**
 * Wraps a function so it broadcasts to other screens via MQTT.
 *
 * **`key` is required.** Do not rely on `fn.name` — minifiers mangle function
 * names in production builds, making automatic name detection unreliable.
 *
 * @param fn  - The function to wrap.
 * @param key - A stable, unique identifier for this broadcast action.
 * @returns An object with the wrapped `fn` and an `unregister` cleanup callback.
 *
 * @example
 * const { fn: scrollToBottom, unregister } = broadcastAction(() => { ... }, 'scrollToBottom');
 * onUnmounted(unregister);
 */
export function broadcastAction<T extends (...args: any[]) => any>(fn: T, key: string): BroadcastActionResult<T> {
  if (!key) {
    throw new Error('[broadcastAction] A unique `key` string is required. Do not rely on fn.name — it is mangled by minifiers in production.');
  }

  broadcastRegistry[key] = fn;

  const wrapper = function (this: any, ...args: any[]) {
    const result = fn.apply(this, args);
    const xprops = (window as any).xprops;
    if (xprops?.emitBroadcastAction) {
      // Mark this key so the onBroadcastAction echo from the host is ignored,
      // preventing the function from executing a second time on this screen.
      pendingSkip.add(key);
      xprops.emitBroadcastAction(key, args);
    }
    return result;
  };

  const unregister = () => {
    delete broadcastRegistry[key];
  };

  return { fn: wrapper as T, unregister };
}
