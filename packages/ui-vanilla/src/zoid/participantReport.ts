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
}
