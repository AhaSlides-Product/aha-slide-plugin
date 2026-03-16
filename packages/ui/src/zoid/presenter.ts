import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { createPresenterPlugin } from '@aha/core';
import type { ImageUploadResult, PluginKeyboardEvent, ConfirmModalPayload } from '@aha/core';
import {
  BaseSlidePluginProps,
  UseSlidePluginOptions,
  BaseSlidePluginReturn,
} from './base';

export type { ConfirmModalPayload };

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
   */
  showToastInfo?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Show a success toast message in the parent app.
   */
  showToastSuccess?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Show an error toast message in the parent app.
   */
  showToastError?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Send a vote outcome (vote count and tooltip) to the presenter app.
   */
  sendVoteOutcome?: (payload: { voteCount: number; tooltip?: string }) => void;
  /**
   * Open a full-screen modal with a custom path.
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
    }
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
}

/**
 * Hook for Presenter Plugins (Canvas, Settings).
 * Provides access to presentation and slide data, as well as actions to manage slide attributes.
 *
 * @deprecated Use `createPresenterPlugin` from `@aha/core` instead.
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for presentation and slide props, and actions for slide attributes.
 */
export function usePresenterPlugin(options: UseSlidePluginOptions = {}): PresenterPluginReturn {
  const plugin = createPresenterPlugin({
    autoHeight: options.autoHeight ?? false,
  });

  const presentationProps = ref<Record<string, any> | undefined>(plugin.getPresentation());
  const presentationColorPaletteProps = ref<string[] | undefined>(plugin.getPresentationColorPalette());
  const presentationLighterColorPaletteProps = ref<string[] | undefined>(plugin.getPresentationLighterColorPalette());
  const slideProps = ref<Record<string, any> | undefined>(plugin.getSlide());
  const baseUrl = ref<string | undefined>(plugin.getBaseUrl());
  const currentUserProps = ref<Record<string, any> | undefined>(plugin.getCurrentUser());

  const unsubs: (() => void)[] = [];

  onMounted(() => {
    plugin.init();

    unsubs.push(plugin.onPresentationChange((val) => { presentationProps.value = val; }));
    unsubs.push(plugin.onSlideChange((val) => { slideProps.value = val; }));
    unsubs.push(plugin.onBaseUrlChange((val) => { baseUrl.value = val; }));
    unsubs.push(plugin.onPresentationColorPaletteChange((val) => { presentationColorPaletteProps.value = val; }));
    unsubs.push(plugin.onPresentationLighterColorPaletteChange((val) => { presentationLighterColorPaletteProps.value = val; }));
    unsubs.push(plugin.onCurrentUserChange((val) => { currentUserProps.value = val; }));
  });

  onUnmounted(() => {
    unsubs.forEach((fn) => fn());
    plugin.destroy();
  });

  const xprops = (window as any).xprops;

  return {
    presentationProps,
    presentationColorPaletteProps,
    presentationLighterColorPaletteProps,
    slideProps,
    currentUserProps,
    baseUrl,
    subscribeTopic: xprops?.subscribeTopic ? (opts: any) => plugin.subscribeTopic(opts) : undefined,
    unsubscribeTopic: xprops?.unsubscribeTopic ? (topic: string) => plugin.unsubscribeTopic(topic) : undefined,
    getValues: xprops?.getValues ? (params: any) => plugin.getValues(params) : undefined,
    getSlideAttributesAction: (slideId?: string | number) => plugin.getSlideAttributes(slideId),
    upsertSlideAttributeAction: xprops?.upsertSlideAttributeAction
      ? (payload: any) => plugin.upsertSlideAttribute(payload)
      : undefined,
    uploadImage: xprops?.uploadImage
      ? (file: File) => plugin.uploadImage(file)
      : undefined,
    onKeyboard: xprops?.onKeyboard
      ? (callback: (event: PluginKeyboardEvent) => void) => plugin.onKeyboard(callback)
      : undefined,
    emitKeyboardEvent: xprops?.emitKeyboardEvent
      ? (event: PluginKeyboardEvent) => plugin.emitKeyboardEvent(event)
      : undefined,
    openUploadImageModal: xprops?.openUploadImageModal
      ? () => plugin.openUploadImageModal()
      : undefined,
    openEditImageModal: xprops?.openEditImageModal
      ? (currentImageUrl: string) => plugin.openEditImageModal(currentImageUrl)
      : undefined,
    showToastInfo: xprops?.showToastInfo
      ? (text: string, uniqName?: string, action?: any, options?: any) => plugin.showToastInfo(text, uniqName, action, options)
      : undefined,
    showToastSuccess: xprops?.showToastSuccess
      ? (text: string, uniqName?: string, action?: any, options?: any) => plugin.showToastSuccess(text, uniqName, action, options)
      : undefined,
    showToastError: xprops?.showToastError
      ? (text: string, uniqName?: string, action?: any, options?: any) => plugin.showToastError(text, uniqName, action, options)
      : undefined,
    setSubmissionCount: xprops?.sendVoteOutcome
      ? (payload: { count: number; tooltip?: string }) => plugin.setSubmissionCount(payload)
      : undefined,
    openPluginModal: xprops?.openPluginModal
      ? (path?: string) => plugin.openPluginModal(path)
      : undefined,
    closePluginModal: xprops?.closePluginModal
      ? () => plugin.closePluginModal()
      : undefined,
    reportHeight: () => plugin.reportHeight(),
    accessToken: plugin.getAccessToken(),
    showConfirmModal: xprops?.showConfirmModal
      ? (payload: ConfirmModalPayload) => plugin.showConfirmModal(payload)
      : undefined,
    clearSlideData: xprops?.clearSlideData
      ? (slideId: string) => plugin.clearSlideData(slideId)
      : undefined,
    trackGA4AndMixpanel: xprops?.trackGA4AndMixpanel
      ? (eventName: string, payload: any) => plugin.trackGA4AndMixpanel(payload)
      : undefined,
    allowPDFRender: xprops?.allowPDFRender
      ? () => plugin.allowPDFRender()
      : undefined,
  };
}
