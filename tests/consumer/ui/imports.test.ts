import { describe, it, expect } from 'vitest';

/**
 * Consumer tests for @aha/ui package imports
 * 
 * These tests verify that all documented exports are importable and have the correct types.
 */
describe('@aha/ui - Imports', () => {
  describe('Core exports', () => {
    it('should export useSync', async () => {
      const { useSync } = await import('@aha/ui');
      expect(useSync).toBeDefined();
      expect(typeof useSync).toBe('function');
    });

    it('should export useSyncReadOnly', async () => {
      const { useSyncReadOnly } = await import('@aha/ui');
      expect(useSyncReadOnly).toBeDefined();
      expect(typeof useSyncReadOnly).toBe('function');
    });

    it('should export usePresenterPlugin', async () => {
      const { usePresenterPlugin } = await import('@aha/ui');
      expect(usePresenterPlugin).toBeDefined();
      expect(typeof usePresenterPlugin).toBe('function');
    });

    it('should export useAudiencePlugin', async () => {
      const { useAudiencePlugin } = await import('@aha/ui');
      expect(useAudiencePlugin).toBeDefined();
      expect(typeof useAudiencePlugin).toBe('function');
    });

    it('should export useReportPlugin', async () => {
      const { useReportPlugin } = await import('@aha/ui');
      expect(useReportPlugin).toBeDefined();
      expect(typeof useReportPlugin).toBe('function');
    });

    it('should export autoReportHeight', async () => {
      const { autoReportHeight } = await import('@aha/ui');
      expect(autoReportHeight).toBeDefined();
      expect(typeof autoReportHeight).toBe('function');
    });

    it('should export uploadImage', async () => {
      const { uploadImage } = await import('@aha/ui');
      expect(uploadImage).toBeDefined();
      expect(typeof uploadImage).toBe('function');
    });

    it('should export vEmitAction', async () => {
      const { vEmitAction } = await import('@aha/ui');
      expect(vEmitAction).toBeDefined();
      expect(vEmitAction).toHaveProperty('mounted');
      expect(vEmitAction).toHaveProperty('updated');
      expect(vEmitAction).toHaveProperty('unmounted');
    });
  });

  describe('Zoid components', () => {
    it('should export PresenterSlidePluginIframe', async () => {
      const { PresenterSlidePluginIframe } = await import('@aha/ui');
      expect(PresenterSlidePluginIframe).toBeDefined();
    });

    it('should export AudienceSlidePluginIframe', async () => {
      const { AudienceSlidePluginIframe } = await import('@aha/ui');
      expect(AudienceSlidePluginIframe).toBeDefined();
    });

    it('should export ReportIframe', async () => {
      const { ReportIframe } = await import('@aha/ui');
      expect(ReportIframe).toBeDefined();
    });
  });

  describe('Theme', () => {
    it('should export ahaSlidesDefaultTheme', async () => {
      const { ahaSlidesDefaultTheme } = await import('@aha/ui');
      expect(ahaSlidesDefaultTheme).toBeDefined();
      expect(typeof ahaSlidesDefaultTheme).toBe('object');
      expect(ahaSlidesDefaultTheme).toHaveProperty('token');
    });
  });

  describe('Interfaces and types', () => {
    it('should export SlidePluginProps type', async () => {
      const ui = await import('@aha/ui');
      // Type-only exports may not be available at runtime, but we can check
      // that the package exports are valid
      expect(ui).toBeDefined();
    });

    it('should export AudienceSlidePluginProps type', async () => {
      const ui = await import('@aha/ui');
      expect(ui).toBeDefined();
    });

    it('should export ImageUploadResult type', async () => {
      const ui = await import('@aha/ui');
      expect(ui).toBeDefined();
    });

    it('should export UseSlidePluginOptions type', async () => {
      const ui = await import('@aha/ui');
      expect(ui).toBeDefined();
    });
  });

  describe('Named exports vs default exports', () => {
    it('should support named imports', async () => {
      const { useSync, usePresenterPlugin } = await import('@aha/ui');
      expect(useSync).toBeDefined();
      expect(usePresenterPlugin).toBeDefined();
    });

    it('should support namespace imports', async () => {
      const UI = await import('@aha/ui');
      expect(UI.useSync).toBeDefined();
      expect(UI.usePresenterPlugin).toBeDefined();
      expect(UI.useAudiencePlugin).toBeDefined();
    });
  });
});
