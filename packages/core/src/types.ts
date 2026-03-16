// Re-export Unsubscribe from observable
export type { Unsubscribe } from './observable'

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

/**
 * Represents the result of an image upload.
 */
export interface ImageUploadResult {
  /** The static asset paths. This one should be save on the database, so it can be used to sign the new URL later */
  path: string;
  /** The public URL of the uploaded image. */
  url: string;
  /** Any additional metadata returned by the upload service. */
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Keyboard
// ---------------------------------------------------------------------------

/**
 * Represents a serializable subset of a KeyboardEvent.
 * Used for cross-domain communication via Zoid.
 */
export interface PluginKeyboardEvent {
  /** The key value of the event */
  key: string;
  /** The physical key code of the event */
  code: string;
  /** Whether the Ctrl key was pressed */
  ctrlKey: boolean;
  /** Whether the Shift key was pressed */
  shiftKey: boolean;
  /** Whether the Alt key was pressed */
  altKey: boolean;
  /** Whether the Meta key was pressed */
  metaKey: boolean;
  /** Whether the event is repeating */
  repeat: boolean;
  /** The location of the key on the keyboard */
  location: number;
  /** The legacy keyCode of the event */
  keyCode: number;
}

// ---------------------------------------------------------------------------
// Base Slide Plugin Props (xprops shape)
// ---------------------------------------------------------------------------

/**
 * Common properties shared between presenter and audience slide plugins.
 */
export interface BaseSlidePluginProps {
  /** The URL of the plugin to be loaded in the iframe */
  url: string;
  /**
   * Presentation-wide settings and data that affect the plugin's appearance and behavior.
   */
  presentation?: {
    /** The unique identifier of the presentation */
    id?: string | number;
    /** The language code (e.g., 'en', 'vi') */
    language?: string;
    /** The font family name used in the presentation */
    fontFamily?: string;
    /** Whether to show hyperlinks in the content */
    showHyperLink?: boolean;
    /** Whether profanity filtering is enabled */
    filteringProfanity?: boolean;
    /** The unique access code of the presentation */
    uniqueAccessCode?: string;
    /** The share code of the presentation */
    shareCode?: string;
    /** The access code of the presentation */
    accessCode?: string;
    /** Whether audience pacing is enabled */
    audiencePacing?: boolean;
    /** Whether the presentation is currently presenting */
    presenting?: boolean;
    /** The audience admission setting (e.g., 'auto', 'manual') */
    audienceAdmission?: string;
    [key: string]: any;
  };
  /**
   * Presentation-wide color palette attributes.
   */
  presentationColorPalette?: string[];
  /**
   * Presentation-wide lighter color palette attributes.
   */
  presentationLighterColorPalette?: string[];
  /**
   * Data specific to the currently active slide.
   */
  slide?: {
    /** The unique identifier of the slide */
    id?: string | number;
    /** The version of the slide */
    version?: number;
    /** Time allowed to answer the slide in seconds */
    timeToAnswer?: number;
    /** The timestamp when the quiz starts */
    quizTimestamp?: number;
    /** Whether multiple choices can be selected */
    multipleChoice?: boolean;
    /** Whether answering correctly awards points */
    isCorrectGetPoint?: boolean;
    /** Whether faster answers award more points */
    fastAnswerGetMorePoint?: boolean;
    /** Minimum points awarded */
    minPoint?: number;
    /** Maximum points awarded */
    maxPoint?: number;
    /** The type of the slide (e.g., 'multiple-choice', 'open-ended') */
    slideType?: string;
    /** Whether streak detection is enabled */
    isEnableStreakDetection?: boolean;
    /** Whether streak bonus is enabled */
    isEnableStreakBonus?: boolean;
    /** Whether the slide has a time limit */
    hasTimeLimit?: boolean;
    /** Whether to show voting results on audience devices */
    showVotingResultsOnAudience?: boolean;
    /** Whether image submission is allowed */
    imageSubmission?: boolean;
    /** The limit on the number of choices */
    limitChoice?: number;
    /** slide title */
    title?: string;
    [key: string]: any;
  };
  /**
   * Callback to report height changes from the child to the parent.
   * Sending null signals the parent to use 100% height.
   *
   * @param height - The new height in pixels, or null for 100% height.
   */
  onHeightChange?: (height: number | null) => void;
  /** The base URL of the parent application */
  baseUrl?: string;
  /**
   * Subscribe to a specific MQTT topic.
   *
   * @param options - Subscription options including type, topic, and callback.
   */
  subscribeTopic?: (options: { type?: string; topic: string; callback: (topic: string, message: any) => void }) => void;
  /**
   * Unsubscribe from a specific MQTT topic.
   *
   * @param topic - The topic to unsubscribe from.
   */
  unsubscribeTopic?: (topic: string) => void;
  /**
   * Action to track events to GA4 and Mixpanel.
   *
   * @param payload - The event payload to track.
   */
  trackGA4AndMixpanel?: (payload: any) => void;
}

// ---------------------------------------------------------------------------
// Confirm Modal
// ---------------------------------------------------------------------------

export type ConfirmModalPayload = {
  /** The title of the confirm modal */
  title: string;
  /** The content of the confirm modal */
  content: string;
  /** The text to display on the ok button */
  okText?: string;
  /** The text to display on the cancel button */
  cancelText?: string;
  /** The variant of the confirm modal */
  variant?: 'primary' | 'danger';
}

// ---------------------------------------------------------------------------
// Presenter Slide Plugin Props (xprops shape)
// ---------------------------------------------------------------------------

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
  upsertSlideAttributeAction?: (payload: { slideId?: string | number; attributeKey: string; attributeValue: any }) => Promise<any>;
  /**
   * Action to upload an image from the plugin iframe.
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
  /**
   * Show a confirm modal in the parent app.
   */
  showConfirmModal?: (payload: ConfirmModalPayload) => Promise<boolean>;
  /**
   * Clear the slide data in the parent app.
   */
  clearSlideData?: (slideId: string) => Promise<void>;
  /**
   * Method to allow PDF rendering after the plugin has finished loading and rendering its UI.
   */
  allowPDFRender?: () => void;
}

// ---------------------------------------------------------------------------
// Audience Slide Plugin Props (xprops shape)
// ---------------------------------------------------------------------------

export type ParticipantInfo = {
  type: string;
  value: string;
};

/**
 * Interface for the properties expected by the AudienceSlidePluginIframe component.
 */
export interface AudienceSlidePluginProps extends BaseSlidePluginProps {
  presentation?: BaseSlidePluginProps['presentation'] & {
    /** The teamplay object used in the presentation */
    teamPlay?: Record<string, any>;
  };
  /** Audience information such as name, email, emoji, ID, and team. */
  audience?: {
    /** The name of the audience participant */
    audienceName?: string;
    /** The emoji chosen by the audience participant */
    audienceEmoji?: string;
    /** The unique identifier of the audience participant */
    audienceId?: string | number;
    /** The email of the audience participant */
    audienceEmail?: string;
    /** The team name of the audience participant */
    audienceTeam?: string;
    /** Participant info entries */
    participantInfo?: ParticipantInfo[];
  };
  /**
   * Custom attributes associated with the current slide.
   */
  slideAttributes?: Record<string, any>;
  /**
   * Action to upload an image from the plugin iframe.
   */
  uploadImage?: () => Promise<any>;
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
   * Update audience data such as name, email, and emoji.
   */
  updateAudienceData?: (payload: {
    audienceName?: string;
    audienceEmail?: string;
    audienceEmoji?: string;
    participantInfo?: ParticipantInfo[];
  }) => void;
  /**
   * Open a full-screen modal in the audience app.
   */
  openPluginModal?: (path?: string, data?: any) => void;
  /**
   * Close the currently open plugin modal in the audience app.
   */
  closePluginModal?: () => void;
  /**
   * Callback function to report the vertical position of the submit button.
   */
  onSubmitButtonHeightChange?: (height: number) => void;
  /**
   * Remaining time for the current slide if hasTimeLimit is true.
   */
  timeLimit?: number | null;
  /**
   * Scroll the parent app to a specific offset relative to the iframe top.
   */
  scrollTo?: (yOffset: number) => void;
}

// ---------------------------------------------------------------------------
// Report Props (xprops shape)
// ---------------------------------------------------------------------------

/**
 * Properties for the report slide plugin.
 */
export interface ReportProps {
  /** The token for authentication/authorization */
  token?: string;
  /** The current language code (e.g., 'en', 'vi') */
  currentLanguage?: string;
  /**
   * Callback to report height changes from the child to the parent.
   * Sending null signals the parent to use 100% height.
   */
  onHeightChange?: (height: number | null) => void;
  /**
   * Action to track events to GA4 and Mixpanel.
   */
  trackGA4AndMixpanel?: (eventName: string, payload: any) => void;
  replaceRoute?: (location: any, onComplete?: Function, onAbort?: Function) => void;
  pushRoute?: (location: any, onComplete?: Function, onAbort?: Function) => void;
  openExportModalForPresentation?: (presentation: any) => void;
  locale?: string;
  currentUser?: object;
  featureFlags?: object;
  translationMap?: Record<string, string>;
  iframePath?: string;
}

// ---------------------------------------------------------------------------
// Participant Report Props (xprops shape)
// ---------------------------------------------------------------------------

/**
 * Properties for the participant report plugin iframe.
 * Used by the report app to pass pre-fetched answer data into the slide plugin iframe.
 */
export interface ParticipantReportPluginProps {
  /** The URL of the plugin to be loaded in the iframe */
  url: string;
  /** Pre-fetched response/answer data to render in the iframe */
  answers?: any;
  /** Callback to report height changes from the child to the parent */
  onHeightChange?: (height: number | null) => void;
  imageUrl?: string;
  presentationColorPalette?: object;
}

// ---------------------------------------------------------------------------
// Core API Types
// ---------------------------------------------------------------------------

/**
 * Options for plugin factories and base plugin creation.
 */
export interface PluginBaseOptions {
  /** Auto-report height to parent. Pass string for custom wrapper ID. */
  autoHeight?: boolean | string;
}

/**
 * A writable sync channel backed by BroadcastChannel.
 */
export interface SyncChannel<T> {
  /** Get current value */
  getState(): T;
  /** Update value and broadcast to other tabs */
  setState(value: T): void;
  /** Subscribe to changes from other tabs */
  onStateChange(fn: (value: T) => void): () => void;
  /** Close the BroadcastChannel and clean up */
  destroy(): void;
}

/**
 * A read-only sync channel backed by BroadcastChannel.
 */
export interface SyncReadOnlyChannel<T> {
  /** Get current value */
  getState(): T;
  /** Subscribe to changes */
  onStateChange(fn: (value: T) => void): () => void;
  /** Close the BroadcastChannel and clean up */
  destroy(): void;
}

/**
 * Base plugin interface with shared state and actions.
 */
export interface PluginBase {
  // State accessors
  getPresentation(): Record<string, any> | undefined;
  getSlide(): Record<string, any> | undefined;
  getBaseUrl(): string | undefined;
  getPresentationColorPalette(): string[] | undefined;
  getPresentationLighterColorPalette(): string[] | undefined;

  // State subscriptions
  onPresentationChange(fn: (val: Record<string, any> | undefined) => void): () => void;
  onSlideChange(fn: (val: Record<string, any> | undefined) => void): () => void;
  onBaseUrlChange(fn: (val: string | undefined) => void): () => void;
  onPresentationColorPaletteChange(fn: (val: string[] | undefined) => void): () => void;
  onPresentationLighterColorPaletteChange(fn: (val: string[] | undefined) => void): () => void;

  // Actions (pass-through from xprops)
  reportHeight(): void;
  subscribeTopic(options: { type?: string; topic: string; callback: (topic: string, message: any) => void }): void;
  unsubscribeTopic(topic: string): void;
  trackGA4AndMixpanel(payload: any): void;
  getValues(params: { bucket: string; key?: string }): Promise<{ key: string; path: string; value: string }[]>;

  // Lifecycle
  /** Start listening to xprops changes. Call once after DOM is ready. */
  init(): void;
  /** Clean up all subscriptions and observers */
  destroy(): void;
}

/**
 * Presenter plugin interface with presenter-specific state and actions.
 */
export interface PresenterPlugin extends PluginBase {
  // Additional state
  getCurrentUser(): Record<string, any> | undefined;
  onCurrentUserChange(fn: (val: Record<string, any> | undefined) => void): () => void;

  // Presenter-specific actions
  getSlideAttributes(slideId?: string | number): Promise<Record<string, any>>;
  upsertSlideAttribute(payload: { slideId?: string | number; attributeKey: string; attributeValue: any }): Promise<any>;
  uploadImage(file: File): Promise<ImageUploadResult>;
  openUploadImageModal(): Promise<ImageUploadResult>;
  openEditImageModal(currentImageUrl: string): Promise<ImageUploadResult>;
  onKeyboard(callback: (event: PluginKeyboardEvent) => void): void;
  emitKeyboardEvent(event: PluginKeyboardEvent): void;
  showToastInfo(text: string, uniqName?: string, action?: any, options?: any): void;
  showToastSuccess(text: string, uniqName?: string, action?: any, options?: any): void;
  showToastError(text: string, uniqName?: string, action?: any, options?: any): void;
  setSubmissionCount(payload: { count: number; tooltip?: string }): void;
  openPluginModal(path?: string): void;
  closePluginModal(): void;
  showConfirmModal(payload: ConfirmModalPayload): Promise<boolean>;
  clearSlideData(slideId: string): Promise<void>;
  allowPDFRender(): void;
  getAccessToken(): string | undefined;
}

/**
 * Audience plugin interface with audience-specific state and actions.
 */
export interface AudiencePlugin extends PluginBase {
  // Additional state
  getSlideAttributes(): Record<string, any> | undefined;
  getAudienceName(): string | undefined;
  getAudienceEmoji(): string | undefined;
  getAudienceId(): string | number | undefined;
  getAudienceEmail(): string | undefined;
  getAudienceTeam(): string | undefined;
  getParticipantInfo(): ParticipantInfo[] | undefined;
  getTimeLimit(): number | null | undefined;

  // Subscriptions
  onSlideAttributesChange(fn: (val: Record<string, any> | undefined) => void): () => void;
  onAudienceNameChange(fn: (val: string | undefined) => void): () => void;
  onAudienceEmojiChange(fn: (val: string | undefined) => void): () => void;
  onAudienceIdChange(fn: (val: string | number | undefined) => void): () => void;
  onAudienceEmailChange(fn: (val: string | undefined) => void): () => void;
  onAudienceTeamChange(fn: (val: string | undefined) => void): () => void;
  onParticipantInfoChange(fn: (val: ParticipantInfo[] | undefined) => void): () => void;
  onTimeLimitChange(fn: (val: number | null | undefined) => void): () => void;

  // Actions
  uploadImage(): Promise<any>;
  showToastInfo(text: string, uniqName?: string, action?: any, options?: any): void;
  showToastSuccess(text: string, uniqName?: string, action?: any, options?: any): void;
  showToastError(text: string, uniqName?: string, action?: any, options?: any): void;
  updateAudienceData(payload: { audienceName?: string; audienceEmail?: string; audienceEmoji?: string; participantInfo?: ParticipantInfo[] }): void;
  openPluginModal(path?: string, data?: any): void;
  closePluginModal(): void;
  onSubmitButtonHeightChange(height: number): void;
  scrollTo(yOffset: number): void;
}

/**
 * Report plugin interface.
 */
export interface ReportPlugin {
  // State
  getToken(): string | undefined;
  getCurrentLanguage(): string | undefined;
  getLocale(): string | undefined;
  getTranslationMap(): Record<string, string> | undefined;
  getFeatureFlags(): Record<string, string> | undefined;
  getIframePath(): string | undefined;
  getCurrentUser(): object | undefined;

  // Subscriptions
  onTokenChange(fn: (val: string | undefined) => void): () => void;
  onCurrentLanguageChange(fn: (val: string | undefined) => void): () => void;
  onLocaleChange(fn: (val: string | undefined) => void): () => void;
  onTranslationMapChange(fn: (val: Record<string, string> | undefined) => void): () => void;
  onFeatureFlagsChange(fn: (val: Record<string, string> | undefined) => void): () => void;
  onIframePathChange(fn: (val: string | undefined) => void): () => void;
  onCurrentUserChange(fn: (val: object | undefined) => void): () => void;

  // Actions
  trackGA4AndMixpanel(eventName: string, payload: any): void;
  replaceRoute(location: any, onComplete?: Function, onAbort?: Function): void;
  pushRoute(location: any, onComplete?: Function, onAbort?: Function): void;
  openExportModalForPresentation(presentation: any): void;
  reportHeight(): void;

  // Lifecycle
  init(): void;
  destroy(): void;
}

/**
 * Participant report plugin interface.
 */
export interface ParticipantReportPlugin {
  getAnswers(): any[] | undefined;
  getImageUrl(): string | undefined;
  getPresentationColorPalette(): object | undefined;
  onAnswersChange(fn: (val: any[] | undefined) => void): () => void;
  onImageUrlChange(fn: (val: string | undefined) => void): () => void;
  onPresentationColorPaletteChange(fn: (val: object | undefined) => void): () => void;
  reportHeight(): void;
  init(): void;
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Tracker
// ---------------------------------------------------------------------------

/**
 * Options for creating an action tracker.
 */
export interface TrackerOptions {
  /** Element to attach event listeners to */
  element: HTMLElement;
  /** Events to track. Default: ['click'] */
  events?: ('click' | 'mouseenter' | 'dblclick' | 'focus' | 'blur' | 'change' | 'submit' | 'view')[];
  /** The object name for the tracking event */
  name?: string;
  /** Additional info appended to event name */
  otherInfo?: string;
  /** Custom properties sent with each event */
  customProps?: Record<string, any>;
}

/**
 * A tracker instance that can be updated or destroyed.
 */
export interface Tracker {
  /** Update custom props dynamically */
  updateProps(props: Record<string, any>): void;
  /** Stop tracking and remove event listeners */
  destroy(): void;
}
