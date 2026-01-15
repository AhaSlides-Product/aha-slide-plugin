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


/**
 * Represents the result of an audience answer submission processed by the backend.
 */
import { SubmitAnswerDto } from './submit-answer.dto';

/**
 * Represents the result of an audience answer submission processed by the backend.
 */
export interface AnswerResult {
  submission: SubmitAnswerDto;
  count_total?: CountTotal;
  count_unique?: CountUnique;
}
