import { LANGUAGES } from './languages.js';
import type { LanguageEntry } from './types.js';

/**
 * Lookup index: canonical codes ONLY, lowercased.
 *
 * Lowercased because RFC 5646 §2.1.1 makes language-tag case insignificant:
 * `sr-latn` and `sr-Latn` are the same tag, so a case-sensitive index would
 * reject a spelling that is objectively correct. That is the ONLY latitude
 * here — no alias, legacy, or app-specific code is in this map. `kr` is not a
 * misspelling of `ko`; it is a different tag (Kanuri), and it does not resolve.
 */
const INDEX: ReadonlyMap<string, LanguageEntry> = (() => {
  const map = new Map<string, LanguageEntry>();
  for (const lang of LANGUAGES) map.set(lang.code.toLowerCase(), lang);
  return map;
})();

/**
 * Every canonical language code, in registry order.
 *
 * @example
 * canonicalCodes(); // ['en', 'vi', 'es', 'pt', ...]  (33 codes)
 */
export function canonicalCodes(): string[] {
  return LANGUAGES.map((lang) => lang.code);
}

/**
 * Resolve a CANONICAL code to its registry entry.
 *
 * Canonical only, by design. An app-specific code does not resolve — see the
 * README's "Why the API is canonical-only" for the reasoning, and
 * `./non-compliance.js` for how to build a boundary shim from the deviation
 * record if you must adapt untrusted host input.
 *
 * @returns the entry, or `undefined` if the code is not a canonical AhaSlides
 *   language code. `undefined` is also what a *legacy* code gets — that is the
 *   point: it is how an integrating app discovers it must migrate.
 *
 * @example
 * resolveLanguage('ko')?.name;      // 'Korean'
 * resolveLanguage('sr-latn')?.code; // 'sr-Latn'  (same tag, RFC 5646 casing)
 * resolveLanguage('kr');            // undefined  ('kr' is Kanuri, not Korean)
 * resolveLanguage('xx');            // undefined
 */
export function resolveLanguage(code: string | null | undefined): LanguageEntry | undefined {
  if (typeof code !== 'string') return undefined;
  return INDEX.get(code.trim().toLowerCase());
}

/**
 * Normalize a canonical code to its exact registry spelling.
 *
 * This handles CASING only (`sr-latn` -> `sr-Latn`). It is not a translation
 * layer and will never turn `kr` into `ko`.
 *
 * @returns the canonical code, or `undefined` if unknown. Callers that need a
 *   fallback must apply their own (`resolveCode(x) ?? 'en'`) — this function
 *   never silently invents `en`, so "unknown language" stays distinguishable
 *   from "actually English".
 *
 * @example
 * resolveCode('ko');       // 'ko'
 * resolveCode('sr-latn');  // 'sr-Latn'
 * resolveCode('kr');       // undefined
 * resolveCode('si');       // undefined  ('si' is Sinhala, not Slovenian)
 */
export function resolveCode(code: string | null | undefined): string | undefined {
  return resolveLanguage(code)?.code;
}

/**
 * Whether a code is a canonical AhaSlides language code.
 *
 * Deliberately FALSE for every app-specific code in use today
 * (`isKnownCode('kr') === false`). A validator that green-lit `kr` would let
 * an integrating app keep shipping `kr` forever — which is exactly the drift
 * this package exists to end.
 *
 * @example
 * isKnownCode('ko');      // true
 * isKnownCode('sr-Latn'); // true
 * isKnownCode('kr');      // false — migrate to 'ko'
 */
export function isKnownCode(code: string | null | undefined): boolean {
  return resolveLanguage(code) !== undefined;
}
