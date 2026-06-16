import * as zoid from 'zoid/dist/zoid.frameworks';
import { presenterZoidProps, type SlidePluginProps } from './presenter';

/**
 * Props for the embedded app zoid component.
 * Extends the presenter slide plugin props with an app-specific `context`.
 */
export interface AppPluginProps extends SlidePluginProps {
  /**
   * The context in which the app is being rendered.
   * Defaults to `'editor'`.
   */
  context?: 'editor' | 'home';
  /**
   * Notify the parent application that the app's route has changed.
   * @param payload - The route change payload.
   * @param payload.location - The new route location (path).
   * @param payload.navType - The navigation type: `'push'` for a new entry,
   *   `'pop'` for back/forward, `'replace'` for replacing the current entry.
   * @param payload.fullScreen - Whether the new route should be displayed full-screen.
   */
  onRouteChange?: (payload: {
    location: string;
    navType: 'push' | 'pop' | 'replace';
    fullScreen: boolean;
  }) => void;
  /** Plugin → host: send a captured thumbnail data URL for this slide. */
  setSlideThumbnail?: (dataUrl: string) => void;
  /** Host → plugin: register a callback the host invokes before unmount to request a capture. */
  onRequestThumbnailCapture?: (callback: () => void) => void;
}

/**
 * Initializes the embedded app zoid component using the `'embed-app-iframe'` tag.
 * Reuses the presenter zoid props schema and adds an app-specific `context`
 * prop that defaults to `'editor'`.
 */
export function initializeApp() {
  return zoid.create({
    tag: 'embed-app-iframe',
    url: ({ props }: { props: AppPluginProps }) => props.url,
    props: {
      ...presenterZoidProps,
      context: {
        type: 'string',
        required: false,
        default: () => 'editor',
      },
      onRouteChange: {
        type: 'function',
        required: false,
      },
    },
  });
}

/**
 * Returns whether the embedded app has been initialized inside the iframe —
 * i.e., whether zoid has populated `window.xprops` with the parent-supplied props.
 */
export function isInitialized(): boolean {
  return typeof window !== 'undefined' && Boolean((window as { xprops?: AppPluginProps }).xprops);
}

/**
 * Returns the zoid `xprops` for the embedded app.
 * Throws if the app has not been initialized yet (see {@link isInitialized}).
 */
export function getApp(): AppPluginProps {
  if (!isInitialized()) {
    throw new Error('App is not initialized: window.xprops is not available.');
  }
  return (window as { xprops?: AppPluginProps }).xprops as AppPluginProps;
}
