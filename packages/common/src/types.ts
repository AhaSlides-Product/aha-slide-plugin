export enum SubmissionSenderType {
  Audience = 'audience',
  Presenter = 'presenter',
}

export interface SubmissionPayload<T = any> {
  slideId: string | number;
  slideVersion: string | number;
  type: string;
  presentationId: string | number;
  senderId: string;
  senderType: SubmissionSenderType;
  attributes: T;
}