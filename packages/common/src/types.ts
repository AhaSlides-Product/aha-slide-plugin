export enum SubmissionSenderType {
  Audience = 'audience',
  Presenter = 'presenter',
}

export enum SubmissionType {
  Response = 'response',
}

export interface SubmissionPayload<T = any> {
  presentationId: number;
  presentationVersion?: number;

  slideId: number;
  slideVersion: number;

  type: SubmissionType | string;

  senderId: string;
  senderType: SubmissionSenderType;

  attributes: T;
}
