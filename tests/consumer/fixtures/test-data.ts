import { vi } from 'vitest';

/**
 * Test data fixtures for consumer tests
 */

export const mockPresentationProps = {
  id: '123',
  language: 'en',
  fontFamily: 'Arial',
  showHyperLink: true,
  filteringProfanity: false,
  uniqueAccessCode: 'ABC123',
  shareCode: 'XYZ789',
  accessCode: 'ABC123',
  audiencePacing: false,
  presenting: true,
  audienceAdmission: 'auto',
};

export const mockSlideProps = {
  id: '456',
  version: 1,
  timeToAnswer: 60,
  quizTimestamp: Date.now(),
  multipleChoice: false,
  isCorrectGetPoint: true,
  fastAnswerGetMorePoint: false,
  minPoint: 0,
  maxPoint: 10,
  slideType: 'multiple-choice',
  isEnableStreakDetection: false,
  isEnableStreakBonus: false,
  hasTimeLimit: true,
  showVotingResultsOnAudience: true,
  imageSubmission: false,
  limitChoice: 4,
};

export const mockXProps = {
  presentation: mockPresentationProps,
  slide: mockSlideProps,
  baseUrl: 'https://test.ahaslide.com',
  onHeightChange: vi.fn(),
  getSlideAttributesAction: vi.fn(),
  upsertSlideAttributeAction: vi.fn(),
  subscribeTopic: vi.fn(),
  unsubscribeTopic: vi.fn(),
  audienceSendCountingUniqueAction: vi.fn(),
  uploadImage: vi.fn(),
};
