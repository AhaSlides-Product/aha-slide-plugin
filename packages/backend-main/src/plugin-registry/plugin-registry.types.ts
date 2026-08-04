/**
 * Contract shared with the presenter-app install-by-ID consumer
 * (stpancras-presenter-app `src/utils/installedPlugins.util.js`,
 *  branch claude/boo-625-plugin-installer — `fetchRegistry` + `isValidDescriptor`).
 *
 * Keep this in lockstep with that consumer: the presenter fetches this registry
 * cross-origin, and any descriptor that fails the consumer's `isValidDescriptor`
 * is silently dropped, so the shapes below MUST stay a strict subset of what the
 * consumer accepts.
 */

export type PluginKind = 'slide' | 'embed';

/** Payload for a `kind: 'embed'` plugin (an iframe app mounted by baseUrl). */
export interface EmbedPayload {
  /** http(s) origin the presenter iframes. Required. */
  baseUrl: string;
  staticTabs?: Array<{ contentUrl: string }>;
  slideTypes?: unknown[];
}

/** Payload for a `kind: 'slide'` plugin (a custom slide type). */
export interface SlidePayload {
  /** Slide-type key. Required. */
  type: string;
  /** http(s) URL of the canvas view. Required. */
  canvasUrl: string;
  audienceUrl?: string;
  editorUrl?: string;
  settingUrl?: string;
}

export interface PluginDescriptor {
  id: string;
  kind: PluginKind;
  name: string;
  version: string;
  payload: EmbedPayload | SlidePayload | Record<string, unknown>;
}
