import { describe, it, expect } from 'vitest';

/**
 * Bundler compatibility tests
 *
 * Verifies that SDK packages can be consumed the way a bundler (Vite, Webpack, etc.)
 * would resolve and load them. We use dynamic import to simulate bundler behavior.
 */
describe('Bundler compatibility', () => {
  describe('@aha/ui', () => {
    it('should support dynamic import (ESM)', async () => {
      const ui = await import('@aha/ui');
      expect(ui).toBeDefined();
      expect(ui.useSync).toBeDefined();
      expect(ui.usePresenterPlugin).toBeDefined();
      expect(ui.PresenterSlidePluginIframe).toBeDefined();
    });

    it('should support named imports from main entry', async () => {
      const { useSync, usePresenterPlugin, useAudiencePlugin, ahaSlidesDefaultTheme } =
        await import('@aha/ui');
      expect(typeof useSync).toBe('function');
      expect(typeof usePresenterPlugin).toBe('function');
      expect(typeof useAudiencePlugin).toBe('function');
      expect(ahaSlidesDefaultTheme).toBeDefined();
    });

    it('should support namespace import', async () => {
      const UI = await import('@aha/ui');
      expect((UI as Record<string, unknown>).default).toBeUndefined();
      expect(UI.useSync).toBeDefined();
      expect(UI.ahaSlidesDefaultTheme).toBeDefined();
    });
  });

  describe('@aha/backend-utils', () => {
    it('should support dynamic import (ESM)', async () => {
      const backendUtils = await import('@aha/backend-utils');
      expect(backendUtils).toBeDefined();
    });

    it('should support namespace import (types are compile-time only)', async () => {
      const backendUtils = await import('@aha/backend-utils');
      expect(backendUtils).toBeDefined();
      expect(typeof backendUtils).toBe('object');
      // TypeScript type/interface exports are erased at runtime; module is still valid for bundlers
    });
  });

  describe('Subpath exports (@aha/ui)', () => {
    it('should resolve AhaIcon.vue subpath', async () => {
      const AhaIcon = await import('@aha/ui/AhaIcon.vue');
      expect(AhaIcon).toBeDefined();
      expect(AhaIcon.default).toBeDefined();
    });
  });
});
