import * as zoid from 'zoid/dist/zoid.frameworks';
import type { ImageUploadResult } from '../image';
import type { BaseSlidePluginProps, PluginKeyboardEvent } from './base';

/**
 * A presenter action button that a slide plugin declares to the host.
 *
 * Slides push the current set via `setActionButtons` and receive invocations via
 * `onActionInvoke`. This lets the host render the slide's bottom-of-canvas actions
 * (e.g. "Next: Vote", "Previous") in its own toolbar instead of, or in addition to,
 * the iframe rendering them itself.
 */
export interface PluginAction {
  /** Stable, locale-independent identifier the host echoes back on invoke. */
  id: string;
  /** Display text, already translated by the slide. */
  label: string;
  /** Visual emphasis hint for the host. */
  variant?: 'primary' | 'default';
  /** Host-known icon key, if the host renders icons. */
  icon?: string;
  /**
   * Explicit SVG viewBox for the icon, e.g. "0 0 16 16". Lets the slide correct
   * glyphs whose native viewBox is non-square (which the host would otherwise
   * letterbox, pushing the ink off-centre). Ignored when `icon` is unset.
   */
  iconViewBox?: string;
  /** Whether the action is currently disabled. */
  disabled?: boolean;
  /** Whether the action is in a loading state. */
  loading?: boolean;
  /** Keyboard hint for the host to render, e.g. "Enter", "Shift+Enter", "M", "V". */
  shortcut?: string;
}

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
};

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
   * @param text - The message to display.
   * @param uniqName - A unique identifier for the toast.
   * @param action - An optional action object.
   * @param options - Additional toast options.
   */
  showToastInfo?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Show a success toast message in the parent app.
   * @param text - The message to display.
   * @param uniqName - A unique identifier for the toast.
   * @param action - An optional action object.
   * @param options - Additional toast options.
   */
  showToastSuccess?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Show an error toast message in the parent app.
   * @param text - The message to display.
   * @param uniqName - A unique identifier for the toast.
   * @param action - An optional action object.
   * @param options - Additional toast options.
   */
  showToastError?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  /**
   * Send a vote outcome (vote count and tooltip) to the presenter app.
   * @param payload - The vote outcome data.
   */
  sendVoteOutcome?: (payload: { voteCount: number; tooltip?: string }) => void;
  /**
   * Open a full-screen modal with a custom path.
   * @param path - The custom path for the modal iframe.
   */
  openPluginModal?: (path?: string) => void;
  /**
   * Close the currently open plugin modal.
   */
  closePluginModal?: () => void;

  showConfirmModal?: (payload: ConfirmModalPayload) => Promise<boolean>;

  clearSlideData?: (slideId: string) => Promise<void>;

  /**
   * Method to allow PDF rendering after the plugin has finished loading and rendering its UI.
   */
  allowPDFRender?: () => void;

  /**
   * Register a callback to be notified when slide attributes change.
   * The parent subscribes to the Vuex slideAttributes/updateAttributes mutation
   * and invokes the callback with the mutation payload.
   *
   * @param callback - Called with { presentationId, slideId, attributes } when attributes change.
   */
  onSlideAttributesChanged?: (callback: (payload: { presentationId: string | number; slideId: string | number; attributes: Record<string, any> }) => void) => void;

  /**
   * Action to emit a broadcast action from the plugin iframe to the parent application.
   * @param key - The broadcast key.
   * @param args - The arguments for the action.
   */
  emitBroadcastAction?: (key: string, args: any[]) => void;

  /**
   * Register a callback in the plugin iframe for broadcast actions from the parent application.
   * @param callback - The function to call when a broadcast action occurs.
   */
  onBroadcastAction?: (callback: (key: string, args: any[]) => void) => void;

  /**
   * Declare the slide's current presenter action buttons to the host. The slide
   * calls this whenever its set of available actions changes; the host may render
   * them in its own toolbar. Pass an empty array to clear.
   * @param actions - The currently available actions.
   */
  setActionButtons?: (actions: PluginAction[]) => void;

  /**
   * Register a callback to be notified when the host invokes one of the actions
   * previously declared via `setActionButtons`.
   * @param callback - Called with the invoked action's `id`. May be async; the
   *   host does not await it (loading is driven declaratively via the action's
   *   `loading` field), but allowing `Promise<void>` lets slides pass an async
   *   handler without a type-only wrapper.
   */
  onActionInvoke?: (callback: (actionId: string) => void | Promise<void>) => void;
}

export type BroadcastActionResult<T extends (...args: any[]) => any> = {
  /** The wrapped function. Call this as you would the original. */
  fn: T;
  /**
   * Removes the handler from the registry.
   * Call this in `onUnmounted` (or equivalent cleanup) to prevent stale handlers.
   */
  unregister: () => void;
};

/**
 * The zoid props schema for the Presenter slide plugin iframe.
 * Exported so other zoid components (e.g. the embedded app) can extend
 * this schema instead of duplicating it.
 */
export const presenterZoidProps = {
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
  currentUser: {
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
  /**
   * Action to send a vote outcome (vote count and tooltip) from the plugin iframe to the parent.
   * @type {function}
   * @param {object} payload - The vote outcome data.
   * @param {number} payload.voteCount - The number of votes to display.
   * @param {string} [payload.tooltip] - Optional tooltip text to display on hover.
   */
  sendVoteOutcome: {
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
  token: {
    type: 'string',
    required: false,
  },
  showConfirmModal: {
    type: 'function',
    required: false,
  },
  allowPDFRender: {
    type: 'function',
    required: false,
  },
  onSlideAttributesChanged: {
    type: 'function',
    required: false,
  },
  filterProfaneWords: {
    type: 'function',
    required: false,
  },
  emitBroadcastAction: {
    type: 'function',
    required: false,
  },
  onBroadcastAction: {
    type: 'function',
    required: false,
  },
  setActionButtons: {
    type: 'function',
    required: false,
  },
  onActionInvoke: {
    type: 'function',
    required: false,
  },
} as const;

/**
 * Creates the framework-agnostic zoid component for the Presenter slide plugin iframe.
 * This is the cross-domain bridge that lets host applications mount plugin iframes
 * and pass data/callbacks through `xprops`.
 *
 * @param tag - Optional custom tag for the zoid component. Defaults to `'presenter-slide-plugin-iframe'`.
 */
export function initZoidForPresenter(tag?: string) {
  return zoid.create({
    tag: tag ?? 'presenter-slide-plugin-iframe',
    url: ({ props }: { props: SlidePluginProps }) => props.url,
    props: presenterZoidProps,
  });
}
