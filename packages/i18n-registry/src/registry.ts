import { LANGUAGES } from './languages.js';
import type { AppId, LanguageEntry } from './types.js';

/**
 * Lookup index: every canonical code AND every alias, lowercased, -> entry.
 *
 * Lowercased on purpose. The apps disagree on casing for the script-subtagged
 * codes (`sr-latn` in presenter/audience/report/team vs `sr-Latn` in survey),
 * so a case-sensitive lookup would fail to round-trip exactly the codes this
 * registry exists to reconcile.
 */
const INDEX: ReadonlyMap<string, LanguageEntry> = (() => {
  const map = new Map<string, LanguageEntry>();
  for (const lang of LANGUAGES) {
    map.set(lang.code.toLowerCase(), lang);
    for (const alias of lang.aliases) map.set(alias.toLowerCase(), lang);
  }
  return map;
})();

/**
 * Every canonical language code, in registry order.
 *
 * @example
 * canonicalCodes(); // ['en', 'vi', 'es', 'pt', ...]
 */
export function canonicalCodes(): string[] {
  return LANGUAGES.map((lang) => lang.code);
}

/**
 * Resolve any code an AhaSlides app uses — canonical or alias, any casing —
 * to its full registry entry.
 *
 * @returns the entry, or `undefined` if the code is not an AhaSlides language.
 *
 * @example
 * resolveLanguage('kr')?.code;      // 'ko'   (presenter's non-ISO Korean)
 * resolveLanguage('sr-latn')?.code; // 'sr-Latn'
 * resolveLanguage('xx');            // undefined
 */
export function resolveLanguage(code: string | null | undefined): LanguageEntry | undefined {
  if (typeof code !== 'string') return undefined;
  return INDEX.get(code.trim().toLowerCase());
}

/**
 * Resolve any app-specific code to its canonical code.
 *
 * @returns the canonical code, or `undefined` if unknown. Callers that need a
 *   fallback should apply their own (`resolveCode(x) ?? 'en'`) — this function
 *   never silently invents `en`, so "unknown language" stays distinguishable
 *   from "actually English".
 *
 * @example
 * resolveCode('kr'); // 'ko'
 * resolveCode('si'); // 'sl'  (legacy Slovenian alias)
 * resolveCode('br'); // 'pt'
 */
export function resolveCode(code: string | null | undefined): string | undefined {
  return resolveLanguage(code)?.code;
}

/**
 * Look up a language by its canonical code only. Aliases are NOT accepted —
 * use {@link resolveLanguage} for those.
 */
export function getLanguage(canonicalCode: string): LanguageEntry | undefined {
  const entry = resolveLanguage(canonicalCode);
  return entry && entry.code.toLowerCase() === canonicalCode.trim().toLowerCase()
    ? entry
    : undefined;
}

/**
 * Translate any code into the code a given app uses for that language.
 *
 * @returns the app's code, or `null` when the app does not support the
 *   language, or `undefined` when the input is not an AhaSlides language.
 *
 * @example
 * codeForApp('ko', 'presenter'); // 'kr'
 * codeForApp('kr', 'survey');    // 'ko'
 * codeForApp('az', 'survey');    // null      (survey has no Azerbaijani)
 * codeForApp('xx', 'survey');    // undefined
 */
export function codeForApp(
  code: string | null | undefined,
  app: AppId,
): string | null | undefined {
  const entry = resolveLanguage(code);
  return entry ? entry.apps[app] : undefined;
}

/** Every registry language that the given app supports today. */
export function languagesForApp(app: AppId): LanguageEntry[] {
  return LANGUAGES.filter((lang) => lang.apps[app] !== null);
}

/**
 * Whether a code — canonical or alias, any casing — is a known AhaSlides
 * language.
 */
export function isKnownCode(code: string | null | undefined): boolean {
  return resolveLanguage(code) !== undefined;
}
