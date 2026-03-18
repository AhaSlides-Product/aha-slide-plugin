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
      const cleanup = autoReportHeight();
      // Initial sendHeight + setTimeout(300) - wait for both
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(onHeightChange).toHaveBeenCalled();
          expect(typeof onHeightChange.mock.calls[0][0]).toBe('number');
          cleanup();
          resolve();
        }, 350);
      });
    });
  });

  describe('autoReportHeight - shared state management', () => {
    let pendingCleanups: (() => void)[] = [];

    beforeEach(() => {
      (window as any).xprops = { onHeightChange: vi.fn() };
      document.body.innerHTML = '<div id="app"></div>';
      pendingCleanups = [];
    });

    afterEach(() => {
      // Drain any uncalled cleanups to reset shared state for the next test
      pendingCleanups.forEach(fn => fn());
      pendingCleanups = [];
    });

    it('multiple calls return separate cleanup functions without throwing', () => {
      const c1 = autoReportHeight();
      const c2 = autoReportHeight();
      expect(typeof c1).toBe('function');
      expect(typeof c2).toBe('function');
      c1();
      c2();
    });

    it('reuses existing observer — second call does not create a new observer', () => {
      let ctorCount = 0;
      const OriginalRO = global.ResizeObserver;
      global.ResizeObserver = class extends OriginalRO {
        constructor(cb: ResizeObserverCallback) {
          super(cb);
          ctorCount++;
        }
      } as any;

      try {
        const c1 = autoReportHeight();
        const c2 = autoReportHeight(); // should reuse, not call constructor again
        expect(ctorCount).toBe(1);
        c1();
        c2();
      } finally {
        global.ResizeObserver = OriginalRO;
      }
    });

    it('observer disconnects when the last caller cleans up', () => {
      const c1 = autoReportHeight();
      const c2 = autoReportHeight();

      const disconnectSpy = vi.spyOn(global.ResizeObserver.prototype, 'disconnect');
      try {
        c1();
        c2(); // last caller — triggers disconnect
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
      } finally {
        disconnectSpy.mockRestore();
      }
    });

    it('call with different wrapperId disconnects previous observer and starts fresh', () => {
      const c1 = autoReportHeight(); // uses default 'app'
      pendingCleanups.push(c1);

      const disconnectSpy = vi.spyOn(global.ResizeObserver.prototype, 'disconnect');
      try {
        const c2 = autoReportHeight('custom'); // different id → previous observer disconnected
        pendingCleanups.push(c2);
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
        c1();
        c2();
        pendingCleanups = [];
      } finally {
        disconnectSpy.mockRestore();
      }
    });

    it('custom wrapperId skips MutationObserver, default id creates MutationObserver', () => {
      const mutateSpy = vi.spyOn(global.MutationObserver.prototype, 'observe');
      try {
        const c1 = autoReportHeight('custom'); // custom id — no MutationObserver
        expect(mutateSpy).not.toHaveBeenCalled();
        c1();

        const c2 = autoReportHeight(); // default id — MutationObserver created
        expect(mutateSpy).toHaveBeenCalled();
        c2();
      } finally {
        mutateSpy.mockRestore();
      }
    });

    it('calling cleanup extra times beyond count does not throw', () => {
      const c1 = autoReportHeight();
      c1();
      expect(() => c1()).not.toThrow(); // safe to call after count is already 0
    });
  });
});
