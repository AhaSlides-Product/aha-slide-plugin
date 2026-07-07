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
  /** Information about the current logged-in user, if any. */
  currentUser?: { email?: string; [key: string]: any };
  /** Whether participant verification is enabled for this presentation. */
  isParticipantVerificationEnabled?: boolean;
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
   * Notify the host that this audience participant is (or has stopped) typing,
   * so the presenter can show its "… is typing" indicator. Reuses the audience
   * app's existing typing signal (the `uit` socket event); the host throttles
   * and attaches participant identity, so the plugin only reports intent.
   *
   * Call with `true` on input/keypress and `false` when the field is cleared,
   * blurred, or the answer is submitted.
   *
   * @param isTyping - `true` while typing, `false` when typing stops.
   */
  emitTyping?: (isTyping: boolean) => void;
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
  /**
   * The list of teams the audience can join, provided by the host when the
   * presentation has team play enabled. Empty/undefined when team play is off.
   * Use this to render a team picker inside the plugin's own join UI.
   */
  teams?: Team[];
  /**
   * Join the current game/presentation as a participant (optionally into a team).
   *
   * The host owns validation (e.g. required name, team-full checks) and the
   * underlying join request, then resolves with the outcome so the plugin can
   * react (e.g. show a toast). Only available when the presentation allows
   * audiences to join.
   *
   * @param payload - The participant's name, emoji and selected team.
   * @returns A promise resolving to the join result. `error` is set when
   *          `success` is `false`.
   * @example
   * ```typescript
   * const res = await joinGame({ audienceName: 'Lina', audienceEmoji: '😎', teamId });
   * if (!res.success) showToastError(res.error ?? 'Could not join');
   * ```
   */
  joinGame?: (payload: JoinGamePayload) => Promise<JoinGameResult>;
}

export type ParticipantInfo = {
  type: string;
  value: string;
};

/**
 * A team the audience can join when the presentation has team play enabled.
 */
export type Team = {
  /** Unique team identifier. */
  id: string | number;
  /** Display name of the team. */
  name: string;
  /** Optional team colour (hex). */
  color?: string;
};

/**
 * Payload for {@link AudienceSlidePluginProps.joinGame}.
 */
export type JoinGamePayload = {
  /** The participant's display name. */
  audienceName?: string;
  /** The participant's chosen emoji. */
  audienceEmoji?: string;
  /** The id of the team to join (required when team play is enabled). */
  teamId?: string | number;
};

/**
 * Result returned by {@link AudienceSlidePluginProps.joinGame}.
 */
export type JoinGameResult = {
  /** Whether the join succeeded. */
  success: boolean;
  /** The failure reason when `success` is `false`. */
  error?: 'invalid-name' | 'invalid-team' | 'team-full' | 'network';
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
      currentUser: {
        type: 'object',
        required: false,
      },
      isParticipantVerificationEnabled: {
        type: 'boolean',
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
      emitTyping: {
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
      teams: {
        type: 'array',
        required: false,
      },
      joinGame: {
        type: 'function',
        required: false,
      },
    },
  });
}
