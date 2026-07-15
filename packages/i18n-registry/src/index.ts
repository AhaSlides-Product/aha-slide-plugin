/**
 * `@aha/i18n-registry` — the canonical AhaSlides language registry.
 *
 * Published as `@ahaslides-product/i18n-registry`.
 *
 * ONE shared declaration of which languages AhaSlides has and what the single
 * correct code for each one is, so the five apps that each hand-mirror the
 * presenter's language list stop drifting apart. It is DATA: no i18n library,
 * no runtime deps, no translated strings.
 *
 * ## The API speaks canonical codes only
 *
 * The registry declares ONE standard. It does not accept, return, or translate
 * to any app's dialect — `resolveCode('kr')` is `undefined`, not `'ko'`. Every
 * place an app disagrees with the standard today is recorded as a defect in
 * {@link NON_COMPLIANCE}, which is a migration checklist, not a mapping. See
 * the README for why, and for the one legitimate way to adapt legacy host
 * input at a boundary.
 *
 * @example
 * import { resolveCode, isKnownCode, canonicalCodes } from '@aha/i18n-registry';
 *
 * resolveCode('ko');       // 'ko'
 * resolveCode('sr-latn');  // 'sr-Latn' — same tag, canonical casing (RFC 5646)
 * resolveCode('kr');       // undefined — 'kr' is Kanuri; Korean is 'ko'
 * isKnownCode('kr');       // false     — so an integrating app learns to migrate
 * canonicalCodes().length; // 33
 *
 * @example
 * // What does aha-report have to change?
 * import { deviationsForApp } from '@aha/i18n-registry';
 * deviationsForApp('report');
 */
export { LANGUAGES } from './languages.js';
export { canonicalCodes, isKnownCode, resolveCode, resolveLanguage } from './registry.js';
export type { LanguageEntry } from './types.js';

export {
  APP_IDS,
  CONTENT_DIVERGENCES,
  NON_COMPLIANCE,
  deviationsByKind,
  deviationsForApp,
} from './non-compliance.js';
export type { AppId, ContentDivergence, Deviation, DeviationKind } from './non-compliance.js';
