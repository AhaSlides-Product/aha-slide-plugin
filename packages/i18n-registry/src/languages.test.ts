/**
 * Self-consistency tests over the registry DATA.
 *
 * These are the guard rails that make the registry safe to be a single source
 * of truth for five apps: a bad code added here propagates everywhere, so the
 * data must be internally coherent before anything consumes it.
 */
import { describe, expect, it } from 'vitest';
import { LANGUAGES } from './languages';
import { type AppId, CONTENT_DIVERGENCES, NON_COMPLIANCE } from './non-compliance';
import { resolveLanguage } from './registry';

describe('registry data — required fields', () => {
  it.each(LANGUAGES.map((l) => [l.code, l] as const))(
    '%s has every required field populated',
    (_code, lang) => {
      expect(lang.code).toBeTruthy();
      expect(lang.code.trim()).toBe(lang.code);
      expect(lang.name).toBeTruthy();
      // dayjs/antd may be null (unsourced) but must never be an empty string.
      expect(lang.dayjs === null || lang.dayjs.length > 0).toBe(true);
      expect(lang.antd === null || lang.antd.length > 0).toBe(true);
    },
  );

  it('carries no app-shaped field — the standard does not model apps', () => {
    // The review decision this package turns on. An `apps`/`aliases`/`files`
    // field is how "one standard" quietly becomes "five supported dialects":
    // once the type can express "presenter says kr", kr is API forever.
    for (const lang of LANGUAGES) {
      for (const banned of ['apps', 'aliases', 'files']) {
        expect(lang, `${lang.code} must not carry "${banned}"`).not.toHaveProperty(banned);
      }
    }
  });

  it('carries no free-text field — this file is data, not a place to explain', () => {
    // `notes` existed and was removed. It was added for a good reason (stop a
    // reader "helpfully fixing" a deliberate value) and became the path of
    // least resistance for every finding anyone made: 13 of 33 entries, ~26% of
    // the file, a 20-line essay on the pt dialect — every word a second copy of
    // NON_COMPLIANCE/CONTENT_DIVERGENCES/README, already drifting from them.
    // This is the ratchet. Prose has typed homes; see the README's "Where prose
    // goes". If this fails, the copy you are about to add belongs in one of them.
    for (const lang of LANGUAGES) {
      for (const banned of ['notes', 'note', 'comment', 'description']) {
        expect(lang, `${lang.code} must not carry "${banned}" — see README "Where prose goes"`)
          .not.toHaveProperty(banned);
      }
      expect(Object.keys(lang).sort(), `${lang.code} has exactly four fields`).toEqual([
        'antd',
        'code',
        'dayjs',
        'name',
      ]);
    }
  });
});

describe('registry data — the codes are the standard, not the apps’ habits', () => {
  it('has no duplicate canonical codes', () => {
    const codes = LANGUAGES.map((l) => l.code.toLowerCase());
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('has no duplicate language names', () => {
    const names = LANGUAGES.map((l) => l.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('declares 33 languages', () => {
    // 33, not 34: the presenter's `messages` map has 34 keys because `sl` and
    // `si` both load AhaSlides_Slovenia.json. `si` is a defect, not a language.
    expect(LANGUAGES).toHaveLength(33);
  });

  it('never adopts a code that ISO 639-1 assigns to a different language', () => {
    // The four codes AhaSlides got wrong are all the ISO 3166-1 COUNTRY code
    // standing in for the ISO 639-1 LANGUAGE code — and each is itself a valid
    // code for an unrelated language, which is why nothing ever threw.
    const STOLEN = { kr: 'Kanuri', se: 'Northern Sami', si: 'Sinhala', br: 'Breton' };
    const codes = new Set(LANGUAGES.map((l) => l.code.toLowerCase()));
    for (const [code, realLanguage] of Object.entries(STOLEN)) {
      expect(codes.has(code), `"${code}" is the ISO 639-1 code for ${realLanguage}`).toBe(false);
    }
  });

  it('uses BCP-47 script-subtag casing for the script-split languages', () => {
    expect(LANGUAGES.map((l) => l.code)).toContain('sr-Latn');
    expect(LANGUAGES.map((l) => l.code)).toContain('sr-Cyrl');
  });
});

describe('registry data — unsourced values are documented, not guessed', () => {
  // This used to assert that a null carried an explanatory `notes` string. The
  // prose field is gone (see the README's "Where prose goes"), and the check is
  // stronger without it: a null is not an opinion needing a comment, it is a
  // FACT about the apps — the registry sources `dayjs` from aha-survey and
  // `antd` from aha-report/aha-survey, so a value is unsourced exactly when
  // those apps lack the language. That is already recorded, per app, as a
  // `missing-language` deviation. Tying the two together means the explanation
  // cannot go missing, cannot drift from the checklist, and names the concrete
  // work that fills the hole — none of which a free-text note gave us.
  const DAYJS_SOURCES: readonly AppId[] = ['survey'];
  const ANTD_SOURCES: readonly AppId[] = ['report', 'survey'];

  const missingIn = (app: AppId, code: string) =>
    NON_COMPLIANCE.some(
      (d) => d.app === app && d.kind === 'missing-language' && d.language === code,
    );

  it('explains every null with the missing-language entry that causes it', () => {
    for (const lang of LANGUAGES) {
      for (const [field, sources] of [
        ['dayjs', DAYJS_SOURCES],
        ['antd', ANTD_SOURCES],
      ] as const) {
        if (lang[field] !== null) continue;
        for (const app of sources) {
          expect(
            missingIn(app, lang.code),
            `${lang.code}.${field} is null, so the registry's source for it (${app}) must ` +
              `have a missing-language entry saying why nobody has chosen one`,
          ).toBe(true);
        }
      }
    }
  });

  it('has no null left unexplained once its source app has the language', () => {
    // The mirror: if every source app HAS the language, someone chose a value,
    // so a null would be an unrecorded guess-in-waiting rather than a fact.
    for (const lang of LANGUAGES) {
      for (const [field, sources] of [
        ['dayjs', DAYJS_SOURCES],
        ['antd', ANTD_SOURCES],
      ] as const) {
        const unsourceable = sources.some((app) => missingIn(app, lang.code));
        if (!unsourceable) {
          expect(
            lang[field],
            `${lang.code}.${field}: every source app has this language, so a value was ` +
              `chosen — null cannot be right`,
          ).not.toBeNull();
        }
      }
    }
  });

  it('pins the exact set of unsourced values (a new null must be deliberate)', () => {
    const nullDayjs = LANGUAGES.filter((l) => l.dayjs === null).map((l) => l.code);
    const nullAntd = LANGUAGES.filter((l) => l.antd === null).map((l) => l.code);
    // sv: no aha-survey entry, and survey is the only source of dayjs codes.
    // az: no report/survey/team entry at all.
    expect(nullDayjs.sort()).toEqual(['az', 'sv']);
    expect(nullAntd.sort()).toEqual(['az']);
  });
});

describe('registry data — known divergences stay recorded', () => {
  // These assertions used to read the `notes` prose on the language entries.
  // The questions themselves have not moved and must not be lost — only the
  // duplicate copy of them did. They live in CONTENT_DIVERGENCES, which is
  // where they were always documented; these now guard that record directly
  // rather than a restatement of it in LANGUAGES.
  const divergence = (code: string) => CONTENT_DIVERGENCES.find((c) => c.language === code);

  it('keeps the zh content question recorded, not resolved by a registry edit', () => {
    const zh = divergence('zh');
    expect(zh, 'zh divergence must exist — the code serves two languages').toBeDefined();
    // The audience app has no Simplified file, so no code reassignment fixes it.
    expect(zh?.detail).toMatch(/audience app has NO Simplified file/i);
    expect(zh?.decision, 'must stay a question for a human').toMatch(/\?$/);
  });

  it('keeps pt half-resolved: the CODE settled, the DIALECT open', () => {
    // Recording only the decision would let someone "finish the job" by picking
    // a dialect; recording only the open question would let someone re-litigate
    // the code. Both halves must survive, and they must stay distinguishable.
    const pt = divergence('pt');
    expect(pt, 'pt divergence must exist').toBeDefined();
    expect(pt?.decision, 'the code half is settled').toMatch(/CODE half is settled/i);
    expect(pt?.decision, 'the dialect half is not').toMatch(/which Portuguese|European or Brazilian/i);
    expect(pt?.detail).toMatch(/THE CODE HALF IS DECIDED, THE DIALECT IS NOT/i);
    // The `pt` code decision is settled in the checklist as an actionable
    // rename — the two records must not disagree about that.
    const survey = NON_COMPLIANCE.find(
      (d) => d.app === 'survey' && d.kind === 'wrong-code' && d.actual === 'pt-BR',
    );
    expect(survey?.required, 'the settled code').toBe('pt');
    expect(survey?.blockedBy, 'the code question no longer blocks it').toBeUndefined();
  });

  it('never re-asserts that the presenter serves European Portuguese', () => {
    // The claim an earlier round got wrong and the measurements disproved: the
    // presenter's file is a BLEND (ficheiro x34 AND arquivo x19). It points
    // European by LABEL only, which is exactly why "just follow the presenter"
    // cannot settle the dialect. Guard the classification, not the word:
    // `serves.presenter` legitimately mentions the European *label*.
    const pt = divergence('pt');
    expect(pt?.serves.presenter, 'the presenter file is a blend').toMatch(/BLEND/i);
    expect(pt?.detail, 'the tiebreak must stay refuted').toMatch(
      /presenter has no single dialect to follow/i,
    );
  });

  it('preserves the deliberate antd gaps rather than "fixing" them', () => {
    // Albanian: antd ships no pack — en_US built-ins on purpose.
    expect(resolveLanguage('sq')?.antd).toBe('en_US');
    // Serbian Cyrillic borrows the Latin-script pack — the only Serbian antd has.
    expect(resolveLanguage('sr-Cyrl')?.antd).toBe('sr_RS');
    expect(resolveLanguage('sr-Latn')?.antd).toBe('sr_RS');
  });

  it('keeps Norwegian on the macrolanguage code with Bokmål tooling', () => {
    // `no` is a valid ISO 639-1 code, so unlike kr/se it stays. dayjs/antd have
    // no bare `no` — the nb/nb_NO pairing is correct, not a mistake to "fix".
    expect(resolveLanguage('no')?.dayjs).toBe('nb');
    expect(resolveLanguage('no')?.antd).toBe('nb_NO');
  });
});
