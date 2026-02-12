import { describe, it, expect } from 'vitest';
import type { SubmissionSenderType } from '@aha/common';
import type {
  SubmissionRequest,
  SubmissionResult,
  CountTotal,
  CountUnique,
  Sync,
  CountTotalItem,
  SyncItem,
} from '@aha/backend-utils';

/**
 * Verifies that types and data shapes used by the frontend (audience submission)
 * and backend (processing and response) are compatible.
 */
describe('Frontend–Backend Integration', () => {
  describe('Submission flow types', () => {
    it('should allow frontend payload to be typed as SubmissionRequest', () => {
      // Simulates payload sent from audience frontend to backend
      const payload: SubmissionRequest = {
        presentationId: 1,
        slideId: 2,
        slideVersion: 1,
        type: 'live',
        senderId: 'aud-123',
        senderType: 'audience' as SubmissionSenderType,
        attributes: { key: 'option-a', increase: 1 },
      };
      expect(payload.presentationId).toBe(1);
      expect(payload.slideId).toBe(2);
      expect(payload.attributes).toEqual({ key: 'option-a', increase: 1 });
    });

    it('should allow backend to return SubmissionResult with count_total and sync', () => {
      const count_total: CountTotal = [
        { bucket: 'slide-1/2/1', key: 'option-a', increase_by: 1 },
      ];
      const sync: Sync = [
        { path: 'sample-submissions/1/2/1', value: JSON.stringify({ id: 1 }) },
      ];
      const response: SubmissionResult = {
        count_total,
        sync,
      };
      expect(response.count_total).toEqual(count_total);
      expect(response.sync).toEqual(sync);
    });

    it('should allow backend to return SubmissionResult with count_unique', () => {
      const count_unique: CountUnique = [
        { bucket: 'slide-1', key: 'option-a', item: 'user-456' },
      ];
      const response: SubmissionResult = { count_unique };
      expect(response.count_unique).toBeDefined();
      expect(Array.isArray(response.count_unique)).toBe(true);
    });

    it('should have compatible CountTotalItem shape between frontend and backend', () => {
      // Backend builds CountTotalItem; frontend may consume count_total in response
      const item: CountTotalItem = {
        bucket: 'presentation-1/slide-2/version-1',
        key: 'option-a',
        increase_by: 1,
      };
      const result: SubmissionResult = { count_total: [item] };
      expect(result.count_total![0].bucket).toBe(item.bucket);
      expect(result.count_total![0].key).toBe(item.key);
      expect(result.count_total![0].increase_by).toBe(item.increase_by);
    });

    it('should have compatible SyncItem shape for real-time broadcast', () => {
      const item: SyncItem = {
        path: 'topic/presentation-1/slide-2',
        value: JSON.stringify({ submissionId: 'sub-1' }),
      };
      const result: SubmissionResult = { sync: [item] };
      expect(result.sync![0].path).toBe(item.path);
      expect(result.sync![0].value).toBe(item.value);
    });
  });

  describe('End-to-end type flow', () => {
    it('should type request and response for a full submit flow', () => {
      type SubmitPayload = SubmissionRequest;
      type SubmitResponse = SubmissionResult;

      const request: SubmitPayload = {
        presentationId: 100,
        slideId: 200,
        slideVersion: 1,
        type: 'live',
        senderId: 'aud-1',
        senderType: 'audience' as SubmissionSenderType,
        attributes: { key: 'A', increase: 1 },
      };

      const response: SubmitResponse = {
        count_total: [
          { bucket: 'b', key: request.attributes.key, increase_by: (request.attributes as any).increase },
        ],
        sync: [{ path: 'topic', value: JSON.stringify(request) }],
      };

      expect(response.count_total).toHaveLength(1);
      expect(response.sync).toHaveLength(1);
    });
  });
});
