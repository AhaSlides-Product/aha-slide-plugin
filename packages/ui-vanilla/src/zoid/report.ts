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
   *
   * @param height - The new height in pixels, or null for 100% height.
   */
  onHeightChange?: (height: number | null) => void;
  /**
   * Action to track events to GA4 and Mixpanel.
   *
   * @param payload - The event payload to track.
   */
  trackGA4AndMixpanel?: (eventName: string, payload: any) => void;
  replaceRoute?: (location: any, onComplete?: Function, onAbort?: Function) => void;
  pushRoute?: (location: any, onComplete?: Function, onAbort?: Function) => void;
  openExportModalForPresentation?: (presentation: any) => void;
  showToastInfo?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  showToastSuccess?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  showToastError?: (text: string, uniqName?: string, action?: any, options?: any) => void;
  locale?: string;
  currentUser?: object;
  featureFlags?: object;
  translationMap?: Record<string, string>;
  iframePath?: string;
}
