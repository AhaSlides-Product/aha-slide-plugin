/**
 * Framework-agnostic vanilla core for the Presenter plugin.
 */

import { createBasePlugin, type BasePluginState, type PluginStore } from './base';
import type { PluginKeyboardEvent } from '../zoid/base';
import type { ImageUploadResult } from '../image';

export interface PresenterPluginState extends BasePluginState {
  currentUserProps: Record<string, any> | undefined;
}

type ConfirmModalPayload = {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
};

export interface PresenterPluginInstance extends PluginStore<PresenterPluginState> {
  getSlideAttributesAction: (slideId?: string | number) => Promise<any>;
  upsertSlideAttributeAction: ((payload: { slideId?: string | number; attributeKey: string; attributeValue: any }) => Promise<any>) | undefined;
  onKeyboard: ((callback: (event: PluginKeyboardEvent) => void) => void) | undefined;
  emitKeyboardEvent: ((event: PluginKeyboardEvent) => void) | undefined;
  uploadImage: ((file: File) => Promise<ImageUploadResult>) | undefined;
  openUploadImageModal: (() => Promise<ImageUploadResult>) | undefined;
  openEditImageModal: ((currentImageUrl: string) => Promise<ImageUploadResult>) | undefined;
  showToastInfo: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastSuccess: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastError: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  setSubmissionCount: ((payload: { count: number; tooltip?: string }) => void) | undefined;
  openPluginModal: ((path?: string) => void) | undefined;
  closePluginModal: (() => void) | undefined;
  getValues: ((params: { bucket: string; key?: string }) => Promise<{ key: string; path: string; value: string }[]>) | undefined;
  accessToken: string | undefined;
  showConfirmModal: ((payload: ConfirmModalPayload) => Promise<boolean>) | undefined;
  clearSlideData: ((slideId: string) => Promise<void>) | undefined;
  subscribeTopic: ((options: { type?: string; topic: string; callback: (topic: string, message: any) => void }) => void) | undefined;
  unsubscribeTopic: ((topic: string) => void) | undefined;
  reportHeight: () => void;
  destroy: () => void;
}

/**
 * Creates a framework-agnostic presenter plugin instance.
 */
export function createPresenterPlugin(
  options: { autoHeight?: boolean } = { autoHeight: true },
): PresenterPluginInstance {
  const base = createBasePlugin<{ currentUserProps: Record<string, any> | undefined }>(
    options,
    () => ({
      currentUserProps: (window as any).xprops?.currentUser,
    }),
    (newProps, update) => {
      const extra: Record<string, any> = {};
      if (newProps.currentUser) extra.currentUserProps = { ...newProps.currentUser };
      update(extra);
    },
  );

  const { xprops } = base;

  // Wrap getSlideAttributesAction to normalize array response to object
  const originalGetAttributes = xprops?.getSlideAttributesAction;
  const getSlideAttributesAction = async (slideId?: string | number): Promise<any> => {
    if (typeof originalGetAttributes !== 'function') return undefined;
    const response = await originalGetAttributes(slideId);
    if (Array.isArray(response)) {
      return response.reduce((acc: Record<string, any>, item: any) => {
        if (item && item.type) {
          acc[item.type] = item.attributes;
        }
        return acc;
      }, {} as Record<string, any>);
    }
    return response;
  };

  return {
    getState: base.getState,
    subscribe: base.subscribe,
    destroy: base.destroy,
    subscribeTopic: base.subscribeTopic,
    unsubscribeTopic: base.unsubscribeTopic,
    reportHeight: base.reportHeight,
    getSlideAttributesAction,
    upsertSlideAttributeAction: xprops?.upsertSlideAttributeAction,
    onKeyboard: xprops?.onKeyboard,
    emitKeyboardEvent: xprops?.emitKeyboardEvent,
    uploadImage: xprops?.uploadImage,
    openUploadImageModal: xprops?.openUploadImageModal,
    openEditImageModal: xprops?.openEditImageModal,
    showToastInfo: xprops?.showToastInfo,
    showToastSuccess: xprops?.showToastSuccess,
    showToastError: xprops?.showToastError,
    setSubmissionCount: xprops?.sendVoteOutcome
      ? (payload: { count: number; tooltip?: string }) => xprops.sendVoteOutcome({ voteCount: payload.count, ...payload })
      : undefined,
    openPluginModal: xprops?.openPluginModal,
    closePluginModal: xprops?.closePluginModal,
    getValues: xprops?.getValues,
    accessToken: xprops?.token,
    showConfirmModal: xprops?.showConfirmModal,
    clearSlideData: xprops?.clearSlideData,
  };
}
