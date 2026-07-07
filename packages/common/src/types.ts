export enum SubmissionSenderType {
  Audience = 'audience',
  Presenter = 'presenter',
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
  /** The key within the bucket (e.g., the answer option). */
  key: string;
  /** item identifier. */
  item: string;
}

/** One direct topic publish a handler emits — writes `value` to the EMQX/KV `path`. */
export interface SyncItem {
  /** EMQX topic that clients subscribe to for updates. */
  path: string;
  /** The value to be sent to the topic. */
  value: string;
}
