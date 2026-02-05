import { describe, it, expect } from 'vitest';
import type {
  SubmissionRequest,
  SubmissionResult,
  CountTotal,
  CountUnique,
  CountTotalItem,
  CountUniqueItem,
  Sync,
  SyncItem,
} from '@aha/backend-utils';

/**
 * Type tests for @aha/backend-utils
 * 
 * These tests verify that TypeScript types match runtime behavior
 * and that interfaces/DTOs have the expected structure.
 */
describe('@aha/backend-utils - Types', () => {
  describe('SubmissionRequest', () => {
    it('should be a type alias', () => {
      // SubmissionRequest is a type alias to SubmissionPayload
      // Consumer contract: can be used as a type
      const request: SubmissionRequest = {} as SubmissionRequest;
      expect(request).toBeDefined();
    });
  });

  describe('SubmissionResult', () => {
    it('should have optional count_total, count_unique, and sync', () => {
      const result: SubmissionResult = {};
      expect(result).toBeDefined();
      expect(result.count_total).toBeUndefined();
      expect(result.count_unique).toBeUndefined();
      expect(result.sync).toBeUndefined();
    });

    it('should accept count_total', () => {
      const result: SubmissionResult = {
        count_total: [
          { bucket: 'slide-1', key: 'option-a', increase_by: 1 },
        ],
      };
      expect(result.count_total).toBeDefined();
      expect(Array.isArray(result.count_total)).toBe(true);
    });

    it('should accept count_unique', () => {
      const result: SubmissionResult = {
        count_unique: [
          { bucket: 'slide-1', key: 'option-a', item: 'user-123' },
        ],
      };
      expect(result.count_unique).toBeDefined();
      expect(Array.isArray(result.count_unique)).toBe(true);
    });

    it('should accept sync', () => {
      const result: SubmissionResult = {
        sync: [
          { path: 'topic/1', value: 'data' },
        ],
      };
      expect(result.sync).toBeDefined();
      expect(Array.isArray(result.sync)).toBe(true);
    });

    it('should accept all properties together', () => {
      const result: SubmissionResult = {
        count_total: [{ bucket: 'b', key: 'k', increase_by: 1 }],
        count_unique: [{ bucket: 'b', key: 'k', item: 'i' }],
        sync: [{ path: 'p', value: 'v' }],
      };
      expect(result.count_total).toBeDefined();
      expect(result.count_unique).toBeDefined();
      expect(result.sync).toBeDefined();
    });
  });

  describe('CountTotalItem', () => {
    it('should have required bucket, key, and increase_by', () => {
      const item: CountTotalItem = {
        bucket: 'slide-123',
        key: 'option-a',
        increase_by: 5,
      };
      expect(item.bucket).toBe('slide-123');
      expect(item.key).toBe('option-a');
      expect(item.increase_by).toBe(5);
    });

    it('should allow increase_by to be zero', () => {
      const item: CountTotalItem = {
        bucket: 'b',
        key: 'k',
        increase_by: 0,
      };
      expect(item.increase_by).toBe(0);
    });
  });

  describe('CountUniqueItem', () => {
    it('should have required bucket, key, and item', () => {
      const item: CountUniqueItem = {
        bucket: 'slide-123',
        key: 'option-a',
        item: 'user-456',
      };
      expect(item.bucket).toBe('slide-123');
      expect(item.key).toBe('option-a');
      expect(item.item).toBe('user-456');
    });
  });

  describe('SyncItem', () => {
    it('should have required path and value', () => {
      const item: SyncItem = {
        path: 'topic/slide-123',
        value: 'some-value',
      };
      expect(item.path).toBe('topic/slide-123');
      expect(item.value).toBe('some-value');
    });
  });

  describe('Type Aliases', () => {
    it('should allow CountTotal to be an array of CountTotalItem', () => {
      const total: CountTotal = [
        { bucket: 'b1', key: 'k1', increase_by: 1 },
        { bucket: 'b2', key: 'k2', increase_by: 2 },
      ];
      expect(Array.isArray(total)).toBe(true);
      expect(total.length).toBe(2);
      expect(total[0].bucket).toBe('b1');
    });

    it('should allow CountUnique to be an array of CountUniqueItem', () => {
      const unique: CountUnique = [
        { bucket: 'b1', key: 'k1', item: 'i1' },
        { bucket: 'b2', key: 'k2', item: 'i2' },
      ];
      expect(Array.isArray(unique)).toBe(true);
      expect(unique.length).toBe(2);
      expect(unique[0].item).toBe('i1');
    });

    it('should allow Sync to be an array of SyncItem', () => {
      const sync: Sync = [
        { path: 'p1', value: 'v1' },
        { path: 'p2', value: 'v2' },
      ];
      expect(Array.isArray(sync)).toBe(true);
      expect(sync.length).toBe(2);
      expect(sync[0].path).toBe('p1');
    });
  });

  describe('Type Compatibility', () => {
    it('should allow SubmissionResult to use CountTotal type', () => {
      const countTotal: CountTotal = [{ bucket: 'b', key: 'k', increase_by: 1 }];
      const result: SubmissionResult = { count_total: countTotal };
      expect(result.count_total).toEqual(countTotal);
    });

    it('should allow SubmissionResult to use CountUnique type', () => {
      const countUnique: CountUnique = [{ bucket: 'b', key: 'k', item: 'i' }];
      const result: SubmissionResult = { count_unique: countUnique };
      expect(result.count_unique).toEqual(countUnique);
    });

    it('should allow SubmissionResult to use Sync type', () => {
      const sync: Sync = [{ path: 'p', value: 'v' }];
      const result: SubmissionResult = { sync };
      expect(result.sync).toEqual(sync);
    });
  });
});
