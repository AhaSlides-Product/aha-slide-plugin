/**
 * Payload for a single count total operation
 */
export interface CountTotalPayload {
  /** The bucket identifier for grouping counts */
  bucket: string;
  /** The key identifier within the bucket */
  key: string;
  /** The amount to increase the count by (default: 1) */
  increaseBy?: number;
}

/**
 * Request body for counting total endpoint
 */
export interface CountTotalRequest {
  /** Array of count operations to perform */
  counts: CountTotalPayload[];
}

/**
 * Payload for a single count unique operation
 */
export interface CountUniquePayload {
  /** The bucket identifier for grouping counts */
  bucket: string;
  /** The key identifier within the bucket */
  key: string;
  /** The unique item identifier to count */
  item: string;
}

/**
 * Request body for counting unique endpoint
 */
export interface CountUniqueRequest {
  /** Array of unique count operations to perform */
  counts: CountUniquePayload[];
}
