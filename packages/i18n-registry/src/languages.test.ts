/**
 * Self-consistency tests over the registry DATA.
 *
 * These are the guard rails that make the registry safe to be a single source
 * of truth for five apps: a bad code added here propagates everywhere, so the
 * data must be internally coherent before anything consumes it.
 */
import { describe, expect, it } from 'vitest';
import { LANGUAGES } from './languages';
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
  it('requires a note wherever dayjs or antd is null', () => {
    for (const lang of LANGUAGES) {
      if (lang.dayjs === null || lang.antd === null) {
        expect(
          lang.notes,
          `${lang.code} has a null dayjs/antd but no note explaining why`,
        ).toBeTruthy();
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
  it('keeps the zh and pt content questions visible in the data', () => {
    // The registry records these rather than resolving them; the detail lives
    // in CONTENT_DIVERGENCES, but the language entry must point at it so a
    // reader of LANGUAGES alone cannot miss it.
    expect(resolveLanguage('zh')?.notes).toMatch(/DO NOT "FIX"/i);
    // pt is half-resolved: product settled the CODE as `pt` (2026-07); WHICH
    // Portuguese the content is stays open. The note must carry both halves —
    // recording only the decision would let someone "finish the job" by picking
    // a dialect, and recording only the open question would let someone
    // re-litigate the code.
    const pt = resolveLanguage('pt')?.notes ?? '';
    expect(pt, 'must record that the code is settled as `pt`').toMatch(/CODE SETTLED/i);
    expect(pt, 'must keep the dialect question open').toMatch(/DIALECT OPEN/i);
    // ...and must not re-assert the dialect claim the measurements disproved:
    // the presenter is a blend, not European.
    expect(pt, 'must not call the presenter European').not.toMatch(/presenter[^.]*European/i);
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
