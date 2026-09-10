/**
 * Reference shapes for the audience-side identity props and the presenter-side
 * `audiences` roster.
 *
 * The strongly-typed pieces — `Team`, `JoinGamePayload`, `JoinGameResult`,
 * `ParticipantInfo`, `AudienceSlidePluginProps` — already ship from the SDK and
 * are re-exported by this package; import them directly. The types below fill
 * two gaps the SDK leaves loose:
 *
 *  1. `AudienceProps` — a named alias for the inline `audience` object on
 *     `AudienceSlidePluginProps` (the current participant), so it can be imported
 *     on its own.
 *  2. `PresenterAudiences` / `AudienceEntry` — the presenter `xprops.audiences`
 *     roster, which the SDK types only as `Record<string, any>`. The shape here
 *     is a **best-effort, illustrative** projection (name, emoji, team, online
 *     status, answers), NOT an authoritative contract — the entry stays open.
 */

/**
 * The current participant, as seen on the AUDIENCE side (`xprops.audience`).
 */
export interface AudienceProps {
  /** Display name of the participant. */
  audienceName?: string;
  /** Chosen emoji avatar. */
  audienceEmoji?: string;
  /** Unique participant id. */
  audienceId?: string | number;
  /** Participant email, when verified/collected. */
  audienceEmail?: string;
  /** Free-text admission "organisation/team" field — NOT the team-play team. */
  audienceTeam?: string;
  /** Team-play team id the participant joined; resolve its name via `xprops.teams`. */
  audienceQuizTeam?: string | number;
  /** Open record: the host may attach more. */
  [key: string]: unknown;
}

/**
 * One entry in the presenter-side roster (`xprops.audiences[id]`).
 *
 * ⚠️ Illustrative shape only — the SDK types the roster value as `any`. Read
 * defensively; the exact fields present depend on the host version and slide.
 */
export interface AudienceEntry {
  /** Participant id (usually mirrors the map key). */
  audienceId?: string | number;
  /** Display name. */
  audienceName?: string;
  /** Emoji avatar. */
  audienceEmoji?: string;
  /** Free-text admission organisation/team. */
  audienceTeam?: string;
  /** Team-play team id, when in a team game. */
  audienceQuizTeam?: string | number;
  /** Whether the participant is currently connected. */
  online?: boolean;
  /** The participant's submitted answers for the active slide, when exposed. */
  answers?: unknown;
  /** Open record: host- and slide-specific fields may appear. */
  [key: string]: unknown;
}

/**
 * The presenter-side roster (`xprops.audiences`): a map of participant id →
 * {@link AudienceEntry}.
 */
export type PresenterAudiences = Record<string, AudienceEntry>;
