import { CountTotalItem, CountUniqueItem, SyncItem } from '@aha/common';

// Item shapes are shared with the API client + liveproxy via @aha/common.
export type { CountTotalItem, CountUniqueItem, SyncItem };

export type CountTotal = CountTotalItem[];
export type CountUnique = CountUniqueItem[];
export type Sync = SyncItem[];

/**
 * Represents the result of an audience answer submission processed by the backend.
 */
export interface SubmissionResult {
  count_total?: CountTotal;
  count_unique?: CountUnique;
  sync?: Sync;
}
