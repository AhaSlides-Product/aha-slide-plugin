/**
 * Types for the canonical AhaSlides language registry.
 *
 * This package is DATA. It declares *which languages exist* and *what each
 * locale code means* across the AhaSlides apps. It deliberately contains no
 * i18n library, no runtime dependency, and no translated strings.
 */

/**
 * The apps that ship a language list today. Each mirrors the presenter's set
 * by hand, which is precisely why they have drifted — see the README.
 */
export type AppId = 'presenter' | 'audience' | 'report' | 'survey' | 'team';

/** Every {@link AppId}, in a stable order. Useful for iterating/validating. */
export const APP_IDS: readonly AppId[] = ['presenter', 'audience', 'report', 'survey', 'team'];

/**
 * The PRIMARY locale code each app uses for a language, or `null` when that app
 * does not support the language at all.
 *
 * "Primary" matters: a few apps also accept a legacy code for the same language
 * (presenter/audience/team accept `si` as well as `sl`; the presenter rewrites
 * `br` to `pt` at load time). Those extra codes live in
 * {@link LanguageEntry.aliases} and still resolve — this field records the one
 * code the app actually keys its bundle on.
 *
 * `null` is a real, load-bearing value here: it is how the registry records
 * that an app has fallen behind the presenter's language set. It must never be
 * "helpfully" filled in with a guess.
 */
export type AppCodes = Readonly<Record<AppId, string | null>>;

/**
 * The translation-bundle filename each app serves for a language, or `null`
 * when the app has no file.
 *
 * Per-app rather than a single field on purpose: the presenter and the audience
 * app genuinely disagree for some languages (`zh`, `pt`, `sk`). Recording both
 * makes the divergence visible data instead of a silent render bug.
 */
export interface LanguageFiles {
  readonly presenter: string | null;
  readonly audience: string | null;
}

/** One language in the canonical registry. */
export interface LanguageEntry {
  /**
   * The canonical code for this language: ISO 639-1, with a BCP-47 script
   * subtag where a script distinction exists. This is the code new code should
   * use. It is NOT necessarily the code any given app uses today — see
   * {@link LanguageEntry.apps} and {@link LanguageEntry.aliases}.
   */
  readonly code: string;

  /** English display name, e.g. `"Korean"`. Never localized. */
  readonly name: string;

  /**
   * Every DISTINCT non-canonical code that any app uses for this language
   * today. Guaranteed to round-trip: each one resolves back to
   * {@link LanguageEntry.code}.
   *
   * Case variants are NOT aliases — resolution is case-insensitive, so the
   * presenter's `sr-latn` and the survey's `sr-Latn` are one code, not two.
   * Only genuinely different strings appear here (`kr` for `ko`, `se` for `sv`,
   * `si` for `sl`, `br`/`pt-BR` for `pt`).
   */
  readonly aliases: readonly string[];

  /** The code each app uses today, or `null` where the app lacks the language. */
  readonly apps: AppCodes;

  /** The bundle filename each of the two CDN-served apps uses. */
  readonly files: LanguageFiles;

  /**
   * The dayjs locale code, or `null` when no AhaSlides app has chosen one yet.
   *
   * `null` means "not sourceable from any app today" — NOT "dayjs has no such
   * locale". Consumers needing it must pick one deliberately and record it here.
   */
  readonly dayjs: string | null;

  /**
   * The antd / ant-design-vue locale pack name (e.g. `"de_DE"`), or `null`
   * when no AhaSlides app has chosen one yet. Same `null` semantics as
   * {@link LanguageEntry.dayjs}.
   */
  readonly antd: string | null;

  /**
   * Free text recording a known divergence, deliberate gap, or trap for this
   * language. Present only where there is something a reader must not
   * "helpfully" fix.
   */
  readonly notes?: string;
}
