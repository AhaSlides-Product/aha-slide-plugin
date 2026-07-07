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
    /**
     * Resolved primary text colour for the slide as a CSS colour string.
     * The host merges slide-level override over the deck-level theme
     * before passing it through here, so plugins can use it directly.
     */
    textColour?: string;
    /**
     * Resolved deck/slide background colour as a CSS colour string.
     * Plugins that render a slide-shaped preview tile INSIDE the iframe
     * (e.g. the canvas templates modal gallery) read this so previews
     * sit on the real deck bg instead of a hardcoded neutral grey.
     * Merges slide-level override over the deck-level theme on the host.
     */
    baseColour?: string;
    /**
     * Resolved deck/slide background image URL. Same usage as
     * `baseColour` — for in-iframe preview surfaces. When both are set
     * the image visually wins (deck renderer paints it over the colour).
     */
    backgroundImage?: string;
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

  /**
   * Filter profane words from text based on the presentation's profanity filter setting.
   * Returns the original text if filtering is disabled, or the filtered text with profane words replaced by asterisks.
   *
   * Note: Because this function is passed across the zoid iframe boundary, it returns a Promise.
   *
   * @param text - The text to filter.
   * @returns A promise resolving to the filtered text.
   */
  filterProfaneWords?: (text: string) => Promise<string>;
}

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

/**
 * A cross-domain "audience is typing" event, forwarded from the host to the
 * presenter plugin iframe via {@link SlidePluginProps.onTyping}.
 *
 * The presenter app already tracks who is typing (its `user-is-typing` socket
 * event); this is the serializable subset it relays so a plugin canvas can
 * render its own "… is typing" indicator.
 */
export interface PluginTypingEvent {
  /** Socket id of the audience participant, as assigned by the host. */
  socketId?: string;
  /** Whether that participant is currently typing (`false` when they stop). */
  isTyping: boolean;
}

/**
 * Options for the composition hooks.
 */
export interface UseSlidePluginOptions {
  /**
   * Whether to automatically report content height to the parent.
   */
  autoHeight?: boolean | string;
}
