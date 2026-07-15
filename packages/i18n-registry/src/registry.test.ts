import { describe, expect, it } from 'vitest';
import { canonicalCodes, isKnownCode, resolveCode, resolveLanguage } from './registry';

/**
 * Every app-specific code in use today. The registry must reject all of them:
 * that rejection IS the migration signal. If a future change makes any of
 * these resolve, the registry has stopped being a standard and become a
 * compatibility shim — which is the exact failure these tests exist to catch.
 */
const APP_SPECIFIC_CODES = [
  'kr', // presenter/audience/report/team Korean — really Kanuri
  'se', // presenter/audience/report/team Swedish — really Northern Sami
  'si', // presenter/audience/team Slovenian — really Sinhala
  'br', // presenter/team Portuguese — really Breton
  'pt-BR', // survey Portuguese
];

describe('canonicalCodes', () => {
  it('lists every language exactly once', () => {
    const codes = canonicalCodes();
    expect(codes).toHaveLength(33);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('is the ISO-corrected set, never an app’s legacy code', () => {
    const codes = canonicalCodes();
    expect(codes).toContain('ko');
    expect(codes).toContain('sv');
    expect(codes).toContain('sl');
    expect(codes).toContain('pt');
    expect(codes).toContain('sr-Latn');
    for (const wrong of APP_SPECIFIC_CODES) {
      expect(codes).not.toContain(wrong);
    }
  });

  it('returns a fresh array each call (callers cannot corrupt the registry)', () => {
    const first = canonicalCodes();
    first.push('zz');
    expect(canonicalCodes()).not.toContain('zz');
  });
});

describe('resolveCode — canonical only', () => {
  it('REJECTS every app-specific code', () => {
    // The load-bearing assertion of the whole package. `resolveCode('kr')`
    // returning 'ko' would be a convenience that entrenches `kr` forever.
    for (const code of APP_SPECIFIC_CODES) {
      expect(resolveCode(code)).toBeUndefined();
    }
  });

  it('is an identity on canonical codes', () => {
    for (const code of canonicalCodes()) {
      expect(resolveCode(code)).toBe(code);
    }
  });

  it('normalizes CASE only, because RFC 5646 tags are case-insensitive', () => {
    // `sr-latn` is not an app dialect — it is the same tag, spelled without
    // the recommended script casing. Rejecting it would be wrong, not strict.
    expect(resolveCode('sr-latn')).toBe('sr-Latn');
    expect(resolveCode('sr-Latn')).toBe('sr-Latn');
    expect(resolveCode('SR-LATN')).toBe('sr-Latn');
    expect(resolveCode('sr-cyrl')).toBe('sr-Cyrl');
    expect(resolveCode('KO')).toBe('ko');
  });

  it('does not let case-insensitivity smuggle a wrong code back in', () => {
    expect(resolveCode('KR')).toBeUndefined();
    expect(resolveCode('SE')).toBeUndefined();
  });

  it('tolerates surrounding whitespace', () => {
    expect(resolveCode('  ko  ')).toBe('ko');
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
  it('returns the full entry for a canonical code', () => {
    const ko = resolveLanguage('ko');
    expect(ko?.code).toBe('ko');
    expect(ko?.name).toBe('Korean');
    expect(ko?.antd).toBe('ko_KR');
  });

  it('rejects app-specific codes exactly as resolveCode does', () => {
    expect(resolveLanguage('kr')).toBeUndefined();
    expect(resolveLanguage('pt-BR')).toBeUndefined();
  });

  it('exposes no app-shaped field — the standard does not model apps', () => {
    const ko = resolveLanguage('ko') as unknown as Record<string, unknown>;
    expect(ko).toBeDefined();
    // Guards the review decision behind this package: an `apps`/`aliases`/
    // `files` field is how "one standard" quietly becomes "five dialects".
    for (const banned of ['apps', 'aliases', 'files']) {
      expect(ko).not.toHaveProperty(banned);
    }
    // Four fields, no fifth. `notes` was removed deliberately — an open prose
    // field on a data type accumulates everything and duplicates the records
    // that should own it. See the README's "Where prose goes".
    expect(Object.keys(ko).sort()).toEqual(['antd', 'code', 'dayjs', 'name'].sort());
  });
});

describe('isKnownCode', () => {
  it('accepts canonical codes, in any casing', () => {
    expect(isKnownCode('en')).toBe(true);
    expect(isKnownCode('ko')).toBe(true);
    expect(isKnownCode('SR-LATN')).toBe(true);
  });

  it('is FALSE for app-specific codes — this is how an app learns to migrate', () => {
    for (const code of APP_SPECIFIC_CODES) {
      expect(isKnownCode(code)).toBe(false);
    }
  });

  it('rejects junk', () => {
    expect(isKnownCode('xx')).toBe(false);
    expect(isKnownCode(null)).toBe(false);
  });
});
