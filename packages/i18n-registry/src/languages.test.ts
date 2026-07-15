/**
 * Self-consistency tests over the registry DATA.
 *
 * These are the guard rails that make the registry safe to be a single source
 * of truth for five apps: a bad code added here propagates everywhere, so the
 * data must be internally coherent before anything consumes it.
 */
import { describe, expect, it } from 'vitest';
import { LANGUAGES } from './languages';
import { resolveCode, resolveLanguage } from './registry';
import { APP_IDS } from './types';

describe('registry data — required fields', () => {
  it.each(LANGUAGES.map((l) => [l.code, l] as const))(
    '%s has every required field populated',
    (_code, lang) => {
      expect(lang.code).toBeTruthy();
      expect(lang.code.trim()).toBe(lang.code);
      expect(lang.name).toBeTruthy();
      expect(Array.isArray(lang.aliases)).toBe(true);
      expect(lang.files).toBeDefined();
      // Every registry language is served by both CDN apps.
      expect(lang.files.presenter).toBeTruthy();
      expect(lang.files.audience).toBeTruthy();
      // dayjs/antd may be null (unsourced) but must never be an empty string.
      expect(lang.dayjs === null || lang.dayjs.length > 0).toBe(true);
      expect(lang.antd === null || lang.antd.length > 0).toBe(true);
    },
  );

  it('gives every app an explicit code or an explicit null', () => {
    for (const lang of LANGUAGES) {
      for (const app of APP_IDS) {
        expect(lang.apps, `${lang.code}.apps missing "${app}"`).toHaveProperty(app);
        const code = lang.apps[app];
        expect(code === null || (typeof code === 'string' && code.length > 0)).toBe(true);
      }
    }
  });

  it('serves bundle filenames in the AhaSlides_*.json convention', () => {
    for (const lang of LANGUAGES) {
      expect(lang.files.presenter).toMatch(/^AhaSlides_.+\.json$/);
      expect(lang.files.audience).toMatch(/^AhaSlides_.+\.json$/);
    }
  });
});

describe('registry data — uniqueness', () => {
  it('has no duplicate canonical codes', () => {
    const codes = LANGUAGES.map((l) => l.code.toLowerCase());
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('has no duplicate language names', () => {
    const names = LANGUAGES.map((l) => l.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('never lets an alias collide with a different language’s canonical code', () => {
    const canonical = new Map(LANGUAGES.map((l) => [l.code.toLowerCase(), l.code]));
    for (const lang of LANGUAGES) {
      for (const alias of lang.aliases) {
        const owner = canonical.get(alias.toLowerCase());
        expect(
          owner === undefined || owner === lang.code,
          `alias "${alias}" of ${lang.code} collides with canonical "${owner}"`,
        ).toBe(true);
      }
    }
  });

  it('never lets two languages claim the same alias', () => {
    const seen = new Map<string, string>();
    for (const lang of LANGUAGES) {
      for (const alias of lang.aliases) {
        const key = alias.toLowerCase();
        const prev = seen.get(key);
        expect(prev, `alias "${alias}" claimed by both ${prev} and ${lang.code}`).toBeUndefined();
        seen.set(key, lang.code);
      }
    }
  });

  it('never lists a language’s own canonical code as its alias', () => {
    for (const lang of LANGUAGES) {
      const aliases = lang.aliases.map((a) => a.toLowerCase());
      expect(aliases).not.toContain(lang.code.toLowerCase());
    }
  });

  it('has no duplicate aliases within one language', () => {
    for (const lang of LANGUAGES) {
      const aliases = lang.aliases.map((a) => a.toLowerCase());
      expect(new Set(aliases).size).toBe(aliases.length);
    }
  });
});

describe('registry data — round-tripping (the core contract)', () => {
  it('resolves every code any app uses today back to its language', () => {
    for (const lang of LANGUAGES) {
      for (const app of APP_IDS) {
        const appCode = lang.apps[app];
        if (appCode === null) continue;
        expect(
          resolveCode(appCode),
          `${app}'s "${appCode}" must resolve to ${lang.code}`,
        ).toBe(lang.code);
      }
    }
  });

  it('declares every non-canonical app code as an alias', () => {
    for (const lang of LANGUAGES) {
      const known = new Set([lang.code.toLowerCase(), ...lang.aliases.map((a) => a.toLowerCase())]);
      for (const app of APP_IDS) {
        const appCode = lang.apps[app];
        if (appCode === null) continue;
        expect(
          known.has(appCode.toLowerCase()),
          `${app}'s "${appCode}" for ${lang.code} is not the canonical code nor a declared alias`,
        ).toBe(true);
      }
    }
  });

  it('backs every declared alias with a real app usage', () => {
    // An alias that no app uses is dead weight — it would quietly outlive the
    // code that justified it. Two aliases are legitimately no app's PRIMARY
    // code (`apps` records primaries) but are still accepted input:
    //   br — presenter rewrites br -> pt at load time (index.js) and lists it
    //        in constant/locale.js; team-management ships a `br` bundle dir.
    //   si — presenter/audience/team accept si alongside sl, both loading the
    //        Slovenian bundle; survey maps si -> sl.
    // Both are asserted individually below, so this exemption cannot hide a
    // genuinely dead alias.
    const ACCEPTED_BUT_NOT_PRIMARY = new Set(['br', 'si']);
    for (const lang of LANGUAGES) {
      for (const alias of lang.aliases) {
        if (ACCEPTED_BUT_NOT_PRIMARY.has(alias.toLowerCase())) continue;
        const used = APP_IDS.some((app) => lang.apps[app]?.toLowerCase() === alias.toLowerCase());
        expect(used, `alias "${alias}" of ${lang.code} is used by no app`).toBe(true);
      }
    }
  });

  it('resolves the two legacy accepted-input codes that are no app’s primary', () => {
    expect(resolveCode('br')).toBe('pt');
    expect(resolveCode('si')).toBe('sl');
    // They must never become a primary code by accident.
    for (const app of APP_IDS) {
      expect(resolveLanguage('pt')?.apps[app]).not.toBe('br');
      expect(resolveLanguage('sl')?.apps[app]).not.toBe('si');
    }
  });

  it('resolves every alias to its own language', () => {
    for (const lang of LANGUAGES) {
      for (const alias of lang.aliases) {
        expect(resolveCode(alias)).toBe(lang.code);
      }
    }
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
  it('keeps the zh Simplified/Traditional split visible', () => {
    const zh = resolveLanguage('zh');
    expect(zh?.files.presenter).toContain('Simplified');
    expect(zh?.files.audience).toContain('Traditional');
    expect(zh?.files.presenter).not.toBe(zh?.files.audience);
  });

  it('keeps the per-app filename divergences visible', () => {
    const differing = LANGUAGES.filter((l) => l.files.presenter !== l.files.audience).map(
      (l) => l.code,
    );
    // zh (Simplified vs Traditional — a real bug, filed separately),
    // pt (Portuguese vs Portuguese_BR), sk (Slovakia vs Slovak — cosmetic).
    expect(differing.sort()).toEqual(['pt', 'sk', 'zh']);
    for (const code of differing) {
      expect(resolveLanguage(code)?.notes, `${code} divergence must carry a note`).toBeTruthy();
    }
  });

  it('preserves the deliberate antd gaps rather than "fixing" them', () => {
    // Albanian: antd ships no pack — en_US built-ins on purpose.
    expect(resolveLanguage('sq')?.antd).toBe('en_US');
    // Serbian Cyrillic borrows the Latin-script pack — the only Serbian antd has.
    expect(resolveLanguage('sr-Cyrl')?.antd).toBe('sr_RS');
    expect(resolveLanguage('sr-Latn')?.antd).toBe('sr_RS');
  });
});
