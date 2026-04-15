import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, type Ref } from 'vue';
import { ImageUploadResult } from '../image';
import {
  BaseSlidePluginProps,
  PluginKeyboardEvent,
  UseSlidePluginOptions,
  BaseSlidePluginReturn,
  useBaseSlidePlugin
} from './base';


type ConfirmModalPayload = {
  /** The title of the confirm modal */
  title: string,
  /** The content of the confirm modal */
  content: string,
  /** The text to display on the ok button */
  okText?: string,
  /** The text to display on the cancel button */
  cancelText?: string,
  /** The variant of the confirm modal */
  variant?: 'primary' | 'danger'
}
/**
 * Interface for the properties expected by the PresenterSlidePluginIframe component.
 */
export interface SlidePluginProps extends BaseSlidePluginProps {
  presentation?: BaseSlidePluginProps['presentation'] & {
    /** The teamplay object used in the presentation */
    teamplay?: Record<string, any>;
  };
  /**
   * Information about the current user.
   */
  currentUser?: {
    /** The language code of the presenter */
    presenterLanguage?: string;
    [key: string]: any;
  };
  /** 
   * Action to fetch all custom attributes for the current slide from the parent application.
   * 
   * @param slideId - Optional override for the slide identifier.
   * @returns A promise resolving to an object containing slide attributes.
   */
  getSlideAttributesAction?: (slideId?: string | number) => Promise<any>;
  /** 
   * Action to create or update a specific attribute for the current slide in the parent application.
   * 
   * @param payload - The attribute data to sync.
   * @returns A promise resolving when the update is complete.
   */
  uploadImage: () => Promise<ImageUploadResult>;
  /** 
   * Callback function to subscribe to keyboard events from the parent application.
   * 
   * @param callback - The function to call when a keyboard event occurs.
   */
  onKeyboard?: (callback: (event: PluginKeyboardEvent) => void) => void;
  /** 
   * Action to emit a keyboard event from the plugin to the parent application.
   * 
   * @param event - The keyboard event data to emit.
   */
  emitKeyboardEvent?: (event: PluginKeyboardEvent) => void;
  /**
   * Show an info toast message in the parent app.
   * @param text - The message to display.
   * @param uniqName - A unique identifier for the toast.
   * @param action - An optional action object.
   * @param options - Additional toast options.
   */
  showToastInfo?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Show a success toast message in the parent app.
   * @param text - The message to display.
   * @param uniqName - A unique identifier for the toast.
   * @param action - An optional action object.
   * @param options - Additional toast options.
   */
  showToastSuccess?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Show an error toast message in the parent app.
   * @param text - The message to display.
   * @param uniqName - A unique identifier for the toast.
   * @param action - An optional action object.
   * @param options - Additional toast options.
   */
  showToastError?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Send a vote outcome (vote count and tooltip) to the presenter app.
   * @param payload - The vote outcome data.
   */
  sendVoteOutcome?: (payload: { voteCount: number; tooltip?: string }) => void;
  /**
   * Open a full-screen modal with a custom path.
   * @param path - The custom path for the modal iframe.
   */
  openPluginModal?: (path?: string) => void;
  /**
   * Close the currently open plugin modal.
   */
  closePluginModal?: () => void;

  showConfirmModal?: (payload: ConfirmModalPayload) => Promise<boolean>;

  clearSlideData?: (slideId: string) => Promise<void>;

  /**
   * Method to allow PDF rendering after the plugin has finished loading and rendering its UI.
   */
  allowPDFRender?: () => void;

  /**
   * Register a callback to be notified when slide attributes change.
   * The parent subscribes to the Vuex slideAttributes/updateAttributes mutation
   * and invokes the callback with the mutation payload.
   *
   * @param callback - Called with { presentationId, slideId, attributes } when attributes change.
   */
  onSlideAttributesChanged?: (callback: (payload: { presentationId: string | number; slideId: string | number; attributes: Record<string, any> }) => void) => void;

  /**
   * Action to emit a broadcast action from the plugin iframe to the parent application.
   * @param key - The broadcast key.
   * @param args - The arguments for the action.
   */
  emitBroadcastAction?: (key: string, args: any[]) => void;

  /**
   * Register a callback in the plugin iframe for broadcast actions from the parent application.
   * @param callback - The function to call when a broadcast action occurs.
   */
  onBroadcastAction?: (callback: (key: string, args: any[]) => void) => void;
}

/**
 * PresenterSlidePluginIframe is a cross-domain component (zoid) that allows
 * Ahaslides parent applications to communicate with plugin iframes in the presenter view.
 */
export const PresenterSlidePluginIframe = zoid.create({
  tag: 'presenter-slide-plugin-iframe',
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
    presentationAttributeColorPalette: {
      type: 'object',
      required: false,
    },
    slide: {
      type: 'object',
      required: false,
    },
    currentUser: {
      type: 'object',
      required: false,
    },
    onHeightChange: {
      type: 'function',
      required: false,
    },
    getSlideAttributesAction: {
      type: 'function',
      required: false,
    },
    upsertSlideAttributeAction: {
      type: 'function',
      required: false,
    },
    baseUrl: {
      type: 'string',
      required: false,
    },
    subscribeTopic: {
      type: 'function',
      required: false,
    },
    unsubscribeTopic: {
      type: 'function',
      required: false,
    },
    trackGA4AndMixpanel: {
      type: 'function',
      required: false,
    },
    uploadImage: {
      type: 'function',
      required: false,
    },
    onKeyboard: {
      type: 'function',
      required: false,
    },
    emitKeyboardEvent: {
      type: 'function',
      required: false,
    },
    showToastInfo: {
      type: 'function',
      required: false,
    },
    showToastSuccess: {
      type: 'function',
      required: false,
    },
    showToastError: {
      type: 'function',
      required: false,
    },
    /**
     * Action to send a vote outcome (vote count and tooltip) from the plugin iframe to the parent.
     * @type {function}
     * @param {object} payload - The vote outcome data.
     * @param {number} payload.voteCount - The number of votes to display.
     * @param {string} [payload.tooltip] - Optional tooltip text to display on hover.
     */
    sendVoteOutcome: {
      type: 'function',
      required: false,
    },
    openPluginModal: {
      type: 'function',
      required: false,
    },
    closePluginModal: {
      type: 'function',
      required: false,
    },
    token: {
      type: 'string',
      required: false,
    },
    showConfirmModal: {
      type: 'function',
      required: false,
    },
    allowPDFRender: {
      type: 'function',
      required: false,
    },
    onSlideAttributesChanged: {
      type: 'function',
      required: false,
    },
    filterProfaneWords: {
      type: 'function',
      required: false,
    },
    emitBroadcastAction: {
      type: 'function',
      required: false,
    },
    onBroadcastAction: {
      type: 'function',
      required: false,
    },
  },
});

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

export type BroadcastActionResult<T extends (...args: any[]) => any> = {
  /** The wrapped function. Call this as you would the original. */
  fn: T;
  /**
   * Removes the handler from the registry.
   * Call this in `onUnmounted` (or equivalent cleanup) to prevent stale handlers.
   */
  unregister: () => void;
};

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
