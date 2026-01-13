import { CountingAPI } from './counting';
import { AnswerAPI } from './answer';
import type { CountTotalPayload, CountUniquePayload } from './types';
import type { AnswerSubmissionPayload } from './answer';

/**
 * Unified API client for AhaSlides endpoints
 * 
 * Provides access to both counting and answer submission APIs through a single instance.
 * 
 * @example
 * ```typescript
 * const api = new AhaSlidesAPI('/api/live');
 * 
 * // Submit an answer
 * await api.submitAnswer({
 *   presentationId: 195273,
 *   slideId: 657195,
 *   vote: [7238853],
 *   // ... other fields
 * });
 * 
 * // Count total
 * await api.countTotal([
 *   { bucket: 'presentation-123', key: 'views', increaseBy: 1 }
 * ]);
 * 
 * // Count unique
 * await api.countUnique([
 *   { bucket: 'presentation-123', key: 'unique-viewers', item: 'user-456' }
 * ]);
 * ```
 */
export class AhaSlidesAPI {
  private readonly counting: CountingAPI;
  private readonly answer: AnswerAPI;

  /**
   * Creates a new AhaSlidesAPI instance
   * 
   * @param baseUrl - Base URL for the API endpoints (e.g., '/api/live')
   */
  constructor(baseUrl: string) {
    this.counting = new CountingAPI(baseUrl);
    this.answer = new AnswerAPI(baseUrl);
  }

  /**
   * Submit an answer for a quiz/poll slide
   * 
   * @param payload - Answer submission data
   * @returns Promise that resolves when the answer is submitted
   */
  async submitAnswer(payload: AnswerSubmissionPayload): Promise<void> {
    return this.answer.submitAnswer(payload);
  }

  /**
   * Increment total counts for one or more bucket/key combinations
   * 
   * @param counts - Array of count operations to perform
   * @returns Promise that resolves when the count operation completes
   */
  async countTotal(counts: CountTotalPayload[]): Promise<void> {
    return this.counting.countTotal(counts);
  }

  /**
   * Track unique items for one or more bucket/key combinations
   * 
   * @param counts - Array of unique count operations to perform
   * @returns Promise that resolves when the count operation completes
   */
  async countUnique(counts: CountUniquePayload[]): Promise<void> {
    return this.counting.countUnique(counts);
  }
}
