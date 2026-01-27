import { Injectable } from '@nestjs/common';
import { SubmissionRequest, SubmissionResult, CountTotal } from '@aha/backend-utils';
import { getBucket } from '@aha/common';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Process ranking slide answer submission
   */
  processSubmission(payload: SubmissionRequest) {
    const {
      attributes,
      slideId,
      presentationId,
      slideVersion,
    } = payload;
    const bucket = getBucket({ presentationId, slideId, slideVersion, name: 'sample-slide' })
    const { increase, key } = attributes
    const count_total: CountTotal = [{
      bucket,
      key,
      increase_by: increase, // highest rank gets highest points
    }];

    const response: SubmissionResult = {
      count_total,
    };
    console.log('Response', response);
    return response;
  }
}
