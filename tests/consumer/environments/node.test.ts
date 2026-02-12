import { describe, it, expect } from 'vitest';

/**
 * Node.js environment tests
 *
 * Verifies that @aha/backend-utils can be consumed in a Node.js environment
 * (no browser-only APIs). @aha/ui is not tested here as it depends on Vue/DOM.
 */
describe('Node.js compatibility', () => {
  describe('@aha/backend-utils', () => {
    it('should be importable in Node.js (or Vitest Node env)', async () => {
      const backendUtils = await import('@aha/backend-utils');
      expect(backendUtils).toBeDefined();
      expect(typeof backendUtils).toBe('object');
    });

    it('should be importable (types are compile-time only; module may be empty at runtime)', async () => {
      const mod = await import('@aha/backend-utils');
      expect(mod).toBeDefined();
      expect(typeof mod).toBe('object');
      // TypeScript interfaces/type aliases are erased at runtime; module is still valid for Node
    });

    it('should not throw when imported in Node-like context', async () => {
      await expect(import('@aha/backend-utils')).resolves.toBeDefined();
    });
  });

  describe('Environment', () => {
    it('should run in Node-like environment (typeof process)', () => {
      expect(typeof process).toBe('object');
      expect(process.env).toBeDefined();
    });
  });
});
