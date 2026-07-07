import { CountTotalItem, CountUniqueItem, SyncItem } from "@aha/common";

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

/** How an answer affects the participant's streak. */
export type StreakAction = "COUNT" | "NOT_COUNT" | "BREAK";

/** Correctness of an answer. */
export type Verdict = "CORRECT" | "WRONG" | "PARTIALLY_CORRECT";

/**
 * How repeated answers at the same checkpoint are kept: `FIRST` and `LAST`
 * collapse to one, `ALL` keeps every answer.
 */
export type Retention = "FIRST" | "LAST" | "ALL";

/** A single scored answer result. */
export interface AnswerResultPayload extends BaseAnswerScope {
  resultId: string;
  /** Defaults to `""` on the backend when omitted, e.g. bonus score doens't need to reference an answer. */
  answerId?: string;
  /** Defaults to `0` on the backend when omitted. */
  points?: number;
  /** Defaults to `""` on the backend when omitted, used to distinguish where score is counted to, e.g. in-game vs final leaderboard. */
  scoreChannel?: string;
  /** Correctness of the answer. Left unspecified on the backend when omitted. */
  verdict?: Verdict;
  /** How the answer affects the streak. Left unspecified on the backend when omitted. */
  streakAction?: StreakAction;
  /** Dedup policy for repeated answers at the same checkpoint. Defaults to `FIRST` on the backend when omitted. */
  retention?: Retention;
  /** Fully replaces an earlier result carrying the same labels. Defaults to `false`. */
  override?: boolean;
  /** Defaults to `0` on the backend when omitted. */
  count?: number;
}

export interface AnswerResponse {
  answerId: string;
  results: AnswerResultPayload[];
  countTotal?: CountTotalItem[];
  countUnique?: CountUniqueItem[];
  sync?: SyncItem[];
}

/**
 * Wrapper around a list of answer results. Used as both the response body of
 * `POST /api/live/answers` and the request body of
 * `POST /api/live/answers/results`.
 */
export interface AnswerResultRequest {
  results: AnswerResultPayload[];
}

/** Aggregation a leaderboard request ranks by. */
export type LeaderboardAggregation = "total_score" | "average_score" | "first_score";

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
  /** Aggregation to rank by. Defaults to `total_score`. */
  aggregation?: LeaderboardAggregation;
  /** Number of top entries to return. Defaults to `20`, range `[1, 1000]`. */
  n?: number;
}

/** Parameters for a top-N leaderboard query over a slide window. */
export interface GetLeaderboardSlideTopNRequest extends BaseLeaderboardScope {
  /** Ordered quiz slide ids to rank over. */
  slideIds: number[];
  /** Slide up to which the last leaderboard was calculated. `oldScore` covers slides up to and including it. */
  lastSlideId?: number;
  /** Aggregation to rank by. Defaults to `total_score`. */
  aggregation?: LeaderboardAggregation;
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

/** Parameters for reading a participant's past answers (AnswersV3). */
export interface GetAnswersRequest {
  presentationId: number;
  presentationVersion: number;
  slideId: number;
  slideVersion: number;
  participantId: string;
  /** Restrict to one question; omit to match every question on the slide. */
  questionId?: string;
}

/** One raw answer row from AnswersV3. */
export interface AnswerRecord<T = unknown> {
  /** Scope labels stored with the answer (snake_case, string-valued). */
  labels: Record<string, string>;
  /** The slide-type-specific answer payload. */
  data: T;
  timestamp: number;
}

export interface AudienceInfo {
  name: string;
  emoji: string;
  teamId?: string;
  teamName?: string;
}

/**
 * A single leaderboard entry.
 * The `around`/`slide-around` endpoints enrich only the pivot row (`id === subjectId`)
 * with `answerCount`/`correctAnswerCount`/`currentStreak`/`longestStreak`.
 */
export interface LeaderboardItem extends AudienceInfo {
  id: string;
  score: number;
  oldScore: number;
  rank: number;
  currentStreak?: number;
  longestStreak?: number;
  answerCount?: number;
  correctAnswerCount?: number;
  members?: AudienceInfo[];
}

/** A single ranked list of leaderboard entries. */
export interface LeaderboardResponse {
  items: LeaderboardItem[];
}

/**
 * A ranked list per requested aggregation, keyed by aggregation name.
 * For `subject=participant` the response also carries `current_streak` and
 * `longest_streak` buckets (each a single top-1 leader).
 * For `subject=team` only the ranking bucket is present.
 */
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
