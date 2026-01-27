import * as zoid from 'zoid/dist/zoid.frameworks';
import { ImageUploadResult } from '../image';
import {
  BaseSlidePluginProps,
  PluginKeyboardEvent,
  UseSlidePluginOptions,
  BaseSlidePluginReturn,
  useBaseSlidePlugin
} from './base';

/**
 * Interface for the properties expected by the PresenterSlidePluginIframe component.
 */
export interface SlidePluginProps extends BaseSlidePluginProps {
  presentation?: BaseSlidePluginProps['presentation'] & {
    /** The teamplay object used in the presentation */
    teamplay?: Record<string, any>;
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
    audienceSendCountingUniqueAction: {
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
  },
});

/**
 * Hook for Presenter Plugins (Canvas, Settings).
 * Provides access to presentation and slide data, as well as actions to manage slide attributes.
 * 
 * @param options - Configure hook behavior (e.g., disable auto-height).
 * @returns Reactive refs for presentation and slide props, and actions for slide attributes.
 */
export function usePresenterPlugin(options: UseSlidePluginOptions = { autoHeight: true }): BaseSlidePluginReturn & {
  getSlideAttributesAction: (slideId?: string | number) => Promise<any>;
  upsertSlideAttributeAction: ((payload: { slideId?: string | number, attributeKey: string; attributeValue: any; }) => Promise<any>) | undefined;
  onKeyboard: ((callback: (event: PluginKeyboardEvent) => void) => void) | undefined;
  emitKeyboardEvent: ((event: PluginKeyboardEvent) => void) | undefined;
  uploadImage: ((file: File) => Promise<ImageUploadResult>) | undefined;
  openUploadImageModal: (() => Promise<ImageUploadResult>) | undefined;
  openEditImageModal: ((currentImageUrl: string) => Promise<ImageUploadResult>) | undefined;
} {
  const baseHook = useBaseSlidePlugin(options);
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
    baseUrl: baseHook.baseUrl,
    subscribeTopic: baseHook.subscribeTopic,
    unsubscribeTopic: baseHook.unsubscribeTopic,
    audienceSendCountingUniqueAction: baseHook.audienceSendCountingUniqueAction,
    getSlideAttributesAction,
    upsertSlideAttributeAction,
    uploadImage,
    onKeyboard,
    emitKeyboardEvent,
    openUploadImageModal,
    openEditImageModal,
  };
}
