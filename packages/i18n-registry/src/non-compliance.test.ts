/**
 * Tests over the migration checklist.
 *
 * The record's whole value is that a human can open a ticket straight from it
 * without re-deriving anything. That only holds if every entry is complete,
 * points at a real language, and names a file someone can actually open — so
 * that is what these assert.
 */
import { describe, expect, it } from 'vitest';
import {
  APP_IDS,
  CONTENT_DIVERGENCES,
  NON_COMPLIANCE,
  deviationsByKind,
  deviationsForApp,
} from './non-compliance';
import { canonicalCodes, isKnownCode, resolveCode } from './registry';

describe('the record — every entry is actionable', () => {
  it.each(NON_COMPLIANCE.map((d, i) => [`${d.app}/${d.kind}/${d.language ?? '—'}#${i}`, d] as const))(
    '%s is complete',
    (_label, d) => {
      expect(APP_IDS).toContain(d.app);
      // The ticket has to start somewhere: name the repo and the file.
      expect(d.source).toBeTruthy();
      expect(d.source).toMatch(/^(stpancras-|aha-)/);
      // Prose that explains why it matters, not a restatement of the fields.
      expect(d.detail.length).toBeGreaterThan(40);
    },
  );

  it('keeps actual/required BARE, never prose — the shim recipe depends on it', () => {
    // Caught a real bug: `actual: 'si (extra `messages` key -> ...)'` made the
    // README's documented shim silently skip `si` and `br`. Prose belongs in
    // `detail`; these two fields are machine-readable.
    const CODE_KINDS = ['wrong-code', 'legacy-alias', 'compat-shim', 'casing'];
    for (const d of NON_COMPLIANCE) {
      for (const [field, value] of [
        ['actual', d.actual],
        ['required', d.required],
      ] as const) {
        if (value === null) continue;
        expect(value.trim(), `${d.app}/${d.kind}.${field} is padded`).toBe(value);
        if (CODE_KINDS.includes(d.kind)) {
          expect(value, `${d.app}/${d.kind}.${field} = "${value}" is not a bare code`).toMatch(
            /^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$/,
          );
        }
      }
    }
  });

  it('states the required value exactly where one exists, and null where it does not', () => {
    for (const d of NON_COMPLIANCE) {
      if (d.kind === 'wrong-code' || d.kind === 'casing') {
        // Something to adopt.
        expect(d.required, `${d.app}/${d.kind} must name the code to adopt`).not.toBeNull();
      }
      if (d.kind === 'legacy-alias' || d.kind === 'compat-shim') {
        // The fix is deletion — nothing to adopt.
        expect(d.required, `${d.app}/${d.kind} is fixed by deletion`).toBeNull();
      }
      if (d.kind === 'missing-language') {
        // Having nothing IS the defect.
        expect(d.actual).toBeNull();
        expect(d.required).toBe(d.language);
      }
    }
  });

  it('points every entry at a real registry language', () => {
    const codes = new Set(canonicalCodes());
    for (const d of NON_COMPLIANCE) {
      if (d.kind === 'unregistered-language') {
        // The one kind where null is correct — that IS the finding.
        expect(d.language, `${d.app}: unregistered-language must have a null language`).toBeNull();
        continue;
      }
      expect(d.language, `${d.app}/${d.kind} needs a language`).not.toBeNull();
      expect(codes.has(d.language as string), `"${d.language}" is not a registry code`).toBe(true);
    }
  });

  it('never claims an app must adopt a code the registry rejects', () => {
    // Guards the record against becoming a mapping: `required` is always the
    // standard's answer, so it must survive the registry's own validator.
    for (const d of NON_COMPLIANCE) {
      if (d.kind !== 'wrong-code' && d.kind !== 'casing') continue;
      expect(isKnownCode(d.required as string), `${d.app} told to adopt "${d.required}"`).toBe(
        true,
      );
    }
  });

  it('records the actual code as one the registry rejects', () => {
    // The mirror of the above: if a `wrong-code` entry's `actual` resolved,
    // it would not be wrong, and the entry is stale.
    for (const d of deviationsByKind('wrong-code')) {
      expect(isKnownCode(d.actual), `"${d.actual}" resolves — is it still wrong?`).toBe(false);
      expect(d.actual).not.toBeNull();
    }
  });

  it('marks every blocked entry with what blocks it', () => {
    for (const d of NON_COMPLIANCE) {
      // compat-shims are blocked by definition; content-dependent entries say so.
      if (d.kind === 'compat-shim') {
        expect(d.blockedBy, `${d.app} shim must name what unblocks it`).toBeTruthy();
      }
    }
  });
});

describe('the record — it matches what the apps actually do', () => {
  it('names the four ISO-collision codes and no others as wrong-code', () => {
    const actuals = new Set(deviationsByKind('wrong-code').map((d) => d.actual));
    // pt-BR is the survey's. Unlike kr/se it is not an ISO collision — it is a
    // real code for a real dialect — but it is still wrong HERE, because the
    // product ships one Portuguese and it is coded `pt`.
    expect([...actuals].sort()).toEqual(['kr', 'pt-BR', 'se'].sort());
  });

  it('leaves no wrong-code entry blocked on the settled pt code question', () => {
    // The pt CODE decision landed (2026-07): one Portuguese, coded `pt`. Every
    // wrong-code entry is now actionable, survey's pt-BR included. Nothing may
    // sit behind the pt question any more — only the DIALECT is still open, and
    // no wrong-code entry depends on it (a rename does not touch content).
    const blocked = deviationsByKind('wrong-code').filter((d) => d.blockedBy !== undefined);
    expect(blocked).toEqual([]);
  });

  it("records the survey's pt-BR as a rename it must now do", () => {
    const [pt] = deviationsForApp('survey').filter(
      (d) => d.kind === 'wrong-code' && d.actual === 'pt-BR',
    );
    expect(pt, 'survey pt-BR wrong-code entry must exist').toBeDefined();
    expect(pt.required, 'must migrate to the canonical code').toBe('pt');
    expect(pt.blockedBy, 'the pt code decision unblocked this').toBeUndefined();
    // Guard the distinction this entry exists to hold: it is a code fix, and
    // must not be read as deciding which dialect the survey ships.
    expect(pt.detail).toMatch(/code fix ONLY/i);
  });

  it('records the drift that renders English today', () => {
    const missing = deviationsByKind('missing-language').map((d) => `${d.app}:${d.language}`);
    expect(missing.sort()).toEqual(['report:az', 'survey:az', 'survey:sv', 'team:az'].sort());
  });

  it('gives presenter and audience no missing-language entries — they are the authority', () => {
    expect(deviationsForApp('presenter').filter((d) => d.kind === 'missing-language')).toEqual([]);
    expect(deviationsForApp('audience').filter((d) => d.kind === 'missing-language')).toEqual([]);
  });

  it('records both unregistered languages as decisions, not defects', () => {
    const unreg = deviationsByKind('unregistered-language');
    expect(unreg.map((d) => `${d.app}:${d.actual}`).sort()).toEqual(['report:zh-tw', 'team:bs']);
    for (const d of unreg) {
      // No canonical answer exists yet — that IS the finding.
      expect(d.language).toBeNull();
      expect(d.required).toBeNull();
      expect(d.detail).toMatch(/decide|decision/i);
    }
  });
});

describe('the record — content divergences are kept separate', () => {
  it('covers exactly the two languages whose content disagrees', () => {
    expect(CONTENT_DIVERGENCES.map((c) => c.language).sort()).toEqual(['pt', 'zh']);
  });

  it.each(CONTENT_DIVERGENCES.map((c) => [c.language, c] as const))(
    '%s states the decision and what each app serves',
    (_lang, c) => {
      expect(isKnownCode(c.language)).toBe(true);
      // A decision, phrased as a question for a human.
      expect(c.decision).toMatch(/\?$/);
      // At least two apps, or it would not be a divergence.
      const apps = Object.keys(c.serves);
      expect(apps.length).toBeGreaterThanOrEqual(2);
      for (const app of apps) expect(APP_IDS).toContain(app);
      expect(c.detail.length).toBeGreaterThan(200);
    },
  );

  it('keeps the zh evidence that makes the bug findable', () => {
    const zh = CONTENT_DIVERGENCES.find((c) => c.language === 'zh');
    expect(zh?.serves.presenter).toMatch(/Simplified/);
    expect(zh?.serves.audience).toMatch(/Traditional/);
    // The orphaned presenter file is the clue to the whole history — losing it
    // would cost the next investigator the same afternoon it cost this one.
    expect(zh?.detail).toMatch(/ORPHANED/);
  });
});

describe('the documented shim recipe — executed, so it cannot rot', () => {
  // This is the README's "But what about the migration path?" snippet, verbatim.
  // It is the package's answer to the one real objection against a strict API,
  // so if it stops working the argument for strictness collapses with it.
  const HOST_SHIM = new Map(
    NON_COMPLIANCE.filter((d) => d.kind === 'wrong-code' || d.kind === 'legacy-alias')
      .filter((d) => d.actual !== null && d.language !== null)
      .map((d) => [(d.actual as string).toLowerCase(), d.language as string]),
  );
  const canonicalize = (hostCode: string) =>
    resolveCode(hostCode) ?? HOST_SHIM.get(hostCode.toLowerCase());

  it('canonicalizes every legacy code a non-migrated host can send', () => {
    expect(canonicalize('kr')).toBe('ko');
    expect(canonicalize('se')).toBe('sv');
    expect(canonicalize('si')).toBe('sl');
    expect(canonicalize('br')).toBe('pt');
  });

  it('passes canonical codes straight through without touching the shim', () => {
    expect(canonicalize('ko')).toBe('ko');
    expect(canonicalize('sr-latn')).toBe('sr-Latn');
    for (const code of canonicalCodes()) expect(canonicalize(code)).toBe(code);
  });

  it('still rejects genuine nonsense', () => {
    expect(canonicalize('xx')).toBeUndefined();
    expect(canonicalize('')).toBeUndefined();
  });

  it('covers every host code without the shim ever disagreeing with the registry', () => {
    // A shim entry that shadowed a canonical code would silently re-point a
    // correct code at another language.
    for (const [legacy, canonical] of HOST_SHIM) {
      expect(resolveCode(legacy), `"${legacy}" is both canonical and shimmed`).toBeUndefined();
      expect(canonicalCodes()).toContain(canonical);
    }
  });
});

describe('the record — accessors', () => {
  it('deviationsForApp partitions the record with nothing lost', () => {
    const total = APP_IDS.reduce((n, app) => n + deviationsForApp(app).length, 0);
    expect(total).toBe(NON_COMPLIANCE.length);
  });

  it('gives every app something to do (none is compliant yet)', () => {
    // When this fails, an app is fully migrated — celebrate, then delete it
    // from this assertion.
    for (const app of APP_IDS) {
      expect(deviationsForApp(app).length, `${app} has no deviations`).toBeGreaterThan(0);
    }
  });

  it('deviationsByKind partitions the record with nothing lost', () => {
    const kinds = new Set(NON_COMPLIANCE.map((d) => d.kind));
    const total = [...kinds].reduce((n, k) => n + deviationsByKind(k).length, 0);
    expect(total).toBe(NON_COMPLIANCE.length);
  });
});
