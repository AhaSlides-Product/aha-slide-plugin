import type { BaseSlidePluginProps } from './base';

/**
 * Properties for the participant report plugin iframe (e.g. pin-on-image).
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
  /**
   * Presentation-wide lighter color palette attributes.
   */
  presentationLighterColorPalette?: string[];
  /**
   * The presentation the answers belong to. Same open passthrough shape the
   * audience/presenter roles receive — a report view typically reads `language`
   * and `fontFamily` so it matches the deck it is reporting on.
   */
  presentation?: BaseSlidePluginProps['presentation'];
  /**
   * The slide the answers belong to. Same open passthrough shape the
   * audience/presenter roles receive.
   *
   * Note for report hosts: `slide.textColour` is the ink the deck author chose
   * against the DECK's own background. A report page is not that background, so
   * forward this only when the report surface actually reproduces the deck
   * colours — otherwise omit `slide` and let the plugin fall back to its own
   * legible default.
   */
  slide?: BaseSlidePluginProps['slide'];
  /**
   * The slide's persisted attributes, keyed by attribute type — the same bag the
   * audience role hydrates its configuration from (`slideAttributes.config` for
   * the marketplace slide types). Without it a report view can render a
   * participant's raw answer but not the labels it belongs to (option names,
   * axis labels, item names), so it degrades to placeholder copy.
   */
  slideAttributes?: Record<string, any>;
}
