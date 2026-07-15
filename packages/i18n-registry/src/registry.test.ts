import { describe, expect, it } from 'vitest';
import {
  canonicalCodes,
  codeForApp,
  getLanguage,
  isKnownCode,
  languagesForApp,
  resolveCode,
  resolveLanguage,
} from './registry';

describe('canonicalCodes', () => {
  it('lists every language exactly once', () => {
    const codes = canonicalCodes();
    expect(codes).toHaveLength(33);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('includes the ISO-corrected canonicals, not the apps’ legacy codes', () => {
    const codes = canonicalCodes();
    expect(codes).toContain('ko');
    expect(codes).toContain('sv');
    expect(codes).toContain('sl');
    expect(codes).toContain('pt');
    expect(codes).toContain('sr-Latn');
    // The legacy/wrong codes are aliases, never canonical.
    for (const wrong of ['kr', 'se', 'si', 'br', 'sr-latn', 'pt-BR']) {
      expect(codes).not.toContain(wrong);
    }
  });

  it('returns a fresh array each call (callers cannot corrupt the registry)', () => {
    const first = canonicalCodes();
    first.push('zz');
    expect(canonicalCodes()).not.toContain('zz');
  });
});

describe('resolveCode', () => {
  it('maps each app’s legacy code to the canonical one', () => {
    expect(resolveCode('kr')).toBe('ko'); // presenter/audience/report/team Korean
    expect(resolveCode('se')).toBe('sv'); // "Swedish" (se is really Northern Sami)
    expect(resolveCode('si')).toBe('sl'); // legacy Slovenian alias
    expect(resolveCode('br')).toBe('pt'); // legacy Portuguese alias
    expect(resolveCode('pt-BR')).toBe('pt'); // survey Portuguese
  });

  it('is an identity on canonical codes', () => {
    for (const code of canonicalCodes()) {
      expect(resolveCode(code)).toBe(code);
    }
  });

  it('is case-insensitive, reconciling sr-latn / sr-Latn', () => {
    expect(resolveCode('sr-latn')).toBe('sr-Latn');
    expect(resolveCode('sr-Latn')).toBe('sr-Latn');
    expect(resolveCode('SR-LATN')).toBe('sr-Latn');
    expect(resolveCode('sr-cyrl')).toBe('sr-Cyrl');
    expect(resolveCode('sr-Cyrl')).toBe('sr-Cyrl');
    expect(resolveCode('KR')).toBe('ko');
  });

  it('tolerates surrounding whitespace', () => {
    expect(resolveCode('  kr  ')).toBe('ko');
  });

  it('returns undefined for unknown codes rather than silently falling back to en', () => {
    expect(resolveCode('xx')).toBeUndefined();
    expect(resolveCode('')).toBeUndefined();
    expect(resolveCode(null)).toBeUndefined();
    expect(resolveCode(undefined)).toBeUndefined();
    // Codes that exist in exactly one consumer are NOT registry languages.
    expect(resolveCode('zh-tw')).toBeUndefined(); // aha-report only
    expect(resolveCode('bs')).toBeUndefined(); // aha-team-management only
  });

  it('does not treat a non-string as a code', () => {
    expect(resolveCode(42 as unknown as string)).toBeUndefined();
    expect(resolveCode({} as unknown as string)).toBeUndefined();
  });
});

describe('resolveLanguage', () => {
  it('returns the full entry for an alias', () => {
    const ko = resolveLanguage('kr');
    expect(ko?.code).toBe('ko');
    expect(ko?.name).toBe('Korean');
    expect(ko?.apps.presenter).toBe('kr');
    expect(ko?.apps.survey).toBe('ko');
  });

  it('records the zh divergence rather than resolving it', () => {
    const zh = resolveLanguage('zh');
    expect(zh?.files.presenter).toBe('AhaSlides_Simplified_Chinese.json');
    expect(zh?.files.audience).toBe('AhaSlides_Traditional_Chinese.json');
    expect(zh?.notes).toMatch(/DO NOT "FIX"/i);
  });
});

describe('getLanguage', () => {
  it('accepts canonical codes only', () => {
    expect(getLanguage('ko')?.name).toBe('Korean');
    expect(getLanguage('kr')).toBeUndefined(); // alias — use resolveLanguage
    expect(getLanguage('sr-Latn')?.name).toBe('Serbian (Latin)');
  });
});

describe('codeForApp', () => {
  it('round-trips a canonical code into each app’s own vocabulary', () => {
    expect(codeForApp('ko', 'presenter')).toBe('kr');
    expect(codeForApp('ko', 'survey')).toBe('ko');
    expect(codeForApp('sv', 'report')).toBe('se');
    expect(codeForApp('pt', 'survey')).toBe('pt-BR');
    expect(codeForApp('sr-Latn', 'team')).toBe('sr-latn');
  });

  it('translates directly between two apps’ codes', () => {
    // The presenter says 'kr'; what does the survey call it?
    expect(codeForApp('kr', 'survey')).toBe('ko');
    // The survey says 'pt-BR'; what does the presenter call it?
    expect(codeForApp('pt-BR', 'presenter')).toBe('pt');
  });

  it('returns null — not a guess — where an app lacks the language', () => {
    expect(codeForApp('az', 'report')).toBeNull();
    expect(codeForApp('az', 'survey')).toBeNull();
    expect(codeForApp('az', 'team')).toBeNull();
    expect(codeForApp('sv', 'survey')).toBeNull();
  });

  it('distinguishes "unsupported" (null) from "unknown" (undefined)', () => {
    expect(codeForApp('az', 'survey')).toBeNull();
    expect(codeForApp('xx', 'survey')).toBeUndefined();
  });
});

describe('languagesForApp', () => {
  it('reports the per-app language counts, drift included', () => {
    // Presenter + audience are the authority: all 33.
    expect(languagesForApp('presenter')).toHaveLength(33);
    expect(languagesForApp('audience')).toHaveLength(33);
    // The mirrors have fallen behind — this is the drift L0 exists to expose.
    expect(languagesForApp('report')).toHaveLength(32); // no az
    expect(languagesForApp('survey')).toHaveLength(31); // no az, no sv
    expect(languagesForApp('team')).toHaveLength(32); // no az
  });

  it('excludes exactly the languages an app is missing', () => {
    const missing = (app: 'report' | 'survey' | 'team') => {
      const have = new Set(languagesForApp(app).map((l) => l.code));
      return canonicalCodes().filter((c) => !have.has(c));
    };
    expect(missing('report')).toEqual(['az']);
    expect(missing('team')).toEqual(['az']);
    expect(missing('survey')).toEqual(['sv', 'az']);
  });
});

describe('isKnownCode', () => {
  it('accepts canonical codes and aliases, rejects everything else', () => {
    expect(isKnownCode('en')).toBe(true);
    expect(isKnownCode('kr')).toBe(true);
    expect(isKnownCode('SR-LATN')).toBe(true);
    expect(isKnownCode('xx')).toBe(false);
    expect(isKnownCode(null)).toBe(false);
  });
});
