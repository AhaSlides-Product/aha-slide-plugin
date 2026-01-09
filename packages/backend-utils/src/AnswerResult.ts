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

/**
 * Represents the result of an audience answer submission processed by the backend.
 */
export interface AnswerResult {
  /** The unique identifier of the presentation. */
  presentation: number;
  /** The unique identifier of the slide. */
  slide: number;
  /** The version number of the slide. */
  version: number;
  /** Aggregated statistics data. */
  count_total: CountTotal;
  /** Points awarded to the audience member for this answer. */
  point: number;
  /** The audience member identifier. */
  audience: string;
  /** The display name of the audience member. */
  audienceName: string;
  /** Optional emoji representing the audience member. */
  audienceEmoji?: string;
  /** Whether the answer was considered correct. */
  correct: boolean;
  /** Stringified raw answer data for persistence. */
  data: string;
}
