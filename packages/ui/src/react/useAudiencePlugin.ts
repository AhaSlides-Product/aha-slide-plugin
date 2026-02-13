import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createAudiencePlugin, type AudiencePluginInstance } from '../core/audience';

export interface UseAudiencePluginOptions {
  autoHeight?: boolean;
}

export function useAudiencePlugin(options: UseAudiencePluginOptions = { autoHeight: true }) {
  const pluginRef = useRef<AudiencePluginInstance | null>(null);

  if (!pluginRef.current) {
    pluginRef.current = createAudiencePlugin(options);
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
    baseUrl: state.baseUrl,
    slideAttributesProps: state.slideAttributesProps,
    audienceName: state.audienceName,
    audienceEmoji: state.audienceEmoji,
    audienceId: state.audienceId,
    audienceEmail: state.audienceEmail,
    audienceTeam: state.audienceTeam,
    participantInfo: state.participantInfo,

    // Actions (stable references from plugin instance)
    subscribeTopic: plugin.subscribeTopic,
    unsubscribeTopic: plugin.unsubscribeTopic,
    reportHeight: plugin.reportHeight,
    uploadImage: plugin.uploadImage,
    showToastInfo: plugin.showToastInfo,
    showToastSuccess: plugin.showToastSuccess,
    showToastError: plugin.showToastError,
    updateAudienceData: plugin.updateAudienceData,
    openPluginModal: plugin.openPluginModal,
    closePluginModal: plugin.closePluginModal,
    onSubmitButtonHeightChange: plugin.onSubmitButtonHeightChange,
  };
}
