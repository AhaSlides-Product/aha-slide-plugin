import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubmissionSenderType, SubmissionType, type SubmissionPayload } from '@aha/common';
import { PickAttributes } from './dto';

describe('Preference Grouping > backend controller', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = moduleRef.get<AppController>(AppController);
  });

  it('Verify that the health check returns OK', () => {
    expect(controller.index()).toBe('OK');
  });

  it('Verify that a pick submission is counted uniquely without leaking picks', () => {
    const payload: SubmissionPayload<PickAttributes> = {
      presentationId: 1,
      presentationVersion: 1,
      slideId: 2,
      slideVersion: 1,
      type: SubmissionType.Response,
      senderId: 'p1',
      senderType: SubmissionSenderType.Audience,
      attributes: { pickedPeerIds: ['p2', 'p3'] },
    };

    const result = controller.submitPicks(payload);

    expect(result.count_unique?.[0].item).toBe('p1');
    // The live topic ping must never carry the picks — only the sender id.
    const published = JSON.parse(result.sync?.[0].value ?? '{}');
    expect(published).toEqual({ senderId: 'p1' });
  });

  it('Verify that form-groups returns balanced groups covering every participant', () => {
    const participantIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const result = controller.formGroups({
      participantIds,
      picks: { a: ['b'], b: ['a'], c: ['d'], d: ['c'] },
      targetSize: 4,
    });

    const placed = result.groups.flatMap((g) => g.memberIds).sort();
    expect(placed).toEqual([...participantIds].sort());
    expect(result.groups.every((g) => g.id.startsWith('group-'))).toBe(true);
  });
});
