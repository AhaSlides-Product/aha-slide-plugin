import * as zoid from 'zoid/dist/zoid.frameworks';
import type { BaseSlidePluginProps } from './base';

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
   *
   * @param payload - The audience data to update.
   */
  updateAudienceData?: (payload: {
    /** The new audience name */
    audienceName?: string;
    /** The new audience email */
    audienceEmail?: string;
    /** The new audience emoji */
    audienceEmoji?: string;
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
   * @type {number|null}
   */
  timeLimit?: number | null;
  /**
   * Scroll the parent app to a specific offset relative to the iframe top.
   * @param yOffset - The vertical offset relative to the iframe top.
   */
  scrollTo?: (yOffset: number) => void;
  /**
   * Get the inner height of the parent window.
   * @returns A promise that resolves to the window inner height.
   */
  getWindowHeight?: () => Promise<number>;
}

export type ParticipantInfo = {
  type: string;
  value: string;
};

/**
 * Creates the framework-agnostic zoid component for the Audience slide plugin iframe.
 * This is the cross-domain bridge that lets host applications mount audience-facing
 * plugin iframes and pass data/callbacks through `xprops`.
 */
export function initZoidForAudience() {
  return zoid.create({
    tag: 'audience-slide-plugin-iframe',
    url: ({ props }: { props: AudienceSlidePluginProps }) => props.url,
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
      presentationColorPalette: {
        type: 'array',
        required: false,
      },
      presentationLighterColorPalette: {
        type: 'array',
        required: false,
      },
      slide: {
        type: 'object',
        required: false,
      },
      audience: {
        type: 'object',
        required: false,
      },
      onHeightChange: {
        type: 'function',
        required: false,
      },
      slideAttributes: {
        type: 'object',
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
      updateAudienceData: {
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
      onSubmitButtonHeightChange: {
        type: 'function',
        required: false,
      },
      timeLimit: {
        type: 'number',
        required: false,
      },
      scrollTo: {
        type: 'function',
        required: false,
      },
      getWindowHeight: {
        type: 'function',
        required: false,
      },
      filterProfaneWords: {
        type: 'function',
        required: false,
      },
    },
  });
}
