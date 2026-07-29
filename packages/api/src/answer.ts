import { CountTotalItem, CountUniqueItem, SyncItem } from "@aha/common";

/** Scope fields shared by every answer request and result. */
export interface BaseAnswerScope {
  /** Auto-filled with `Date.now()` before sending when omitted. */
  timestamp?: number;
  presentationId: number;
  presentationVersion: number;
  teamId?: string;
  participantId: string;
  slideId: number;
  slideVersion: number;
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
export interface AnswerResultPayload<T = unknown> extends BaseAnswerScope {
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
  /** Slide-type result payload for the audience to read back. */
  data?: T;
}

export interface AnswerResponse<T = unknown> {
  answerId: string;
  results: AnswerResultPayload<T>[];
  countTotal?: CountTotalItem[];
  countUnique?: CountUniqueItem[];
  sync?: SyncItem[];
}

/**
 * Wrapper around a list of answer results. Used as both the response body of
 * `POST /api/live/answers` and the request body of
 * `POST /api/live/answers/results`.
 */
export interface AnswerResultRequest<T = unknown> {
  results: AnswerResultPayload<T>[];
}

/** Aggregation a leaderboard request ranks by. */
export type LeaderboardAggregation = "total_score" | "average_score" | "first_score";

/** Which kind of entity the leaderboard ranks. Defaults to `participant`. */
export type LeaderboardSubject = "participant" | "team";

/** Scope shared by every leaderboard request. */
export interface BaseLeaderboardScope {
  presentationId: number;
  presentationVersion: number;
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

export interface BaseSlideAnswersRequest {
  presentationId: number;
  presentationVersion: number;
  slideId: number;
  slideVersion: number;
  /** Restrict to one question; omit to match every question on the slide. */
  questionId?: string;
  /** Page size (server default 100). */
  limit?: number;
  /** Rows to skip (server default 0). */
  offset?: number;
}

/** Read one participant's answers for a slide. Audience-facing, participantId required. */
export interface GetParticipantSlideAnswersRequest extends BaseSlideAnswersRequest {
  participantId: string;
}

/** Read a slide's answers. Presenter-facing, participantId is not required. */
export interface GetSlideAnswersRequest extends BaseSlideAnswersRequest {
  participantId?: string;
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

/** A single leaderboard entry. Per-subject stats live on the `/stats` endpoint. */
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

/** Parameters for the per-slide streak leaderboards. */
export interface GetLeaderboardSlideStreakRequest {
  presentationId: number;
  presentationVersion: number;
  slideId: number;
}

/** Top current-streak and longest-streak leaders for a slide. */
export interface LeaderboardStreakResponse {
  currentStreak?: LeaderboardResponse;
  longestStreak?: LeaderboardResponse;
}

/** Parameters for a single subject's score over a slide window. */
export interface GetScoreRequest extends BaseLeaderboardScope {
  slideIds: number[];
  subjectId: string;
  /** Aggregation to score by. Defaults to `total_score`. */
  aggregation?: LeaderboardAggregation;
}

/** The first member (of a team) to score, enriched with audience info. */
export interface FirstScoreMember extends AudienceInfo {
  id: string;
}

/** A single subject's score, plus the first-scoring team member when applicable. */
export interface ScoreResponse {
  score: number;
  firstScoreMember?: FirstScoreMember;
}

/** Parameters for a single subject's stats over a slide window. Aggregation-independent. */
export interface GetStatsRequest extends BaseLeaderboardScope {
  slideIds: number[];
  subjectId: string;
}

/** Per-subject stats: streaks (participant only) and answer counts. */
export interface StatsResponse {
  currentStreak?: number;
  longestStreak?: number;
  answerCount?: number;
  correctAnswerCount?: number;
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
