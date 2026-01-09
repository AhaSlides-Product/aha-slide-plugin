import { Injectable } from '@nestjs/common';
import { SubmitAnswerDto, AnswerResult, CountTotal } from '@aha/backend-utils';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Process ranking slide answer submission
   */
  processAnswer(payload: SubmitAnswerDto) {
    const {
      answer,
      slideId,
      presentationId,
      slideVersion,
      audience,
      audienceName,
      audienceEmoji,
    } = payload;

    const n = answer.length;
    const statsType = 'count';
    const aggregationLevel = 'option';
    const count_total: CountTotal = answer.map((option, index) => ({
      bucket: `presentation-${presentationId}/ranking/${statsType}/${aggregationLevel}/${slideId}/${slideVersion}`,
      key: `${option}`,
      increase_by: n - index, // highest rank gets highest points
    }));

    // fake scoring logic
    const point = 1;

    const response: AnswerResult = {
      presentation: presentationId,
      slide: slideId,
      version: slideVersion,
      count_total,
      point,
      audience,
      audienceName,
      audienceEmoji,
      correct: true,
      data: JSON.stringify(answer),
    };
    console.log('Response', response);
    return response;
  }
}
