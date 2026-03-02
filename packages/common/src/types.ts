export enum SubmissionSenderType {
  Audience = 'audience',
  Presenter = 'presenter',
}

export interface SubmissionPayload<T = any> {
  presentationId: number;
  presentationVersion?: number;

  slideId: number;
  slideVersion: number;

  type: string;

  senderId: string;
  senderType: SubmissionSenderType;

  attributes: T;
}
