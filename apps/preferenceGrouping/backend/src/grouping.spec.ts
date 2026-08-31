import { computeGroupSizes, formGroups, type FormGroupsInput } from './grouping';

/** All participant ids appear exactly once across the returned groups. */
function assertPartition(groups: string[][], participantIds: string[]): void {
  const placed = groups.flat().sort();
  expect(placed).toEqual([...participantIds].sort());
  expect(new Set(placed).size).toBe(participantIds.length);
}

/** Index of the group holding `id`. */
function groupOf(groups: string[][], id: string): number {
  return groups.findIndex((g) => g.includes(id));
}

/** How many of `person`'s picks share their group. */
function satisfied(groups: string[][], person: string, picks: string[]): number {
  const home = groups[groupOf(groups, person)] ?? [];
  return picks.filter((p) => home.includes(p)).length;
}

function roster(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i + 1}`);
}

describe('Preference Grouping > computeGroupSizes', () => {
  it('Verify that a room smaller than the target stays a single group', () => {
    expect(computeGroupSizes(2, 4, 3)).toEqual([2]);
    expect(computeGroupSizes(3, 4, 3)).toEqual([3]);
    expect(computeGroupSizes(4, 4, 3)).toEqual([4]);
  });

  it('Verify that sizes stay balanced within one of each other', () => {
    for (const n of [5, 6, 7, 9, 10, 11, 13, 17, 23]) {
      const sizes = computeGroupSizes(n, 4, 3);
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(n);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    }
  });

  it('Verify that group count never forces an average below the minimum size', () => {
    for (const n of [6, 7, 8, 9, 12, 20]) {
      const sizes = computeGroupSizes(n, 4, 3);
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(3);
    }
  });

  it('Verify that an empty room yields no groups', () => {
    expect(computeGroupSizes(0, 4, 3)).toEqual([]);
  });
});

describe('Preference Grouping > formGroups', () => {
  it('Verify that every participant is placed in exactly one group', () => {
    const participantIds = roster(11);
    const { groups } = formGroups({
      participantIds,
      picks: { p1: ['p2', 'p3'], p2: ['p1'], p5: ['p6'] },
    });
    assertPartition(groups, participantIds);
  });

  it('Verify that a mutual pair is kept in the same group', () => {
    const participantIds = roster(8);
    const { groups } = formGroups({
      participantIds,
      picks: { p1: ['p2'], p2: ['p1'], p7: ['p8'], p8: ['p7'] },
      targetSize: 4,
    });
    expect(groupOf(groups, 'p1')).toBe(groupOf(groups, 'p2'));
    expect(groupOf(groups, 'p7')).toBe(groupOf(groups, 'p8'));
  });

  it('Verify that a chain of mutual pairs stays together when it fits a group', () => {
    const participantIds = roster(8);
    // p1<->p2<->p3 mutual chain (fits a group of 4).
    const { groups } = formGroups({
      participantIds,
      picks: { p1: ['p2'], p2: ['p1', 'p3'], p3: ['p2'] },
      targetSize: 4,
    });
    expect(groupOf(groups, 'p1')).toBe(groupOf(groups, 'p2'));
    expect(groupOf(groups, 'p2')).toBe(groupOf(groups, 'p3'));
  });

  it('Verify that groups stay balanced within one member of each other', () => {
    const participantIds = roster(10);
    const { groups } = formGroups({
      participantIds,
      picks: { p1: ['p2'], p2: ['p1'] },
      targetSize: 4,
    });
    const sizes = groups.map((g) => g.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it('Verify that abstainers are still placed into groups', () => {
    const participantIds = roster(9);
    // Only p1/p2 pick; everyone else abstains.
    const { groups } = formGroups({
      participantIds,
      picks: { p1: ['p2'], p2: ['p1'] },
      targetSize: 3,
    });
    assertPartition(groups, participantIds);
    for (const id of participantIds) {
      expect(groupOf(groups, id)).toBeGreaterThanOrEqual(0);
    }
  });

  it('Verify that a picker with a feasible match ends with at least one satisfied pick', () => {
    const participantIds = roster(8);
    const picks: Record<string, string[]> = {
      p1: ['p2'],
      p2: ['p1'],
      p3: ['p4'],
      p4: ['p3'],
      p5: ['p6'],
      p6: ['p5'],
      p7: ['p8'],
      p8: ['p7'],
    };
    const { groups } = formGroups({ participantIds, picks, targetSize: 4 });
    for (const [person, chosen] of Object.entries(picks)) {
      expect(satisfied(groups, person, chosen)).toBeGreaterThanOrEqual(1);
    }
  });

  it('Verify that the same input and seed reproduce identical groups', () => {
    const input: FormGroupsInput = {
      participantIds: roster(13),
      picks: { p1: ['p4'], p4: ['p1'], p2: ['p3'], p9: ['p10', 'p11'] },
      targetSize: 4,
      seed: 42,
    };
    const a = formGroups(input);
    const b = formGroups(input);
    expect(a.groups).toEqual(b.groups);
    expect(a.seed).toBe(42);
  });

  it('Verify that a run is reproducible even when no seed is supplied', () => {
    const input: FormGroupsInput = {
      participantIds: roster(12),
      picks: { p1: ['p2'], p2: ['p1'], p6: ['p7'] },
      targetSize: 4,
    };
    expect(formGroups(input).groups).toEqual(formGroups(input).groups);
  });

  it('Verify that everyone picking one popular person still produces valid balanced groups', () => {
    const participantIds = roster(10);
    const picks: Record<string, string[]> = {};
    for (const id of participantIds) if (id !== 'p1') picks[id] = ['p1'];
    const { groups } = formGroups({ participantIds, picks, targetSize: 4 });
    assertPartition(groups, participantIds);
    const sizes = groups.map((g) => g.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it('Verify that nobody picking anyone still partitions everyone into balanced groups', () => {
    const participantIds = roster(10);
    const { groups } = formGroups({ participantIds, picks: {}, targetSize: 4 });
    assertPartition(groups, participantIds);
    const sizes = groups.map((g) => g.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it('Verify that a headcount not divisible by the target still places everyone', () => {
    const participantIds = roster(7);
    const { groups } = formGroups({
      participantIds,
      picks: { p1: ['p2'], p2: ['p1'] },
      targetSize: 4,
    });
    assertPartition(groups, participantIds);
    expect(groups.length).toBe(2);
  });

  it('Verify that a room below the target size forms one group with everyone', () => {
    const participantIds = roster(3);
    const { groups } = formGroups({
      participantIds,
      picks: { p1: ['p2'] },
      targetSize: 4,
    });
    expect(groups.length).toBe(1);
    assertPartition(groups, participantIds);
  });

  it('Verify that self-picks and picks of unknown people are ignored', () => {
    const participantIds = roster(6);
    const { groups } = formGroups({
      participantIds,
      picks: { p1: ['p1', 'ghost', 'p2'], p2: ['p1'] },
      targetSize: 3,
    });
    assertPartition(groups, participantIds);
    // The only real (mutual) tie is p1<->p2 — they should land together.
    expect(groupOf(groups, 'p1')).toBe(groupOf(groups, 'p2'));
  });

  it('Verify that an empty roster yields no groups', () => {
    expect(formGroups({ participantIds: [], picks: {} }).groups).toEqual([]);
  });

  it('Verify that a duplicated participant id is only placed once', () => {
    const { groups } = formGroups({
      participantIds: ['p1', 'p1', 'p2', 'p3', 'p4', 'p5'],
      picks: {},
      targetSize: 3,
    });
    assertPartition(groups, ['p1', 'p2', 'p3', 'p4', 'p5']);
  });

  it('Verify that mutual pairs are prioritised over one-way picks', () => {
    // p1<->p2 mutual; p3->p1 one-way. The mutual pair must be honoured.
    const participantIds = roster(6);
    const { groups } = formGroups({
      participantIds,
      picks: { p1: ['p2'], p2: ['p1'], p3: ['p1'] },
      targetSize: 3,
    });
    expect(groupOf(groups, 'p1')).toBe(groupOf(groups, 'p2'));
  });
});
