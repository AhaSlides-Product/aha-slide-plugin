import type { CountTotalPayload, CountUniquePayload } from './types';

/**
 * API client for AhaSlides counting endpoints
 * 
 * @example
 * ```typescript
 * const api = new CountingAPI('/api/live');
 * 
 * await api.countTotal([
 *   { bucket: 'presentation-123', key: 'views', increaseBy: 1 }
 * ]);
 * 
 * await api.countUnique([
 *   { bucket: 'presentation-123', key: 'unique-viewers', item: 'user-456' }
 * ]);
 * ```
 */
export class CountingAPI {
  private readonly baseUrl: string;

  /**
   * Creates a new CountingAPI instance
   * 
   * @param baseUrl - Base URL for the API endpoints (e.g., '/api/live')
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Increment total counts for one or more bucket/key combinations
   * 
   * @param counts - Array of count operations to perform
   * @returns Promise that resolves when the count operation completes
   * 
   * @example
   * ```typescript
   * await api.countTotal([
   *   { bucket: 'presentation-123', key: 'views', increaseBy: 1 },
   *   { bucket: 'presentation-123', key: 'interactions', increaseBy: 5 }
   * ]);
   * ```
   */
  async countTotal(counts: CountTotalPayload[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/counting/total`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ counts }),
    });

    if (!response.ok) {
      throw new Error(`Failed to count total: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Track unique items for one or more bucket/key combinations
   * 
   * @param counts - Array of unique count operations to perform
   * @returns Promise that resolves when the count operation completes
   * 
   * @example
   * ```typescript
   * await api.countUnique([
   *   { bucket: 'presentation-123', key: 'unique-viewers', item: 'user-456' },
   *   { bucket: 'presentation-123', key: 'unique-participants', item: 'user-789' }
   * ]);
   * ```
   */
  async countUnique(counts: CountUniquePayload[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/counting/unique`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ counts }),
    });

    if (!response.ok) {
      throw new Error(`Failed to count unique: ${response.status} ${response.statusText}`);
    }
  }
}
