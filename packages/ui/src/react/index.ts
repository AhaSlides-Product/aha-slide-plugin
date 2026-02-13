export { usePresenterPlugin } from './usePresenterPlugin';
export type { UsePresenterPluginOptions } from './usePresenterPlugin';

export { useAudiencePlugin } from './useAudiencePlugin';
export type { UseAudiencePluginOptions } from './useAudiencePlugin';

// Re-export core types that React consumers may need
export type { PresenterPluginState } from '../core/presenter';
export type { AudiencePluginState, ParticipantInfo } from '../core/audience';
export type { BasePluginState } from '../core/base';
export type { PluginKeyboardEvent } from '../zoid/base';
export type { ImageUploadResult } from '../image';

// Re-export Zoid iframe components (framework-agnostic)
export { PresenterSlidePluginIframe } from '../zoid/presenter';
export { AudienceSlidePluginIframe } from '../zoid/audience';
