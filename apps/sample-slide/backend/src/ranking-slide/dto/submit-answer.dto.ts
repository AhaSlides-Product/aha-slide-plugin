/**
 * DTO for ranking slide answer submission
 */
export class SubmitAnswerDto {
  presentationId: number;
  slideId: number;
  audienceId: string;
  slideVersion: number;
  answer: string[];
  audience: string;
  audienceName: string;
  audienceEmoji: string;
}

