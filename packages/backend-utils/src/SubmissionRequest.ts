/**
 * Data Transfer Object for ranking slide answer submission.
 */
export interface SubmissionRequest {
  /** The unique identifier of the presentation. */
  presentationId: number;
  /** The unique identifier of the slide. */
  slideId: number;
  /** The session identifier of the audience member. */
  audienceId: string;
  /** The version number of the slide being answered. */
  slideVersion: number;
  /** The ordered list of answer options selected by the audience. */
  attributes: any;
  /** The audience session ID. */
  audience: string;
  /** The display name of the audience member. */
  audienceName: string;
  /** The emoji representation of the audience member. */
  audienceEmoji: string;
}
