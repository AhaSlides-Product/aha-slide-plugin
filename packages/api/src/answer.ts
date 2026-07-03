/**
 * Types for the liveproxy answer endpoints.
 *
 * Mirrors the goctl `.api` definitions in
 * backend-live-session/liveproxy/api/main.api so the FE/BE share one source
 * of truth for the request/response shapes.
 */

/** Scope fields shared by every answer request and result. */
export interface BaseAnswerScope {
  /** Auto-filled with `Date.now()` before sending when omitted. */
  timestamp?: number;
  presentationId: number;
  presentationVersion: number;
  teamId?: string;
  participantId?: string;
  slideId?: number;
  slideVersion?: number;
  questionId?: string;
}

/**
 * Request body for `POST /api/live/answers` (CreateAnswerV3).
 * `data` carries the slide-type-specific answer payload.
 */
export interface AnswerRequest<T = unknown> extends BaseAnswerScope {
  data: T;
}

/** How an answer affects the participant's streak. Defaults to `COUNT`. */
export type StreakAction = "COUNT" | "NOT_COUNT" | "BREAK";

/** A single scored answer result. */
export interface AnswerResultPayload extends BaseAnswerScope {
  resultId: string;
  /** Defaults to `""` on the backend when omitted, e.g. bonus score doens't need to reference an answer. */
  answerId?: string;
  /** Defaults to `0` on the backend when omitted. */
  points?: number;
  /** Defaults to `""` on the backend when omitted, used to distinguish where score is counted to, e.g. in-game vs final leaderboard. */
  scoreChannel?: string;
  /** Defaults to `true` on the backend when omitted. */
  correct?: boolean;
  /** Defaults to `COUNT` on the backend when omitted. */
  streakAction?: StreakAction;
  /** Defaults to `false` on the backend when omitted. */
  override?: boolean;
  /** Defaults to `0` on the backend when omitted. */
  count?: number;
}

export interface AnswerResponse {
  answerId: string;
  results: AnswerResultPayload[];
}

/**
 * Wrapper around a list of answer results. Used as both the response body of
 * `POST /api/live/answers` and the request body of
 * `POST /api/live/answers/results`.
 */
export interface AnswerResultRequest {
  results: AnswerResultPayload[];
}

/** Supported leaderboard aggregation. Streaks apply to top-N only, not around-slices. */
export type LeaderboardAggregation = "total_score" | "average_score" | "first_score" | "current_streak" | "longest_streak";

/** Which kind of entity the leaderboard ranks. Defaults to `participant`. */
export type LeaderboardSubject = "participant" | "team";

/** Scope shared by every leaderboard request. */
export interface BaseLeaderboardScope {
  presentationId: number;
  presentationVersion: number;
  /** Which score bucket to read, e.g. in-game vs final. */
  scoreChannel?: string;
  /** Whether the leaderboard ranks participants or teams. Defaults to `participant`. */
  subject?: LeaderboardSubject;
}

/** Parameters for a top-N leaderboard query. */
export interface GetLeaderboardTopNRequest extends BaseLeaderboardScope {
  slideId?: number;
  slideVersion?: number;
  /** Aggregations to rank by. Defaults to `["total_score"]`. */
  aggregations?: LeaderboardAggregation[];
  /** Number of top entries to return. Defaults to `20`, range `[1, 1000]`. */
  n?: number;
}

/** Parameters for a top-N leaderboard query over a slide window. */
export interface GetLeaderboardSlideTopNRequest extends BaseLeaderboardScope {
  /** Ordered quiz slide ids to rank over. */
  slideIds: number[];
  /** Slide up to which the last leaderboard was calculated. `oldScore` covers slides up to and including it. */
  lastSlideId?: number;
  /** Aggregations to rank by. Defaults to `["total_score"]`. */
  aggregations?: LeaderboardAggregation[];
  /** Number of top entries to return. Defaults to `20`, range `[1, 1000]`. */
  n?: number;
}

/** Parameters for a leaderboard slice centered on one subject. */
export interface GetLeaderboardAroundRequest extends BaseLeaderboardScope {
  slideId?: number;
  slideVersion?: number;
  /** Id of the subject (participant or team) to center the slice on. Required. */
  subjectId: string;
  /** Aggregation to rank by. Defaults to `total_score`. */
  aggregation?: LeaderboardAggregation;
  /** Entries to include above/below the subject. Defaults to `10`, range `[0, 100]`. */
  k?: number;
}

/** Parameters for a subject-centered slice over a slide window. */
export interface GetLeaderboardSlideAroundRequest extends BaseLeaderboardScope {
  slideIds: number[];
  /** Id of the subject (participant or team) to center the slice on. Required. */
  subjectId: string;
  /** Aggregation to rank by. Defaults to `total_score`. */
  aggregation?: LeaderboardAggregation;
  /** Entries to include above/below the subject. Defaults to `10`, range `[0, 100]`. */
  k?: number;
}

export interface AudienceInfo {
  name: string;
  emoji: string;
  teamId?: string;
  teamName?: string;
}

/** A single leaderboard entry. */
export interface LeaderboardItem extends AudienceInfo {
  id: string;
  score: number;
  oldScore: number;
  rank: number;
  members?: AudienceInfo[];
}

/** A single ranked list of leaderboard entries. */
export interface LeaderboardResponse {
  items: LeaderboardItem[];
}

/** A ranked list per requested aggregation, keyed by aggregation name. */
export interface LeaderboardMultiResponse {
  aggregations: Record<string, LeaderboardResponse>;
}

/** Request body for `DELETE /api/live/answers/results` (ResetResult). */
export interface ResetResultRequest {
  timestamp: number;
  presentationId: number;
  presentationVersion: number;
  slideId?: number;
  questionId?: string;
  answerId?: string;
}
