/**
 * THE MIGRATION CHECKLIST — every way an AhaSlides app currently violates the
 * canonical registry, and what it must become.
 *
 * ## Read this before you use it
 *
 * This is a record of DEFECTS, not a supported mapping. It exists so that a
 * human can open one ticket per app without re-deriving anything, and so that
 * the list visibly shrinks to nothing as the apps migrate. Every entry here is
 * something that should stop being true.
 *
 * It is deliberately NOT an API for speaking an app's dialect at runtime. The
 * registry has one standard; `resolveCode('kr')` returns `undefined` and
 * always will. If the registry shipped a supported `codeForApp('ko',
 * 'presenter') -> 'kr'`, then `kr` would work forever, nobody would ever
 * migrate, and the drift this package exists to end would be blessed as
 * permanent API instead.
 *
 * ## The one legitimate runtime use
 *
 * An app that receives a locale code from a NON-MIGRATED host (today: any code
 * arriving over zoid `xprops.locale` from presenter/audience/report/team) has
 * to translate it at that boundary. Build the shim from this record rather
 * than hand-rolling a map — same single source of truth, but typed as
 * temporary:
 *
 * ```ts
 * import { NON_COMPLIANCE } from '@aha/i18n-registry';
 *
 * // legacy host code -> canonical. Shrinks to {} as apps migrate.
 * const HOST_SHIM = new Map(
 *   NON_COMPLIANCE
 *     .filter((d) => d.kind === 'wrong-code' || d.kind === 'legacy-alias')
 *     .filter((d) => d.actual !== null && d.language !== null)
 *     .map((d) => [(d.actual as string).toLowerCase(), d.language as string]),
 * );
 *
 * const canonical = resolveCode(hostCode) ?? HOST_SHIM.get(hostCode.toLowerCase());
 * ```
 *
 * That recipe is executed by this package's own tests, so it cannot rot.
 *
 * Keep that shim at the boundary where untrusted input arrives, never in
 * shared code. `aha-survey` already does exactly this in
 * `frontend/src/i18n/localeMapping.ts` — see the `compat-shim` entries below,
 * which are the cleanup that proves the migration finished.
 *
 * SOURCES — every claim re-verified against `origin/staging` on 2026-07-15 by
 * reading each app's own `messages` / `loaders` / `supportedLngs` / `SUPPORTED`
 * map. Filenames and language sets were NOT inferred from directory listings.
 */

/** The apps that ship a language list today. */
export type AppId = 'presenter' | 'audience' | 'report' | 'survey' | 'team';

/** Every {@link AppId}, in a stable order. */
export const APP_IDS: readonly AppId[] = ['presenter', 'audience', 'report', 'survey', 'team'];

/**
 * What kind of violation an entry records. Roughly in triage order — a
 * `wrong-code` silently mis-renders plurals and dates today; a `filename` is
 * cosmetic.
 */
export type DeviationKind =
  /**
   * The app codes a registry language as something other than its canonical
   * code, and must migrate. Usually the worst kind — `kr`/`se` are a DIFFERENT
   * language's valid ISO 639-1 code, so nothing errors and `Intl`/i18next
   * silently apply the wrong language's plural and date rules.
   *
   * Not always an ISO collision, though: aha-survey's `pt-BR` is a perfectly
   * valid tag naming the dialect it really ships. It is wrong here only because
   * AhaSlides ships ONE Portuguese and its code is `pt`. That entry renames a
   * code; it does not touch content.
   */
  | 'wrong-code'
  /**
   * The app additionally accepts a non-canonical code for a language it
   * otherwise codes correctly. Must be dropped.
   */
  | 'legacy-alias'
  /**
   * Code that exists ONLY to absorb another app's non-compliance. Not the
   * app's own defect — it is the cleanup that becomes possible once the hosts
   * named in `blockedBy` have migrated.
   */
  | 'compat-shim'
  /**
   * Right tag, non-canonical BCP-47 casing. Per RFC 5646 §2.1.1 this is the
   * same tag, so it is a style deviation and the registry still resolves it.
   */
  | 'casing'
  /** The app has no entry for a registry language, and silently renders English. */
  | 'missing-language'
  /**
   * The app ships a language the registry does not declare. Needs a decision:
   * adopt it into the registry, or drop it from the app.
   */
  | 'unregistered-language'
  /** The two CDN-served apps ship the same language under different filenames. */
  | 'filename';

/** One thing one app must change to comply with the registry. */
export interface Deviation {
  /** The app that must change. */
  readonly app: AppId;

  readonly kind: DeviationKind;

  /**
   * The canonical code of the affected language, or `null` for
   * `unregistered-language` — where the whole point is that no canonical code
   * exists yet.
   */
  readonly language: string | null;

  /**
   * What the app has today — a BARE value, never prose, so this field is
   * machine-readable. `kind` says how to read it:
   *
   * - `wrong-code`, `legacy-alias`, `compat-shim`, `casing`,
   *   `unregistered-language` — the locale code (`'kr'`, `'sr-latn'`).
   * - `filename` — the bundle filename.
   * - `missing-language` — `null`. Having nothing is the defect.
   *
   * Context ("it is an extra key in `messages`", "it is an entry in
   * SUPPORTED") belongs in {@link Deviation.detail}, not here. Keeping this
   * bare is what lets a boundary shim be built from the record — see the
   * module docs.
   */
  readonly actual: string | null;

  /**
   * What it must become — same bare-value rule and same per-`kind` reading as
   * {@link Deviation.actual}.
   *
   * `null` where there is nothing to adopt: `legacy-alias` and `compat-shim`
   * are fixed by DELETING the code, and `unregistered-language` has no
   * canonical answer until someone decides one. The action in those cases is
   * in {@link Deviation.detail}.
   */
  readonly required: string | null;

  /** Repo + file to edit. Where the ticket starts. */
  readonly source: string;

  /** Why it matters, and anything that would bite whoever fixes it. */
  readonly detail: string;

  /** Present when this cannot be actioned until something else lands. */
  readonly blockedBy?: string;
}

/**
 * A language whose CONTENT genuinely disagrees across apps — the same code
 * serves different material. Not a code-style problem and not fixable by any
 * registry edit: each needs a product decision and then a content change.
 *
 * Kept separate from {@link Deviation} because there is no single app "at
 * fault" and no mechanical fix — filing these as per-app code deviations would
 * imply someone can just rename a file.
 */
export interface ContentDivergence {
  /** The canonical code under which the apps disagree. */
  readonly language: string;

  /** What each app actually serves today. */
  readonly serves: Readonly<Partial<Record<AppId, string>>>;

  /** The question a human must answer before anyone writes code. */
  readonly decision: string;

  /** Everything known, so the ticket needs no re-investigation. */
  readonly detail: string;
}

const PRESENTER_MESSAGES = 'stpancras-presenter-app src/utils/language/index.js (`messages`)';
const AUDIENCE_MESSAGES = 'stpancras-audience-app src/utils/language/index.js (`messages`)';
const REPORT_LOADERS = 'aha-report src/utils/language.ts (`loaders`)';
const SURVEY_MAPPING = 'aha-survey frontend/src/i18n/localeMapping.ts (`SUPPORTED`)';
const TEAM_SUPPORTED = 'aha-team-management packages/frontend/src/i18n/index.ts (`supportedLngs`)';

const ISO_COLLISION =
  'All four of AhaSlides\' bad codes are the same mistake: the ISO 3166-1 COUNTRY code ' +
  'used where an ISO 639-1 LANGUAGE code belongs. Each one is a valid code for a real, ' +
  'different language, so nothing ever throws.';

/**
 * THE CHECKLIST. Every entry is a defect to be fixed; this array should shrink
 * to `[]`.
 *
 * @example
 * // What does aha-report have to do?
 * deviationsForApp('report');
 *
 * // What is actively mis-rendering in production right now?
 * deviationsByKind('wrong-code');
 */
export const NON_COMPLIANCE: readonly Deviation[] = [
  // ---------------------------------------------------------------- ko / kr
  {
    app: 'presenter',
    kind: 'wrong-code',
    language: 'ko',
    actual: 'kr',
    required: 'ko',
    source: PRESENTER_MESSAGES,
    detail:
      `\`kr\` is the ISO 3166-1 country code for South Korea and the ISO 639-1 code for ` +
      `KANURI, a Nilo-Saharan language of the Lake Chad basin. ${ISO_COLLISION} The ` +
      `presenter is the origin of this code — it is the host that sends it to every ` +
      `embedded app over zoid \`xprops.locale\`, so nothing downstream can migrate ` +
      `cleanly until this does. Also allowlisted in src/constant/locale.js.`,
  },
  {
    app: 'audience',
    kind: 'wrong-code',
    language: 'ko',
    actual: 'kr',
    required: 'ko',
    source: AUDIENCE_MESSAGES,
    detail: 'Mirrors the presenter. `kr` is Kanuri; Korean is `ko`.',
  },
  {
    app: 'report',
    kind: 'wrong-code',
    language: 'ko',
    actual: 'kr',
    required: 'ko',
    source: REPORT_LOADERS,
    detail:
      'Two edits, not one: the `loaders` key AND the locale file `src/locales/kr.json` ' +
      '(rename to `ko.json`). Note `antdLocaleLoaders` already maps its `kr` key to the ' +
      'CORRECT `ko_KR` antd pack — the wrong code is right next to the right one.',
  },
  {
    app: 'team',
    kind: 'wrong-code',
    language: 'ko',
    actual: 'kr',
    required: 'ko',
    source: TEAM_SUPPORTED,
    detail:
      'Two edits: the `supportedLngs` entry AND the resource directory ' +
      '`packages/frontend/src/locales/kr/` (rename to `ko/`), which is loaded by ' +
      'dynamic import keyed on the locale code.',
  },

  // ---------------------------------------------------------------- sv / se
  {
    app: 'presenter',
    kind: 'wrong-code',
    language: 'sv',
    actual: 'se',
    required: 'sv',
    source: PRESENTER_MESSAGES,
    detail:
      '`se` is the ISO 3166-1 country code for Sweden and the ISO 639-1 code for ' +
      'NORTHERN SAMI — a genuinely different language spoken in northern Sweden, which ' +
      'makes this the most plausible-looking and most wrong of the four. Swedish is `sv`.',
  },
  {
    app: 'audience',
    kind: 'wrong-code',
    language: 'sv',
    actual: 'se',
    required: 'sv',
    source: AUDIENCE_MESSAGES,
    detail: 'Mirrors the presenter. `se` is Northern Sami; Swedish is `sv`.',
  },
  {
    app: 'report',
    kind: 'wrong-code',
    language: 'sv',
    actual: 'se',
    required: 'sv',
    source: REPORT_LOADERS,
    detail: 'Also rename the locale file `src/locales/se.json` -> `sv.json`.',
  },
  {
    app: 'team',
    kind: 'wrong-code',
    language: 'sv',
    actual: 'se',
    required: 'sv',
    source: TEAM_SUPPORTED,
    detail: 'Also rename the resource directory `packages/frontend/src/locales/se/` -> `sv/`.',
  },

  // ---------------------------------------------------------------- pt (survey)
  {
    app: 'survey',
    kind: 'wrong-code',
    language: 'pt',
    actual: 'pt-BR',
    required: 'pt',
    source: SURVEY_MAPPING,
    detail:
      'ACTIONABLE — unblocked by the product decision (2026-07) that AhaSlides ships ONE ' +
      'Portuguese under the code `pt`. The presenter language picker offers a single ' +
      'Portuguese entry, so there is no second language for `pt-BR` to name. Migrate: ' +
      "rename the `SurveyLocale` member 'pt-BR' -> 'pt', the resource directory " +
      'frontend/src/i18n/pt-BR/ -> pt/, and collapse the SUPPORTED entries ' +
      "`br: 'pt-BR'` / `pt: 'pt-BR'` onto `pt` (the `br` shim itself is a separate, " +
      'still-blocked entry — see kind "compat-shim").\n\n' +
      'This is a code fix ONLY. The survey\'s content really is Brazilian (measured: ' +
      'zero European markers across all six pt-BR bundles), and this migration does not ' +
      'change a single translated string — it stops the survey calling AhaSlides\' one ' +
      'Portuguese by a code no other app uses. Whether that content SHOULD be Brazilian ' +
      'is the open dialect question and is tracked separately in CONTENT_DIVERGENCES: pt. ' +
      'Do not let this rename be read as answering it.',
  },

  // ---------------------------------------------------------------- sl / si
  {
    app: 'presenter',
    kind: 'legacy-alias',
    language: 'sl',
    actual: 'si',
    required: null,
    source: PRESENTER_MESSAGES,
    detail:
      'The presenter codes Slovenian correctly as `sl` AND accepts `si` for it, both ' +
      'loading the same bundle. This duplicate is why the `messages` map has 34 keys for ' +
      '33 languages. `si` is the ISO 3166-1 country code for Slovenia and the ISO 639-1 ' +
      'code for SINHALA. Also allowlisted in src/constant/locale.js.',
  },
  {
    app: 'audience',
    kind: 'legacy-alias',
    language: 'sl',
    actual: 'si',
    required: null,
    source: AUDIENCE_MESSAGES,
    detail:
      'Same duplicate as the presenter: an extra `messages` key pointing at the same ' +
      'AhaSlides_Slovenia.json that `sl` already loads. Delete the `si` key. `si` is ' +
      'Sinhala; Slovenian is `sl`.',
  },
  {
    app: 'team',
    kind: 'legacy-alias',
    language: 'sl',
    actual: 'si',
    required: null,
    source: TEAM_SUPPORTED,
    detail:
      'Carries BOTH `sl` and `si` in `supportedLngs`. Delete the `si` entry. `si` is ' +
      'Sinhala; Slovenian is `sl`.',
  },

  // ---------------------------------------------------------------- pt / br
  {
    app: 'presenter',
    kind: 'legacy-alias',
    language: 'pt',
    actual: 'br',
    required: null,
    source: 'stpancras-presenter-app src/utils/language/index.js + src/constant/locale.js',
    detail:
      '`br` is the ISO 3166-1 country code for Brazil and the ISO 639-1 code for BRETON, ' +
      'a Celtic language of Brittany. The presenter already rewrites `br` -> `pt`, so ' +
      'removing it is a deletion, not a migration — but check for persisted user ' +
      'preferences holding `br` before dropping the rewrite.',
  },
  {
    app: 'team',
    kind: 'legacy-alias',
    language: 'pt',
    actual: 'br',
    required: null,
    source: TEAM_SUPPORTED,
    detail:
      'Carries BOTH `br` and `pt` in `supportedLngs`. Delete the `br` entry, and check ' +
      'for a `br` resource directory to remove with it. `br` is Breton.',
  },

  // ---------------------------------------------------------------- compat shims
  {
    app: 'survey',
    kind: 'compat-shim',
    language: 'ko',
    actual: 'kr',
    required: null,
    source: SURVEY_MAPPING,
    detail:
      'NOT a defect — this is the correct pattern, and the worked example the README ' +
      'points at. aha-survey already codes Korean canonically and keeps this entry only ' +
      'to absorb the hosts that do not. It is boundary code, in the one module that ' +
      'reads untrusted `xprops.locale` input. Delete it (and the `ko: \'ko\'` entry ' +
      'becomes the only one) once presenter/audience/report/team have migrated.',
    blockedBy: 'presenter, audience, report, team: ko wrong-code',
  },
  {
    app: 'survey',
    kind: 'compat-shim',
    language: 'sl',
    actual: 'si',
    required: null,
    source: SURVEY_MAPPING,
    detail:
      'The SUPPORTED entry `si: \'sl\'` absorbs the presenter/audience/team `si` alias. ' +
      'Delete it once they drop `si`. Boundary code, correctly placed — not a defect.',
    blockedBy: 'presenter, audience, team: sl legacy-alias',
  },
  {
    app: 'survey',
    kind: 'compat-shim',
    language: 'pt',
    actual: 'br',
    required: null,
    source: SURVEY_MAPPING,
    detail:
      'Absorbs the presenter/team `br` alias. Delete once they drop it. STILL BLOCKED, ' +
      'and note what does NOT unblock it: the `pt` code decision settled that the ' +
      "canonical code is `pt`, which makes the sibling `pt: 'pt-BR'` entry an actionable " +
      'rename (see kind "wrong-code") — but this shim is blocked on presenter and team ' +
      'actually dropping `br` from their own allowlists, which has not happened. After ' +
      "the survey migrates, this shim simply becomes `br: 'pt'`; it disappears only when " +
      'the two upstream aliases do. `br` is Breton.',
    blockedBy: 'presenter, team: pt legacy-alias',
  },

  // ---------------------------------------------------------------- casing
  {
    app: 'presenter',
    kind: 'casing',
    language: 'sr-Latn',
    actual: 'sr-latn',
    required: 'sr-Latn',
    source: PRESENTER_MESSAGES,
    detail:
      'Same tag per RFC 5646 §2.1.1, so this renders correctly today and the registry ' +
      'resolves it. Cosmetic — fix it when touching this file for the `kr`/`se` work, ' +
      'not on its own.',
  },
  {
    app: 'presenter',
    kind: 'casing',
    language: 'sr-Cyrl',
    actual: 'sr-cyrl',
    required: 'sr-Cyrl',
    source: PRESENTER_MESSAGES,
    detail:
      'Same tag per RFC 5646 §2.1.1, renders correctly today. One edit with the `sr-Latn` ' +
      'entry above. Because the presenter is the host that sends these codes onward, its ' +
      'casing is what every embedded app receives — so fixing it here is what lets the ' +
      'others stop lowercasing defensively.',
  },
  {
    app: 'audience',
    kind: 'casing',
    language: 'sr-Latn',
    actual: 'sr-latn',
    required: 'sr-Latn',
    source: AUDIENCE_MESSAGES,
    detail:
      'Same tag per RFC 5646 §2.1.1, renders correctly today. Cosmetic — worth doing in ' +
      'the same pass as the `kr`/`se` fixes in this file, not as its own PR.',
  },
  {
    app: 'audience',
    kind: 'casing',
    language: 'sr-Cyrl',
    actual: 'sr-cyrl',
    required: 'sr-Cyrl',
    source: AUDIENCE_MESSAGES,
    detail:
      'Same tag per RFC 5646 §2.1.1, renders correctly today. One edit with the `sr-Latn` ' +
      'entry above; both keys live in the same `messages` map.',
  },
  {
    app: 'report',
    kind: 'casing',
    language: 'sr-Latn',
    actual: 'sr-latn',
    required: 'sr-Latn',
    source: REPORT_LOADERS,
    detail:
      'Same tag per RFC 5646 §2.1.1. Cosmetic. Note the filename would change too — on ' +
      'a case-insensitive filesystem (macOS default) a bare `git mv` will not register.',
  },
  {
    app: 'report',
    kind: 'casing',
    language: 'sr-Cyrl',
    actual: 'sr-cyrl',
    required: 'sr-Cyrl',
    source: REPORT_LOADERS,
    detail: 'Same tag per RFC 5646 §2.1.1. Cosmetic. Same case-insensitive-rename caveat.',
  },
  {
    app: 'team',
    kind: 'casing',
    language: 'sr-Latn',
    actual: 'sr-latn',
    required: 'sr-Latn',
    source: TEAM_SUPPORTED,
    detail:
      'NOT a one-line fix. team-management sets `lowerCaseLng: true` specifically to stop ' +
      'i18next canonicalizing `sr-latn` -> `sr-Latn` and then failing to find its ' +
      'lowercase resource directory. Fixing the casing means renaming the directories ' +
      'AND removing that flag — and the flag currently lowercases EVERY code, so removing ' +
      'it affects all 32 languages, not just Serbian. Do this one deliberately.',
  },
  {
    app: 'team',
    kind: 'casing',
    language: 'sr-Cyrl',
    actual: 'sr-cyrl',
    required: 'sr-Cyrl',
    source: TEAM_SUPPORTED,
    detail: 'Same `lowerCaseLng: true` cause as `sr-Latn` above — one fix covers both.',
  },

  // ---------------------------------------------------------------- missing
  {
    app: 'report',
    kind: 'missing-language',
    language: 'az',
    actual: null,
    required: 'az',
    source: REPORT_LOADERS,
    detail:
      'Add an `az` loader entry plus src/locales/az.json. Azerbaijani reached presenter + ' +
      'audience and stopped. Whoever adds it must also choose the antd pack deliberately ' +
      'and record it in the registry (`antd` is null there because no app has chosen ' +
      'one — it was not guessed).',
  },
  {
    app: 'survey',
    kind: 'missing-language',
    language: 'az',
    actual: null,
    required: 'az',
    source: SURVEY_MAPPING,
    detail:
      'Add `az` to SUPPORTED and the SurveyLocale union, plus its resource bundle. Also ' +
      'needs a deliberate dayjs + antd choice recorded in the registry — aha-survey is ' +
      'the only source of dayjs codes, so this app is the one that decides `az.dayjs`.',
  },
  {
    app: 'team',
    kind: 'missing-language',
    language: 'az',
    actual: null,
    required: 'az',
    source: TEAM_SUPPORTED,
    detail:
      'Add `az` to `supportedLngs` plus packages/frontend/src/locales/az/. Completes the ' +
      '`az` fan-out — presenter + audience already have it.',
  },
  {
    app: 'survey',
    kind: 'missing-language',
    language: 'sv',
    actual: null,
    required: 'sv',
    source: SURVEY_MAPPING,
    detail:
      'USER-VISIBLE TODAY: a presenter session in Swedish renders an English survey. Add ' +
      '`sv` to SUPPORTED and the SurveyLocale union, plus its resource bundle. ' +
      'Adding it also unblocks `sv.dayjs`, which is null in the registry only because ' +
      'aha-survey — the sole source of dayjs codes — has no Swedish entry to read one ' +
      'from. Note the host will send `se` until the presenter migrates.',
  },

  // ---------------------------------------------------------------- unregistered
  {
    app: 'report',
    kind: 'unregistered-language',
    language: null,
    actual: 'zh-tw',
    required: null,
    source: REPORT_LOADERS,
    detail:
      'DECISION NEEDED: adopt `zh-TW` as a registry language, or drop it from aha-report. ' +
      'aha-report serves Traditional Chinese under `zh-tw`. No other app has this code, ' +
      'and no presenter language covers it — so the registry cannot declare it without a ' +
      'decision. This is not an isolated oddity: Traditional Chinese content exists in ' +
      'THREE places (this, the audience `zh` bundle, and an orphaned presenter file) with ' +
      'no canonical code between them. Resolve it together with the `zh` content ' +
      'divergence, not separately. Casing would become `zh-TW` if adopted.',
    blockedBy: 'CONTENT_DIVERGENCES: zh — does AhaSlides ship Traditional Chinese?',
  },
  {
    app: 'team',
    kind: 'unregistered-language',
    language: null,
    actual: 'bs',
    required: null,
    source: TEAM_SUPPORTED,
    detail:
      'DECISION NEEDED: adopt `bs` as a registry language, or drop it from team ' +
      'management. team-management is the only app with Bosnian. Either it is a real ' +
      'AhaSlides language — in which case the presenter needs it too and it becomes a ' +
      'registry entry — or it is dead weight. `bs` is a valid ISO 639-1 code, so unlike ' +
      '`kr`/`se` there is nothing wrong with the code itself; the only question is ' +
      'whether the language is in scope. Check whether the resource directory holds real ' +
      'translations before deciding.',
  },

  // ---------------------------------------------------------------- filenames
  {
    app: 'audience',
    kind: 'filename',
    language: 'pt',
    actual: 'AhaSlides_Portuguese_BR.json',
    required: null,
    source: AUDIENCE_MESSAGES,
    detail:
      'The filenames differ because the CONTENT differs — this is a symptom of the `pt` ' +
      'content divergence, not an independent naming problem. Renaming the file without ' +
      'settling the content question would hide the bug. See CONTENT_DIVERGENCES: pt.',
    blockedBy: 'CONTENT_DIVERGENCES: pt',
  },
  {
    app: 'audience',
    kind: 'filename',
    language: 'sk',
    actual: 'AhaSlides_Slovak.json',
    required: 'AhaSlides_Slovak.json',
    source: AUDIENCE_MESSAGES,
    detail:
      'Purely cosmetic and safe, unlike the `pt` filename split: both files really are ' +
      'Slovak, the apps just named them differently (the presenter used the COUNTRY name, ' +
      'Slovakia, for the LANGUAGE, Slovak — the same country-vs-language confusion behind ' +
      'the `kr`/`se`/`si`/`br` codes, showing up in a filename). `AhaSlides_Slovak.json` ' +
      'is the correct name. The presenter has the same issue in ' +
      'AhaSlides_Slovenia.json (should be Slovenian) and AhaSlides_Hungary.json (should ' +
      'be Hungarian), but both apps agree on those, so they are not divergences.',
  },
];

/**
 * The two languages whose CONTENT disagrees across apps. Each needs a product
 * decision — no registry edit can resolve either.
 *
 * These are the expensive findings. Everything in {@link NON_COMPLIANCE} is a
 * mechanical rename; these two are real user-visible bugs.
 *
 * A content divergence does not necessarily block the matching code work, and
 * `pt` is the worked example: product settled the CODE (`pt`), which unblocked
 * aha-survey's `pt-BR` rename, while WHICH Portuguese the content is stays open
 * here. Read each entry's `decision` for what is actually still being asked —
 * do not assume the whole language is frozen.
 */
export const CONTENT_DIVERGENCES: readonly ContentDivergence[] = [
  {
    language: 'zh',
    serves: {
      presenter: 'Simplified (AhaSlides_Simplified_Chinese.json)',
      audience: 'Traditional (AhaSlides_Traditional_Chinese.json)',
      report: 'Simplified (zh.json) — plus Traditional under a separate `zh-tw`',
    },
    decision:
      'Does AhaSlides ship Traditional Chinese as a distinct language (`zh-TW`), or is ' +
      'the audience app simply serving the wrong file under `zh`?',
    detail:
      'THE SHARPEST BUG FOUND. The same code `zh` serves two different languages: ' +
      'presenter/report render Simplified, the audience app renders Traditional. A ' +
      'Simplified-Chinese presenter session shows Traditional Chinese to the audience. ' +
      'The audience app has NO Simplified file at all, so this cannot be fixed by ' +
      'reassigning a code — someone must add content.\n\n' +
      'The strange part, and the clue: the presenter DOES have ' +
      'public/languages/AhaSlides_Traditional_Chinese.json, and it is ORPHANED — ' +
      'verified on origin/staging, the string "Traditional_Chinese" appears nowhere ' +
      'under the presenter\'s src/, its `messages` map has no `zh-tw`/`tw` key, and its ' +
      '34 keys resolve to 33 distinct files. So Traditional Chinese exists three times ' +
      '(orphaned presenter file, audience `zh`, report `zh-tw`) and is reachable by a ' +
      'canonical code zero times. The most likely history: Traditional was added, then ' +
      'half-removed from the presenter, and the audience app was never cleaned up.\n\n' +
      'Adopting `zh-TW` as a 34th registry language would give all three a home and is ' +
      'probably the right answer — but that is a product call, and it is the reason the ' +
      'registry declares 33 rather than quietly picking one.',
  },
  {
    language: 'pt',
    serves: {
      presenter:
        'BLEND — labelled European (switcher reads "Português"/Portugal) but the content ' +
        'is both: ficheiro x34 AND arquivo x19, ecrã x32 AND tela x10',
      audience: 'Brazilian (AhaSlides_Portuguese_BR.json; zero European markers)',
      report: 'UNCLASSIFIABLE (pt.json, 169 keys, zero markers either way; antd pt_PT)',
      survey: 'Brazilian (pt-BR, antd pt_BR, dayjs pt-br; zero European markers)',
    },
    decision:
      'The CODE half is settled — one Portuguese, coded `pt`. Only the content is still ' +
      'in question: which Portuguese should that one Portuguese BE, European or Brazilian?',
    detail:
      'THE CODE HALF IS DECIDED, THE DIALECT IS NOT. Product decided (2026-07) that ' +
      'AhaSlides ships one Portuguese under `pt` — the presenter picker offers exactly ' +
      'one Portuguese entry. That resolved aha-survey\'s `pt-BR` into an actionable ' +
      'rename. It did NOT resolve which dialect the content is, which is what remains ' +
      'here and is a real user-visible bug: a presenter session in Portuguese renders ' +
      'a blend on the slide and Brazilian in the audience view.\n\n' +
      'The obvious tiebreak — "follow the presenter, it is the source of truth" — DOES ' +
      'NOT WORK, and this is the finding that matters. The presenter has no single ' +
      'dialect to follow. Measured on origin/staging by counting BR/PT lexical markers ' +
      'in the JSON values, AhaSlides_Portuguese.json contains `ficheiro` x34 (European) ' +
      'AND `arquivo` x19 (Brazilian) — the same word, "file", translated both ways in ' +
      'one file — plus `ecrã` x32 beside `tela` x10. It points European by LABEL and ' +
      'both ways by CONTENT.\n\n' +
      'Method note, because an earlier pass got this wrong: parse the JSON and scan ' +
      'VALUES only (the presenter\'s keys are English sentences, so raw-text scanning ' +
      'counts English), and never use a marker that is also an English word — `time` ' +
      '(BR "team") collides and poisons the count. `você` alone is weak; European ' +
      'Portuguese uses it too. Reliable pairs: arquivo/ficheiro, tela/ecrã, ' +
      'usuário/utilizador, gerenciar/gerir.\n\n' +
      'Where the evidence does point: the two highest-volume participant-facing ' +
      'surfaces (audience, survey) are unambiguously Brazilian with zero European ' +
      'markers, and aha-report is too small to classify. But that is an inference about ' +
      'where the users are, not a decision about who we serve — which is why this is a ' +
      'product call and not a patch.\n\n' +
      'Until it is answered, the `pt` entry\'s antd pt_PT / dayjs pt-br stay mismatched ' +
      'on purpose: they are the only values any app has chosen, and harmonising them ' +
      'would silently decide the dialect.',
  },
];

/**
 * Everything a given app must fix.
 *
 * @example
 * deviationsForApp('team').filter((d) => d.kind === 'wrong-code');
 */
export function deviationsForApp(app: AppId): Deviation[] {
  return NON_COMPLIANCE.filter((d) => d.app === app);
}

/**
 * Every deviation of one kind, across all apps. Useful for scoping one ticket
 * per class of problem rather than one per app.
 *
 * @example
 * deviationsByKind('wrong-code'); // the 9 entries that mis-render today
 */
export function deviationsByKind(kind: DeviationKind): Deviation[] {
  return NON_COMPLIANCE.filter((d) => d.kind === kind);
}
