/**
 * Framework-agnostic vanilla core for the slide plugin SDK.
 * Reads from window.xprops (Zoid) and provides a subscribe/getState pattern
 * that any framework adapter (Vue, React, etc.) can consume.
 */

import { throttle } from '../utils';

// Re-export types that are framework-agnostic
export type { BaseSlidePluginProps, PluginKeyboardEvent, UseSlidePluginOptions } from '../zoid/base';

export interface BasePluginState {
  presentationProps: Record<string, any> | undefined;
  presentationColorPaletteProps: string[] | undefined;
  presentationLighterColorPaletteProps: string[] | undefined;
  slideProps: Record<string, any> | undefined;
  baseUrl: string | undefined;
}

type Listener<T> = (state: T) => void;

export interface PluginStore<T> {
  getState(): T;
  subscribe(listener: Listener<T>): () => void;
  destroy(): void;
}

function getXProps(): any {
  if (typeof window === 'undefined') return undefined;
  return (window as any).xprops;
}

/**
 * Reports the document height to the parent application.
 */
export function reportHeight() {
  if (typeof window === 'undefined') return;

  const xprops = getXProps();
  if (!xprops || typeof xprops.onHeightChange !== 'function') return;

  const app = document.getElementById('app') || document.getElementById('root');
  const height = app
    ? app.scrollHeight
    : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  xprops.onHeightChange(height);
}

/**
 * Automatically reports the height of the document body to the parent via zoid xprops.
 * @returns A cleanup function to stop observing height changes.
 */
export function autoReportHeight(): () => void {
  if (typeof window === 'undefined') return () => {};

  const xprops = getXProps();
  if (!xprops || typeof xprops.onHeightChange !== 'function') return () => {};

  const throttledOnHeightChange = throttle((height: number) => {
    xprops.onHeightChange(height);
  }, 300);

  const sendHeight = () => {
    const app = document.getElementById('app') || document.getElementById('root');
    const height = app
      ? app.scrollHeight
      : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    throttledOnHeightChange(height);
  };

  const observer = new ResizeObserver(() => sendHeight());
  observer.observe(document.body);
  const app = document.getElementById('app') || document.getElementById('root');
  if (app) {
    observer.observe(app);
  }

  const mutObserver = new MutationObserver(() => sendHeight());
  mutObserver.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  sendHeight();
  setTimeout(sendHeight, 300);

  return () => {
    observer.disconnect();
    mutObserver.disconnect();
  };
}

export interface CreateBasePluginOptions {
  autoHeight?: boolean;
  onPropsExtension?: (newProps: any) => void;
}

export interface BasePluginInstance<T> extends PluginStore<T> {
  xprops: any;
  subscribeTopic: ((options: { type?: string; topic: string; callback: (topic: string, message: any) => void }) => void) | undefined;
  unsubscribeTopic: ((topic: string) => void) | undefined;
  reportHeight: () => void;
}

/**
 * Creates a framework-agnostic base plugin instance.
 * Call init() to set up height reporting and onProps listener.
 */
export function createBasePlugin<TExtra extends Record<string, any>>(
  options: CreateBasePluginOptions = { autoHeight: true },
  extraStateInit?: () => TExtra,
  onPropsExtension?: (newProps: any, update: (partial: Partial<BasePluginState & TExtra>) => void) => void,
): BasePluginInstance<BasePluginState & TExtra> {
  const xprops = getXProps();

  const listeners = new Set<Listener<BasePluginState & TExtra>>();
  let cleanupHeight: (() => void) | undefined;

  const baseInit: BasePluginState = {
    presentationProps: xprops?.presentation,
    presentationColorPaletteProps: xprops?.presentationColorPalette,
    presentationLighterColorPaletteProps: xprops?.presentationLighterColorPalette,
    slideProps: xprops?.slide,
    baseUrl: xprops?.baseUrl,
  };

  const extraInit = extraStateInit ? extraStateInit() : ({} as TExtra);

  let state: BasePluginState & TExtra = { ...baseInit, ...extraInit };

  function setState(partial: Partial<BasePluginState & TExtra>) {
    state = { ...state, ...partial };
    listeners.forEach((fn) => fn(state));
  }

  // Set up height reporting
  if (options.autoHeight !== false) {
    cleanupHeight = autoReportHeight();
  } else if (xprops && typeof xprops.onHeightChange === 'function') {
    xprops.onHeightChange(null);
  }

  // Set up onProps listener for live updates from parent
  if (xprops && typeof xprops.onProps === 'function') {
    xprops.onProps((newProps: any) => {
      const partial: Partial<BasePluginState> = {};
      if (newProps.presentation) partial.presentationProps = { ...newProps.presentation };
      if (newProps.presentationColorPalette) partial.presentationColorPaletteProps = [...newProps.presentationColorPalette];
      if (newProps.presentationLighterColorPalette) partial.presentationLighterColorPaletteProps = [...newProps.presentationLighterColorPalette];
      if (newProps.slide) partial.slideProps = { ...newProps.slide };
      if (newProps.baseUrl) partial.baseUrl = newProps.baseUrl;

      if (onPropsExtension) {
        onPropsExtension(newProps, (extra) => {
          setState({ ...partial, ...extra } as Partial<BasePluginState & TExtra>);
        });
      } else {
        setState(partial as Partial<BasePluginState & TExtra>);
      }
    });
  }

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    destroy: () => {
      listeners.clear();
      cleanupHeight?.();
    },
    xprops,
    subscribeTopic: xprops?.subscribeTopic,
    unsubscribeTopic: xprops?.unsubscribeTopic,
    reportHeight,
  };
}
