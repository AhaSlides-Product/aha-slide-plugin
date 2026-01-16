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
    const count_total: CountTotal = answer.map((option: any, index: number) => ({
      bucket: `presentation-${presentationId}/ranking/${statsType}/${aggregationLevel}/${slideId}/${slideVersion}`,
      key: `${option}`,
      increase_by: n - index, // highest rank gets highest points
    }));

    const response: AnswerResult = {
      submission: payload,
      count_total,
    };
    console.log('Response', response);
    return response;
  }
}
