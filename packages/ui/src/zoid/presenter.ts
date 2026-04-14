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
    filterProfaneWords: baseHook.filterProfaneWords,
  };
}
