import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubmitAnswerDto } from '@aha/backend-utils';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('index', () => {
    it('should return "OK"', () => {
      expect(appController.index()).toBe('OK');
    });
  });

  describe('submitAnswer', () => {
    it('should call appService.processAnswer', () => {
      const payload: SubmitAnswerDto = {
        presentationId: 1,
        slideId: 2,
        audienceId: 'aud1',
        slideVersion: 1,
        answer: ['opt1'],
        audience: 'aud',
        audienceName: 'Audience Name',
        audienceEmoji: '😊',
        slideData: {},
      };
      const result = { some: 'result' };
      jest.spyOn(appService, 'processAnswer').mockReturnValue(result as any);

      expect(appController.submitAnswer(payload)).toBe(result);
      expect(appService.processAnswer).toHaveBeenCalledWith(payload);
    });
  });
});
