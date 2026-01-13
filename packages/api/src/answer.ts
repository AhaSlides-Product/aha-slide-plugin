/**
 * Answer submission payload for quiz/poll slides
 */
export interface AnswerSubmissionPayload {
  presentation: number;
  presentationId: number;
  slideId: number;
  slide: number;
  slideVersion: number;
  audience: string;
  accessCode: string;
  slideTimestamp: string;
  config: {
    timeToAnswer?: number;
    quizTimestamp?: number[];
    multipleChoice?: boolean;
    isCorrectGetPoint?: boolean;
    stopSubmission?: boolean;
    fastAnswerGetMorePoint?: boolean;
    quizToken?: string;
    SlideOptions?: Array<{
      id: number;
      correct: boolean | null;
    }>;
    minPoint?: number;
    maxPoint?: number;
  };
  type: string;
  slideType: string;
  streakRelatedInfo?: {
    isEnableStreakDetection?: boolean;
    isEnableStreakBonus?: boolean;
    teamPlay?: boolean;
  };
  isDisableEveryoneHasAnswered?: boolean;
  vote: number[];
  audienceName?: string;
  audienceEmoji?: string;
}

/**
 * API client for answer submission endpoints
 * 
 * @example
 * ```typescript
 * const api = new AnswerAPI('/api/live');
 * 
 * await api.submitAnswer({
 *   presentationId: 195273,
 *   slideId: 657195,
 *   vote: [7238853],
 *   // ... other fields
 * });
 * ```
 */
export class AnswerAPI {
  private readonly baseUrl: string;

  /**
   * Creates a new AnswerAPI instance
   * 
   * @param baseUrl - Base URL for the API endpoints (e.g., '/api/live')
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Submit an answer for a quiz/poll slide
   * 
   * @param payload - Answer submission data
   * @returns Promise that resolves when the answer is submitted
   * 
   * @example
   * ```typescript
   * await api.submitAnswer({
   *   presentation: 195273,
   *   presentationId: 195273,
   *   slideId: 657195,
   *   slide: 657195,
   *   slideVersion: 1,
   *   audience: 'di_73851028c80d4b0d9dfb639936cea8dc-bb6f9953a8ad41a4',
   *   accessCode: 'm5xz3aou3t',
   *   slideTimestamp: '1768287827276',
   *   config: {
   *     timeToAnswer: 25,
   *     multipleChoice: false,
   *     SlideOptions: [
   *       { id: 7238853, correct: null },
   *       { id: 7238854, correct: true }
   *     ]
   *   },
   *   type: 'pickAnswer',
   *   slideType: 'imageChoice',
   *   vote: [7238853],
   *   audienceName: 'test',
   *   audienceEmoji: '🤹‍♂️'
   * });
   * ```
   */
  async submitAnswer(payload: AnswerSubmissionPayload): Promise<void> {
    const response = await fetch(`${this.baseUrl}/answer/create/v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit answer: ${response.status} ${response.statusText}`);
    }
  }
}
