/**
 * Types for the liveproxy answer endpoints.
 *
 * Mirrors the goctl `.api` definitions in
 * backend-live-session/liveproxy/api/main.api so the FE/BE share one source
 * of truth for the request/response shapes.
 */

/** Scope fields shared by every answer request and result. */
export interface BaseAnswerScope {
    sessionId: string;
    sessionVersion: number;
    teamId?: string;
    participantId?: string;
    activityId?: string;
    activityVersion?: number;
    subActivityId?: string;
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
    answerId?: string;
    timestamp: number;
    points: number;
    type?: string;
    /** Defaults to `true` on the backend when omitted. */
    correct?: boolean;
    /** Defaults to `COUNT` on the backend when omitted. */
    streakAction?: StreakAction;
    /** Defaults to `false` on the backend when omitted. */
    override?: boolean;
}

/**
 * Wrapper around a list of answer results. Used as both the response body of
 * `POST /api/live/answers` and the request body of
 * `POST /api/live/answers/results`.
 */
export interface AnswerResultRequest {
    results: AnswerResultPayload[];
}

/** Request body for `DELETE /api/live/answers/results` (ResetResult). */
export interface ResetResultRequest {
    sessionId: string;
    sessionVersion: number;
    activityId?: string;
    subActivityId?: string;
    answerId?: string;
}
