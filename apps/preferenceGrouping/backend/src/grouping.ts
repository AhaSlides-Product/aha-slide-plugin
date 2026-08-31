/**
 * Preference-based group formation.
 *
 * Everyone privately picks up to N peers they'd like to team up with; this
 * module partitions the room into balanced groups that maximise satisfied
 * picks, weighting MUTUAL picks (A picks B and B picks A) far above one-way
 * picks. The whole module is pure and deterministic given a seed, so the same
 * input always yields the same groups and it is straightforward to unit-test.
 *
 * The public entry point is {@link formGroups}.
 */

/** How much a satisfied mutual pair is worth on top of its two one-way edges. */
const MUTUAL_BONUS = 3;

/** Local-search sweeps attempted before returning. Room-sized n makes this cheap. */
const LOCAL_SEARCH_PASSES = 6;

export interface FormGroupsInput {
  /** Every participant to place (the full roster), even those who abstained. */
  participantIds: string[];
  /** participantId -> the peer ids they picked (0..pickLimit entries). */
  picks: Record<string, string[]>;
  /** Ideal group size. Group count is derived from headcount. Default 4. */
  targetSize?: number;
  /** Smallest acceptable group where headcount allows. Default 3. */
  minSize?: number;
  /** Seed for the tie-break RNG so a re-run reproduces the same groups. */
  seed?: number;
}

export interface FormGroupsResult {
  /** Groups as arrays of participant ids, ordered largest-first-slot to smallest. */
  groups: string[][];
  /** The seed actually used (echoed so a caller can reproduce a run). */
  seed: number;
}

/** A small, fast, seedable PRNG (mulberry32) — reproducible across machines. */
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic 32-bit hash of the sorted roster, used as the default seed. */
function defaultSeed(participantIds: string[]): number {
  const key = [...participantIds].sort().join('');
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** In-place Fisher–Yates shuffle driven by the seeded RNG. */
function shuffle<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

interface Graph {
  /** picker -> set of valid peers they picked. */
  adjacency: Map<string, Set<string>>;
  /** Unordered "a b" (a < b) keys of mutual pairs. */
  mutualPairs: Set<string>;
  /** person -> the peers they form a mutual pair with (both directions stored). */
  mutualAdjacency: Map<string, Set<string>>;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a} ${b}` : `${b} ${a}`;
}

/** Build the pick graph, dropping self-picks and picks of non-participants. */
function buildGraph(participantIds: string[], picks: Record<string, string[]>): Graph {
  const valid = new Set(participantIds);
  const adjacency = new Map<string, Set<string>>();
  for (const id of participantIds) adjacency.set(id, new Set());

  for (const picker of participantIds) {
    const chosen = picks[picker] ?? [];
    for (const peer of chosen) {
      if (peer !== picker && valid.has(peer)) {
        adjacency.get(picker)!.add(peer);
      }
    }
  }

  const mutualPairs = new Set<string>();
  const mutualAdjacency = new Map<string, Set<string>>();
  for (const id of participantIds) mutualAdjacency.set(id, new Set());
  for (const [picker, peers] of adjacency) {
    for (const peer of peers) {
      if (adjacency.get(peer)?.has(picker)) {
        mutualPairs.add(pairKey(picker, peer));
        mutualAdjacency.get(picker)!.add(peer);
      }
    }
  }

  return { adjacency, mutualPairs, mutualAdjacency };
}

/**
 * Group-size targets for a headcount. Sizes differ by at most one (balanced)
 * and average at least `minSize` whenever the room is big enough; a room
 * smaller than `minSize` stays a single unavoidable group.
 */
export function computeGroupSizes(n: number, targetSize: number, minSize: number): number[] {
  if (n <= 0) return [];
  if (n <= targetSize) return [n];

  const byTarget = Math.max(1, Math.round(n / targetSize));
  const maxByMin = Math.max(1, Math.floor(n / minSize));
  const numGroups = Math.min(byTarget, maxByMin);

  const base = Math.floor(n / numGroups);
  const remainder = n - base * numGroups;
  const sizes: number[] = [];
  for (let i = 0; i < numGroups; i++) sizes.push(base + (i < remainder ? 1 : 0));
  return sizes;
}

/**
 * Cluster people who mutually picked each other, so a seed group starts around
 * real mutual friendships. A cluster is capped at `maxClusterSize` so it can
 * always fit inside one group.
 */
function buildMutualClusters(
  participantIds: string[],
  graph: Graph,
  maxClusterSize: number,
  rng: () => number,
): string[][] {
  const parent = new Map<string, string>();
  const size = new Map<string, number>();
  for (const id of participantIds) {
    parent.set(id, id);
    size.set(id, 1);
  }

  function find(x: string): string {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    while (parent.get(x) !== root) {
      const next = parent.get(x)!;
      parent.set(x, root);
      x = next;
    }
    return root;
  }

  const pairs = shuffle(
    [...graph.mutualPairs].map((k) => k.split(' ') as [string, string]),
    rng,
  );
  for (const [a, b] of pairs) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) continue;
    if (size.get(ra)! + size.get(rb)! > maxClusterSize) continue; // keep clusters group-sized
    parent.set(ra, rb);
    size.set(rb, size.get(ra)! + size.get(rb)!);
  }

  const clusters = new Map<string, string[]>();
  for (const id of participantIds) {
    const root = find(id);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(id);
  }
  return [...clusters.values()];
}

/** New satisfied-edge weight gained by adding `person` to a group's members. */
function connectionGain(person: string, members: string[], graph: Graph): number {
  let gain = 0;
  for (const member of members) {
    const picksMember = graph.adjacency.get(person)?.has(member) ? 1 : 0;
    const pickedByMember = graph.adjacency.get(member)?.has(person) ? 1 : 0;
    gain += picksMember + pickedByMember;
    if (picksMember && pickedByMember) gain += MUTUAL_BONUS;
  }
  return gain;
}

/**
 * Total satisfaction of an assignment: same-group edges + mutual bonuses.
 *
 * The mutual bonus is summed from each group's OWN in-group mutual pairs
 * (via the per-person mutual adjacency), not by scanning the whole room's
 * pair set for every group — a pair split across groups contributes nothing,
 * so scanning it was both wasteful and pointless. Each in-group pair is
 * counted once, from its lexicographically smaller endpoint. The score is
 * identical to a global scan; only the cost drops from O(groups · all_pairs)
 * to O(members + in-group mutual degree).
 */
function totalSatisfaction(groups: string[][], graph: Graph): number {
  let score = 0;
  for (const members of groups) {
    const inGroup = new Set(members);
    for (const person of members) {
      for (const peer of graph.adjacency.get(person) ?? []) {
        if (inGroup.has(peer)) score += 1;
      }
      for (const partner of graph.mutualAdjacency.get(person) ?? []) {
        if (person < partner && inGroup.has(partner)) score += MUTUAL_BONUS;
      }
    }
  }
  return score;
}

/** How many of `person`'s own picks sit in the same group as them. */
function satisfiedPicks(person: string, members: Set<string>, graph: Graph): number {
  let count = 0;
  for (const peer of graph.adjacency.get(person) ?? []) {
    if (members.has(peer)) count++;
  }
  return count;
}

/**
 * Partition the roster into balanced, preference-satisfying groups.
 *
 * Heuristic: seed groups from mutual-pick clusters, greedily place everyone
 * else where they gain the most satisfied connections, then run a few
 * local-search swap/move sweeps and a final "give an unlucky picker at least
 * one" pass. All tie-breaks use the seeded RNG, so runs are reproducible.
 */
export function formGroups(input: FormGroupsInput): FormGroupsResult {
  const targetSize = input.targetSize ?? 4;
  const minSize = input.minSize ?? 3;

  // De-duplicate the roster while preserving a stable order. The default seed is
  // derived from the deduped roster so a repeated id can't reseed the same room.
  const participantIds = [...new Set(input.participantIds)];
  const n = participantIds.length;

  const seed = input.seed ?? defaultSeed(participantIds);
  const rng = createRng(seed);

  const sizes = computeGroupSizes(n, targetSize, minSize);
  if (sizes.length === 0) return { groups: [], seed };
  if (sizes.length === 1) return { groups: [participantIds], seed };

  const graph = buildGraph(participantIds, input.picks);
  const maxSize = Math.max(...sizes);

  const groups: string[][] = sizes.map(() => []);
  const capacity = [...sizes];
  const assignment = new Map<string, number>();

  function place(person: string, groupIndex: number): void {
    groups[groupIndex].push(person);
    capacity[groupIndex] -= 1;
    assignment.set(person, groupIndex);
  }

  // 1. Seed with mutual-pick clusters, biggest first (best-fit into a slot).
  const clusters = buildMutualClusters(participantIds, graph, maxSize, rng).sort(
    (a, b) => b.length - a.length,
  );
  const loners: string[] = [];
  for (const cluster of clusters) {
    if (cluster.length === 1) {
      loners.push(cluster[0]);
      continue;
    }
    let best = -1;
    let bestSlack = Infinity;
    for (let g = 0; g < groups.length; g++) {
      const slack = capacity[g] - cluster.length;
      if (slack >= 0 && slack < bestSlack) {
        bestSlack = slack;
        best = g;
      }
    }
    if (best === -1) {
      // No single group fits the whole cluster — break it into loners so the
      // greedy pass re-homes them individually (rare: only near capacity edges).
      loners.push(...cluster);
      continue;
    }
    for (const person of cluster) place(person, best);
  }

  // 2. Greedily place the rest where they gain the most satisfied connections;
  //    people who actually picked someone go first so their picks can land.
  const remaining = shuffle(loners, rng).sort((a, b) => {
    const aPicks = graph.adjacency.get(a)?.size ?? 0;
    const bPicks = graph.adjacency.get(b)?.size ?? 0;
    return bPicks - aPicks;
  });
  for (const person of remaining) {
    let best = -1;
    let bestGain = -Infinity;
    for (let g = 0; g < groups.length; g++) {
      if (capacity[g] <= 0) continue;
      const gain = connectionGain(person, groups[g], graph);
      // Tie-break toward the emptier group to keep sizes balanced.
      const adjusted = gain + capacity[g] * 1e-6;
      if (adjusted > bestGain) {
        bestGain = adjusted;
        best = g;
      }
    }
    if (best === -1) best = capacity.indexOf(Math.max(...capacity)); // safety net
    place(person, best);
  }

  // 3. Local search: swap two people across groups when it raises total
  //    satisfaction (sizes are preserved by construction of a swap).
  for (let pass = 0; pass < LOCAL_SEARCH_PASSES; pass++) {
    let improved = false;
    const order = shuffle([...participantIds], rng);
    for (let i = 0; i < order.length; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const p = order[i];
        const q = order[j];
        const gp = assignment.get(p)!;
        const gq = assignment.get(q)!;
        if (gp === gq) continue;
        if (trySwap(p, q, gp, gq, groups, assignment, graph)) improved = true;
      }
    }
    if (!improved) break;
  }

  // 4. "At least one" pass: a person who made picks but landed with none of
  //    them gets a satisfying swap when one exists that doesn't lower the total.
  giveUnluckyPickersOne(participantIds, groups, assignment, graph);

  return { groups, seed };
}

/** Swap p and q between their groups iff it strictly raises total satisfaction. */
function trySwap(
  p: string,
  q: string,
  gp: number,
  gq: number,
  groups: string[][],
  assignment: Map<string, number>,
  graph: Graph,
): boolean {
  const before = groupSatisfaction(groups[gp], graph) + groupSatisfaction(groups[gq], graph);
  applySwap(p, q, gp, gq, groups, assignment);
  const after = groupSatisfaction(groups[gp], graph) + groupSatisfaction(groups[gq], graph);
  if (after > before) return true;
  applySwap(q, p, gp, gq, groups, assignment); // revert
  return false;
}

function applySwap(
  p: string,
  q: string,
  gp: number,
  gq: number,
  groups: string[][],
  assignment: Map<string, number>,
): void {
  groups[gp][groups[gp].indexOf(p)] = q;
  groups[gq][groups[gq].indexOf(q)] = p;
  assignment.set(p, gq);
  assignment.set(q, gp);
}

/** Satisfaction contributed by a single group in isolation. */
function groupSatisfaction(members: string[], graph: Graph): number {
  return totalSatisfaction([members], graph);
}

/**
 * For each person who picked someone yet has zero satisfied picks, look for a
 * swap partner whose move gives the unlucky person at least one satisfied pick
 * without reducing overall satisfaction.
 */
function giveUnluckyPickersOne(
  participantIds: string[],
  groups: string[][],
  assignment: Map<string, number>,
  graph: Graph,
): void {
  for (const person of participantIds) {
    if ((graph.adjacency.get(person)?.size ?? 0) === 0) continue;
    const home = assignment.get(person)!;
    if (satisfiedPicks(person, new Set(groups[home]), graph) > 0) continue;

    // A satisfying group is one already holding a peer this person picked.
    for (const peer of graph.adjacency.get(person) ?? []) {
      const target = assignment.get(peer)!;
      if (target === home) continue;
      const before = totalSatisfaction(groups, graph);
      for (const candidate of [...groups[target]]) {
        if (candidate === peer) continue;
        applySwap(person, candidate, home, target, groups, assignment);
        if (
          totalSatisfaction(groups, graph) >= before &&
          satisfiedPicks(person, new Set(groups[target]), graph) > 0
        ) {
          break; // keep this improving/neutral swap
        }
        applySwap(candidate, person, home, target, groups, assignment); // revert
      }
      if (satisfiedPicks(person, new Set(groups[assignment.get(person)!]), graph) > 0) break;
    }
  }
}
