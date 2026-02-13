/**
 * Framework-agnostic vanilla core for the Audience plugin.
 */

import { createBasePlugin, type BasePluginState, type PluginStore } from './base';

export type ParticipantInfo = {
  type: string;
  value: string;
};

export interface AudiencePluginState extends BasePluginState {
  slideAttributesProps: Record<string, any> | undefined;
  audienceName: string | undefined;
  audienceEmoji: string | undefined;
  audienceId: string | number | undefined;
  audienceEmail: string | undefined;
  audienceTeam: string | undefined;
  participantInfo: ParticipantInfo[] | undefined;
}

export interface AudiencePluginInstance extends PluginStore<AudiencePluginState> {
  uploadImage: (() => Promise<any>) | undefined;
  showToastInfo: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastSuccess: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  showToastError: ((text: string, uniqName?: string, action?: any, options?: any) => void) | undefined;
  updateAudienceData: ((payload: { audienceName?: string; audienceEmail?: string; audienceEmoji?: string; participantInfo?: ParticipantInfo[] }) => void) | undefined;
  openPluginModal: ((path?: string, data?: any) => void) | undefined;
  closePluginModal: (() => void) | undefined;
  onSubmitButtonHeightChange: ((height: number) => void) | undefined;
  subscribeTopic: ((options: { type?: string; topic: string; callback: (topic: string, message: any) => void }) => void) | undefined;
  unsubscribeTopic: ((topic: string) => void) | undefined;
  reportHeight: () => void;
  destroy: () => void;
}

type AudienceExtraState = Omit<AudiencePluginState, keyof BasePluginState>;

/**
 * Creates a framework-agnostic audience plugin instance.
 */
export function createAudiencePlugin(
  options: { autoHeight?: boolean } = { autoHeight: true },
): AudiencePluginInstance {
  const xprops = typeof window !== 'undefined' ? (window as any).xprops : undefined;

  const base = createBasePlugin<AudienceExtraState>(
    options,
    () => ({
      slideAttributesProps: xprops?.slideAttributes,
      audienceName: xprops?.audience?.audienceName,
      audienceEmoji: xprops?.audience?.audienceEmoji,
      audienceId: xprops?.audience?.audienceId,
      audienceEmail: xprops?.audience?.audienceEmail,
      audienceTeam: xprops?.audience?.audienceTeam,
      participantInfo: xprops?.audience?.participantInfo,
    }),
    (newProps, update) => {
      const extra: Partial<AudienceExtraState> = {};
      if (newProps.slideAttributes) extra.slideAttributesProps = { ...newProps.slideAttributes };
      if (newProps.audience) {
        if (newProps.audience.audienceName !== undefined) extra.audienceName = newProps.audience.audienceName;
        if (newProps.audience.audienceEmoji !== undefined) extra.audienceEmoji = newProps.audience.audienceEmoji;
        if (newProps.audience.audienceId !== undefined) extra.audienceId = newProps.audience.audienceId;
        if (newProps.audience.audienceEmail !== undefined) extra.audienceEmail = newProps.audience.audienceEmail;
        if (newProps.audience.audienceTeam !== undefined) extra.audienceTeam = newProps.audience.audienceTeam;
        if (newProps.audience.participantInfo !== undefined) extra.participantInfo = newProps.audience.participantInfo;
      }
      update(extra);
    },
  );

  return {
    getState: base.getState,
    subscribe: base.subscribe,
    destroy: base.destroy,
    subscribeTopic: base.subscribeTopic,
    unsubscribeTopic: base.unsubscribeTopic,
    reportHeight: base.reportHeight,
    uploadImage: xprops?.uploadImage,
    showToastInfo: xprops?.showToastInfo,
    showToastSuccess: xprops?.showToastSuccess,
    showToastError: xprops?.showToastError,
    updateAudienceData: xprops?.updateAudienceData,
    openPluginModal: xprops?.openPluginModal,
    closePluginModal: xprops?.closePluginModal,
    onSubmitButtonHeightChange: xprops?.onSubmitButtonHeightChange,
  };
}
