import { capPickLists, DEFAULT_TARGET_SIZE, MAX_TARGET_SIZE, pickLimitForTargetSize } from './dto';

describe('Preference Grouping > pickLimitForTargetSize', () => {
  it('Verify that the pick limit is one fewer than the group size', () => {
    expect(pickLimitForTargetSize(4)).toBe(3);
    expect(pickLimitForTargetSize(3)).toBe(2);
    expect(pickLimitForTargetSize(2)).toBe(1);
    expect(pickLimitForTargetSize(MAX_TARGET_SIZE)).toBe(MAX_TARGET_SIZE - 1);
  });

  it('Verify that the pick limit never drops below one', () => {
    expect(pickLimitForTargetSize(1)).toBe(1);
    expect(pickLimitForTargetSize(0)).toBe(DEFAULT_TARGET_SIZE - 1);
  });

  it('Verify that an absent group size falls back to the default', () => {
    expect(pickLimitForTargetSize(undefined)).toBe(DEFAULT_TARGET_SIZE - 1);
  });
});

describe('Preference Grouping > capPickLists', () => {
  it('Verify that an over-long pick list is trimmed to the derived limit', () => {
    const capped = capPickLists({ a: ['b', 'c', 'd', 'e', 'f'] }, 4);
    expect(capped.a).toEqual(['b', 'c', 'd']);
  });

  it('Verify that a legitimately larger pick list is not dropped for a bigger group size', () => {
    const capped = capPickLists({ a: ['b', 'c', 'd', 'e', 'f'] }, 6);
    expect(capped.a).toEqual(['b', 'c', 'd', 'e', 'f']);
  });

  it('Verify that an absent group size caps against the default group size', () => {
    const capped = capPickLists({ a: ['b', 'c', 'd', 'e'] });
    expect(capped.a).toHaveLength(DEFAULT_TARGET_SIZE - 1);
  });

  it('Verify that a non-array pick value becomes an empty list', () => {
    const capped = capPickLists({ a: undefined as unknown as string[] }, 4);
    expect(capped.a).toEqual([]);
  });
});
