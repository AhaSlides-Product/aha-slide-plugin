/**
 * Represents a single item in the aggregated statistics.
 */
export interface CountTotalItem {
  /** The bucket name for aggregation (e.g., slide-specific path). */
  bucket: string;
  /** The key within the bucket (e.g., the answer option). */
  key: string;
  /** The amount to increase the stat by. */
  increase_by: number;
}

/**
 * A collection of items to be aggregated in the statistics.
 */
export type CountTotal = CountTotalItem[];

export interface CountUniqueItem {
  /** The bucket name for aggregation (e.g., slide-specific path). */
  bucket: string;
  /** The key within the bucket (e.g., the answer option). */
  key: string;
  /** item identifier. */
  item: string;
}

/**
 * A collection of items to be aggregated in the statistics.
 */
export type CountUnique = CountUniqueItem[];


export interface SyncItem {
  /** EMQX topic that clients should subscribe to to receive updates. */
  path: string;
  /** The value to be sent to the topic. */
  value: string;
}

export type Sync = SyncItem[];

/**
 * Represents the result of an audience answer submission processed by the backend.
 */
export interface SubmissionResult {
  count_total?: CountTotal;
  count_unique?: CountUnique;
  sync?: Sync;
}
