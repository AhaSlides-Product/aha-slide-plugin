import { describe, it, expect } from 'vitest';
import {
  DEFAULT_TARGET_SIZE,
  pickLimitForTargetSize,
  readStoredTargetSize,
} from '../../../apps/preferenceGrouping/frontend/src/constants';

// Regression guard: the pick limit must derive from the persisted group size,
// not the useSync default that never replays to a late subscriber.
describe('preferenceGrouping - stored group size drives the pick limit', () => {
  it('reads the stored group size from the top-level attribute', () => {
    expect(readStoredTargetSize({ targetSize: 3 })).toBe(3);
  });

  it('reads the stored group size from the namespaced attribute shape', () => {
    expect(readStoredTargetSize({ preferenceGrouping: { targetSize: 5 } })).toBe(5);
  });

  it('returns undefined when genuinely unset so the caller falls back to the default', () => {
    expect(readStoredTargetSize({})).toBeUndefined();
    expect(readStoredTargetSize(undefined)).toBeUndefined();
    expect(readStoredTargetSize({ targetSize: 'x' })).toBeUndefined();
  });

  it('group size 3 yields a pick limit of 2 (the reported bug)', () => {
    const stored = readStoredTargetSize({ targetSize: 3 });
    expect(pickLimitForTargetSize(stored ?? DEFAULT_TARGET_SIZE)).toBe(2);
  });

  it('group size 5 yields a pick limit of 4', () => {
    const stored = readStoredTargetSize({ targetSize: 5 });
    expect(pickLimitForTargetSize(stored ?? DEFAULT_TARGET_SIZE)).toBe(4);
  });

  it('falls back to the default pick limit only when the group size is unset', () => {
    const stored = readStoredTargetSize({});
    expect(pickLimitForTargetSize(stored ?? DEFAULT_TARGET_SIZE)).toBe(
      DEFAULT_TARGET_SIZE - 1,
    );
  });
});
