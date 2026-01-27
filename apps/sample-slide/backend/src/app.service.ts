import { Injectable, Logger } from '@nestjs/common';
import { SubmissionRequest, SubmissionResult, CountTotal } from '@aha/backend-utils';
import { getBucket } from '@aha/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

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
    const bucket = getBucket('sample-slide', { presentationId, slideId, slideVersion })
    const { increase, key } = attributes
    const count_total: CountTotal = [{
      bucket,
      key,
      increase_by: increase, // highest rank gets highest points
    }];

    const response: SubmissionResult = {
      count_total,
    };
    this.logger.log('Processing submission response', { response });
    return response;
  }
}
