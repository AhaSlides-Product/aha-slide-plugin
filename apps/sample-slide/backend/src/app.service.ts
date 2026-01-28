import { Injectable, Logger } from '@nestjs/common';
import { SubmissionRequest, SubmissionResult, CountTotal, Sync } from '@aha/backend-utils';
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

    // aggregate into a count 
    const count_total: CountTotal = [{
      bucket,
      key,
      increase_by: increase,
    }];

    // echo the submission to subscribers
    const broadcast: Sync = [{
      path: getBucket('sample-submissions', { presentationId, slideId, slideVersion }),
      value: JSON.stringify(payload),
    }];

    const response: SubmissionResult = {
      count_total,
      sync: broadcast,
    };
    this.logger.log('Processing submission response', { response });
    return response;
  }
}
