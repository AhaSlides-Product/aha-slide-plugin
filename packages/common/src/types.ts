export enum SubmissionSenderType {
  Audience = 'audience',
  Presenter = 'presenter',
}

/**
 * Host-driven quiz lifecycle phase, broadcast to plugin quiz iframes via the
 * `quizStatus` xprop. Values mirror the presenter/audience host `QuizStatuses`
 * enum so the same integer means the same thing on both sides of the iframe.
 *
 * Prefer this over the legacy `autoStartGame` boolean, which is a projection of
 * it: `autoStartGame === (quizStatus !== QuizStatus.Lobby)`. `autoStartGame`
 * stays on the contract for backward-compat with plugins that predate
 * `quizStatus`; it will be retired once every deployed plugin reads `quizStatus`.
 */
export enum QuizStatus {
  Lobby = 1,
  Rule = 2,
  Countdown = 3,
  Question = 4,
  Result = 5,
}

export enum SubmissionType {
  Response = 'response',
}

export interface SubmissionPayload<T = any> {
  presentationId: number;
  presentationVersion?: number;

  slideId: number;
  slideVersion: number;

  type: SubmissionType | string;

  senderId: string;
  senderType: SubmissionSenderType;

  attributes: T;
}

/** One live-count increment a handler emits (a count_total delta on bucket/key). */
export interface CountTotalItem {
  /** The bucket name for aggregation (e.g., slide-specific path). */
  bucket: string;
  /** The key within the bucket (e.g., the answer option). */
  key: string;
  /** The amount to increase the stat by. */
  increase_by: number;
}

/** One distinct-item entry a handler emits (a count_unique item under bucket/key). */
export interface CountUniqueItem {
  /** The bucket name for aggregation (e.g., slide-specific path). */
  bucket: string;
  /** The counter name (e.g., `submission_count`). */
  key: string;
  /** The distinct value to de-dupe on (e.g., a sender/participant id). */
  item: string;
}

/** One direct topic publish a handler emits — writes `value` to the EMQX/KV `path`. */
export interface SyncItem {
  /** EMQX topic that clients subscribe to for updates. */
  path: string;
  /** JSON-encoded value published to the topic (consumers `JSON.parse` it). */
  value: string;
}
