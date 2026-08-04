// Attributes each event to the action that most plausibly caused it, then
// applies the mechanical defect checks — the ones a string comparison can
// make, so the LLM never has to.
//
// Pure: takes session.toJSON(), returns plain data.

// Must stay in step with SETTLE_MS in sweep.mjs: the sweep waits this long
// after a click before moving on, so an event arriving later would be
// attributed to whatever the sweep clicked next.
const DEFAULT_WINDOW_MS = 1500;

function flagsFor(events) {
  const flags = [];
  if (events.length === 0) {
    flags.push('no-event');
    return flags;
  }

  const names = events.map((e) => e.name);
  if (new Set(names).size !== names.length) flags.push('duplicate');
  if (names.some((n) => n.includes('_anonymous'))) flags.push('anonymous-name');
  if (names.some((n) => n.includes('undefined_action'))) flags.push('undefined-action');

  const emptyProp = events.some((e) =>
    Object.values(e.props ?? {}).some((v) => v === null || v === undefined || v === ''),
  );
  if (emptyProp) flags.push('empty-props');

  return flags;
}

/**
 * @param {object} session  the parsed contents of a session.json
 * @param {{ windowMs?: number }} [options]
 * @returns {{ pairs: object[], transitions: object[], orphans: object[], checks: object }}
 */
export function pairSession(session, { windowMs = DEFAULT_WINDOW_MS } = {}) {
  const timeline = [...(session.timeline ?? [])].sort((a, b) => a.seq - b.seq);
  const pairs = [];
  const orphans = [];
  let current = null;
  let totalEvents = 0;

  for (const entry of timeline) {
    if (entry.kind === 'action') {
      current = { action: entry, events: [], flags: [] };
      pairs.push(current);
      continue;
    }
    if (entry.kind !== 'event') continue;

    totalEvents += 1;
    if (current && entry.t - current.action.t <= windowMs) {
      current.events.push(entry);
    } else {
      orphans.push(entry);
    }
  }

  for (const pair of pairs) pair.flags = flagsFor(pair.events);

  return {
    pairs,
    transitions: pairs.filter((p) => p.action.type === 'navigate'),
    orphans,
    checks: {
      signalDetected: session.meta?.signalDetected ?? false,
      totalActions: pairs.length,
      totalEvents,
      totalOrphans: orphans.length,
    },
  };
}

// CLI: `node pair.mjs <session.json>` prints the paired result as JSON.
// The skill invokes this rather than assembling its own node -e one-liner.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFile } = await import('node:fs/promises');
  const path = process.argv[2];
  if (!path) {
    console.error('usage: node pair.mjs <session.json>');
    process.exit(1);
  }
  const session = JSON.parse(await readFile(path, 'utf8'));
  const result = pairSession(session);
  if (!result.checks.signalDetected) {
    console.error('signal-not-detected: this session captured no analytics payload.');
    console.error('The hooks did not match the app under test. Do NOT read this as "no tracking".');
    process.exit(2);
  }
  console.log(JSON.stringify(result, null, 2));
}
