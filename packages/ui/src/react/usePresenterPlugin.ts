import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { createPresenterPlugin, type PresenterPluginInstance, type PresenterPluginState } from '../core/presenter';

export interface UsePresenterPluginOptions {
  autoHeight?: boolean;
}

export function usePresenterPlugin(options: UsePresenterPluginOptions = { autoHeight: true }) {
  const pluginRef = useRef<PresenterPluginInstance | null>(null);

  if (!pluginRef.current) {
    pluginRef.current = createPresenterPlugin(options);
  }

  const plugin = pluginRef.current;

  const state = useSyncExternalStore(
    plugin.subscribe,
    plugin.getState,
  );

  useEffect(() => {
    return () => {
      pluginRef.current?.destroy();
    };
  }, []);

  return {
    // Reactive state
    slideProps: state.slideProps,
    presentationProps: state.presentationProps,
    presentationColorPaletteProps: state.presentationColorPaletteProps,
    presentationLighterColorPaletteProps: state.presentationLighterColorPaletteProps,
    currentUserProps: state.currentUserProps,
    baseUrl: state.baseUrl,

    // Actions (stable references from plugin instance)
    getSlideAttributesAction: plugin.getSlideAttributesAction,
    upsertSlideAttributeAction: plugin.upsertSlideAttributeAction,
    subscribeTopic: plugin.subscribeTopic,
    unsubscribeTopic: plugin.unsubscribeTopic,
    reportHeight: plugin.reportHeight,
    onKeyboard: plugin.onKeyboard,
    emitKeyboardEvent: plugin.emitKeyboardEvent,
    uploadImage: plugin.uploadImage,
    openUploadImageModal: plugin.openUploadImageModal,
    openEditImageModal: plugin.openEditImageModal,
    showToastInfo: plugin.showToastInfo,
    showToastSuccess: plugin.showToastSuccess,
    showToastError: plugin.showToastError,
    setSubmissionCount: plugin.setSubmissionCount,
    openPluginModal: plugin.openPluginModal,
    closePluginModal: plugin.closePluginModal,
    getValues: plugin.getValues,
    accessToken: plugin.accessToken,
    showConfirmModal: plugin.showConfirmModal,
    clearSlideData: plugin.clearSlideData,
  };
}
