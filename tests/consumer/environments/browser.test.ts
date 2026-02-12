import { describe, it, expect } from 'vitest';
import {
  useSync,
  usePresenterPlugin,
  PresenterSlidePluginIframe,
  AudienceSlidePluginIframe,
} from '@aha/ui';

/**
 * Browser environment tests
 *
 * Verifies that @aha/ui can be used in a browser-like environment (jsdom).
 * Consumer tests already run in jsdom; these tests explicitly assert
 * browser APIs and patterns used by the SDK.
 */
describe('Browser compatibility', () => {
  describe('Global APIs used by @aha/ui', () => {
    it('should have BroadcastChannel (mocked in setup)', () => {
      expect(typeof BroadcastChannel).toBe('function');
    });

    it('should have window', () => {
      expect(typeof window).toBe('object');
    });

    it('should have document', () => {
      expect(typeof document).toBe('object');
    });

    it('should have window.xprops writable for zoid', () => {
      (window as any).xprops = { test: true };
      expect((window as any).xprops).toEqual({ test: true });
    });
  });

  describe('@aha/ui in browser context', () => {
    it('should export PresenterSlidePluginIframe and AudienceSlidePluginIframe', () => {
      expect(PresenterSlidePluginIframe).toBeDefined();
      expect(AudienceSlidePluginIframe).toBeDefined();
    });

    it('should have useSync and usePresenterPlugin as functions', () => {
      expect(typeof useSync).toBe('function');
      expect(typeof usePresenterPlugin).toBe('function');
    });
  });

  describe('ResizeObserver (used by autoReportHeight)', () => {
    it('should have ResizeObserver (mocked in setup)', () => {
      expect(typeof ResizeObserver).toBe('function');
    });
  });
});
