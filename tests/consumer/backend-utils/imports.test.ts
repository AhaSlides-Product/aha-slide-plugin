import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { resolve } from 'path';

// Type-only imports: verify each documented type is exported (compile-time check when tsc runs)
import type {
  SubmissionRequest,
  SubmissionResult,
  CountTotalItem,
  CountUniqueItem,
  SyncItem,
  CountTotal,
  CountUnique,
  Sync,
} from '@aha/backend-utils';

// Use types in type positions so they are validated; removes unused-type warnings and ensures they exist
type _SubmissionRequest = SubmissionRequest;
type _SubmissionResult = SubmissionResult;
type _CountTotalItem = CountTotalItem;
type _CountUniqueItem = CountUniqueItem;
type _SyncItem = SyncItem;
type _CountTotal = CountTotal;
type _CountUnique = CountUnique;
type _Sync = Sync;

/**
 * Consumer tests for @aha/backend-utils package imports
 *
 * These tests verify that all documented exports are importable and have the correct types.
 * Type exports are validated at compile time via a tsc run; runtime tests verify the module loads.
 */
describe('@aha/backend-utils - Imports', () => {
  describe('Type exports (compile-time)', () => {
    it('should export SubmissionRequest, SubmissionResult, CountTotalItem, CountUniqueItem, SyncItem, CountTotal, CountUnique, Sync', () => {
      const testsDir = resolve(__dirname, '../..');
      const tsconfigPath = resolve(testsDir, 'consumer/config/tsconfig.backend-utils-typecheck.json');
      
      // Run TypeScript compiler to verify all types are correctly exported
      // If any type is missing or incorrect, tsc will fail with a non-zero exit code
      expect(() => {
        execSync(`npx tsc --noEmit -p "${tsconfigPath}"`, {
          cwd: testsDir,
          stdio: 'pipe',
        });
      }).not.toThrow();
    });
  });

  describe('Module structure (runtime)', () => {
    it('should be importable as a namespace', async () => {
      const BackendUtils = await import('@aha/backend-utils');
      expect(BackendUtils).toBeDefined();
      expect(typeof BackendUtils).toBe('object');
    });

    it('should be importable without throwing', async () => {
      const backendUtils = await import('@aha/backend-utils');
      expect(backendUtils).toBeDefined();
      expect(typeof backendUtils).toBe('object');
    });
  });
});
