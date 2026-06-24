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
  presentationId: string;
  presentationVersion: number;
  teamId?: string;
  participantId?: string;
  slideId?: string;
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

/** Supported leaderboard aggregation functions. */
export type LeaderboardAgg = "total_score";

/**
 * Query params shared by the leaderboard endpoints
 * (`GET /api/aha-sync/answers/leaderboards/*`). Adds `scoreChannel` and `agg`
 * on top of the common answer scope.
 */
export interface LeaderboardQuery extends BaseAnswerScope {
  /** Which score bucket to read, e.g. in-game vs final leaderboard. */
  scoreChannel?: string;
  /** Aggregation function. Defaults to `total_score`. */
  agg?: LeaderboardAgg;
}

/** Query params for `GET /api/aha-sync/answers/leaderboards/topn`. */
export interface GetLeaderboardTopNRequest extends LeaderboardQuery {
  /** Number of top entries to return. Defaults to `20`, range `[1, 100]`. */
  n?: number;
}

/** Query params for `GET /api/aha-sync/answers/leaderboards/around`. */
export interface GetLeaderboardAroundRequest extends LeaderboardQuery {
  /** Entries to include above/below the participant. Defaults to `10`, range `[0, 100]`. */
  k?: number;
}

/** A single leaderboard entry. */
export interface LeaderboardItem {
  id: string;
  score: number;
  rank: number;
  name: string;
  emoji: string;
}

/** Response body for the leaderboard endpoints. */
export interface LeaderboardResponse {
  items: LeaderboardItem[];
}

/** Request body for `DELETE /api/live/answers/results` (ResetResult). */
export interface ResetResultRequest {
  timestamp: number;
  presentationId: string;
  presentationVersion: number;
  slideId?: string;
  questionId?: string;
  answerId?: string;
}
