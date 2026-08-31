import { Injectable, Logger } from '@nestjs/common';
import { CountUnique, SubmissionRequest, SubmissionResult, Sync } from '@aha/backend-utils';
import { getBucket } from '@aha/common';
import { formGroups } from './grouping';
import {
  FormGroupsRequestDto,
  FormGroupsResponseDto,
  MAX_PICKS_PER_PERSON,
  SUBMITTED_BUCKET,
} from './dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  /**
   * Handle one participant's pick submission.
   *
   * Emits a unique-submitter count so the presenter can show "X of Y
   * submitted", and pings a live topic carrying ONLY the sender id — never the
   * picks — so the canvas tally updates in real time while individual choices
   * stay private.
   */
  processSubmission(payload: SubmissionRequest): SubmissionResult {
    const { presentationId, slideId, slideVersion, senderId } = payload;
    const bucketConfig = { presentationId, slideId, slideVersion };

    const count_unique: CountUnique = [
      {
        bucket: getBucket(SUBMITTED_BUCKET, bucketConfig),
        key: 'submission_count',
        item: senderId,
      },
    ];

    const sync: Sync = [
      {
        path: getBucket(SUBMITTED_BUCKET, bucketConfig),
        value: JSON.stringify({ senderId }),
      },
    ];

    return { count_unique, sync };
  }

  /** Run the server-side group-formation algorithm over the collected picks. */
  computeGroups(request: FormGroupsRequestDto): FormGroupsResponseDto {
    const { groups, seed } = formGroups({
      participantIds: request.participantIds ?? [],
      picks: this.capPickLists(request.picks ?? {}),
      targetSize: request.targetSize,
      minSize: request.minSize,
      seed: request.seed,
    });

    return {
      groups: groups.map((memberIds, index) => ({
        id: `group-${index + 1}`,
        memberIds,
      })),
      seed,
    };
  }

  /**
   * Trim every pick list to the authoritative per-person limit so a client that
   * bypasses its own cap can't submit an over-long pick array.
   */
  private capPickLists(picks: Record<string, string[]>): Record<string, string[]> {
    const capped: Record<string, string[]> = {};
    for (const [picker, chosen] of Object.entries(picks)) {
      capped[picker] = Array.isArray(chosen) ? chosen.slice(0, MAX_PICKS_PER_PERSON) : [];
    }
    return capped;
  }
}
