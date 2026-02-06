import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadImage, autoReportHeight } from '@aha/ui';

/**
 * Phase 2: Utility functions consumer tests
 */
describe('@aha/ui - Utilities', () => {
  describe('uploadImage', () => {
    it('should be a function', () => {
      expect(typeof uploadImage).toBe('function');
    });

    it('should return a Promise', () => {
      const result = uploadImage();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve to an object (ImageUploadResult shape)', async () => {
      const result = await uploadImage();
      // Default implementation returns {}; real host provides path/url
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // Contract: result is an object that may include path and url
      expect(result).toEqual(expect.any(Object));
    });
  });

  describe('autoReportHeight', () => {
    beforeEach(() => {
      (window as any).xprops = undefined;
      document.body.innerHTML = '<div id="app"></div>';
    });

    it('should return a cleanup function when xprops has onHeightChange', () => {
      (window as any).xprops = {
        onHeightChange: vi.fn(),
      };
      const cleanup = autoReportHeight();
      expect(typeof cleanup).toBe('function');
      expect(cleanup).not.toThrow();
      cleanup();
    });

    it('should return a no-op cleanup when xprops is missing', () => {
      const cleanup = autoReportHeight();
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should return a no-op cleanup when onHeightChange is not a function', () => {
      (window as any).xprops = { onHeightChange: null };
      const cleanup = autoReportHeight();
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should call onHeightChange when invoked (initial report)', () => {
      const onHeightChange = vi.fn();
      (window as any).xprops = { onHeightChange };
      autoReportHeight();
      // Initial sendHeight + setTimeout(300) - wait for both
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(onHeightChange).toHaveBeenCalled();
          expect(typeof onHeightChange.mock.calls[0][0]).toBe('number');
          resolve();
        }, 350);
      });
    });
  });
});
