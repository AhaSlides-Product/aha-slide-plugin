/**
 * Types for the canonical AhaSlides language registry.
 *
 * This package is DATA. It declares *which languages AhaSlides has* and *what
 * the one correct code for each is*. It deliberately contains no i18n library,
 * no runtime dependency, and no translated strings.
 *
 * It also deliberately contains no notion of an *app*. The registry declares a
 * single standard; it does not model, translate to, or otherwise speak any
 * individual app's dialect. Where an app deviates from the standard today,
 * that is recorded as a defect to be fixed — see `./non-compliance.js`.
 */

/**
 * One language in the canonical registry.
 *
 * Every field is the standard's answer, not any app's answer. If an app
 * disagrees with a field here, the app is wrong, and the disagreement belongs
 * in the non-compliance record rather than in this type.
 */
export interface LanguageEntry {
  /**
   * The canonical code: ISO 639-1, with a BCP-47 script subtag where a script
   * distinction exists (`sr-Latn`). This is the ONLY code the registry accepts
   * or returns for this language.
   *
   * Codes compare case-insensitively, because RFC 5646 §2.1.1 makes tag case
   * insignificant — `sr-latn` and `sr-Latn` are the same tag, so treating them
   * as different codes would be a bug, not strictness. That is the only
   * latitude the API grants: a *different string* (`kr` for `ko`) is a
   * different tag, and is rejected.
   */
  readonly code: string;

  /** English display name, e.g. `"Korean"`. Never localized. */
  readonly name: string;

  /**
   * The dayjs locale code, or `null` when no AhaSlides app has chosen one yet.
   *
   * `null` means "not sourceable from any app today" — NOT "dayjs has no such
   * locale". Consumers needing it must pick one deliberately and record it
   * here. A guess would propagate silently to every consumer, so the registry
   * refuses to make one.
   */
  readonly dayjs: string | null;

  /**
   * The antd / ant-design-vue locale pack name (e.g. `"de_DE"`), or `null`
   * when no AhaSlides app has chosen one yet. Same `null` semantics as
   * {@link LanguageEntry.dayjs}.
   */
  readonly antd: string | null;

  /**
   * Free text recording a known trap, deliberate gap, or unresolved question
   * for this language. Present only where there is something a reader must not
   * "helpfully" fix.
   */
  readonly notes?: string;
}
