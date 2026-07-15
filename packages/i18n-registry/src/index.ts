/**
 * `@aha/i18n-registry` — the canonical AhaSlides language registry.
 *
 * Published as `@ahaslides-product/plugins-i18n-registry`.
 *
 * ONE shared declaration of which languages AhaSlides has and what each locale
 * code means, so the five apps that each hand-mirror the presenter's language
 * list stop drifting apart. It is DATA: no i18n library, no runtime deps, no
 * translated strings.
 *
 * @example
 * import { resolveCode, codeForApp, canonicalCodes } from '@aha/i18n-registry';
 *
 * resolveCode('kr');             // 'ko'  — presenter's non-ISO code for Korean
 * codeForApp('ko', 'presenter'); // 'kr'  — back to what the presenter expects
 * canonicalCodes().length;       // 33
 */
export { LANGUAGES } from './languages.js';
export {
  canonicalCodes,
  codeForApp,
  getLanguage,
  isKnownCode,
  languagesForApp,
  resolveCode,
  resolveLanguage,
} from './registry.js';
export { APP_IDS } from './types.js';
export type { AppCodes, AppId, LanguageEntry, LanguageFiles } from './types.js';
