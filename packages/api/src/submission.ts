import { SlideType } from "./slideType";

export interface SubmissionPayload<T = any> {
  slideId: string | number;
  slideVersion: string | number;
  type: string;
  presentationId: string | number;
  attributes: T;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async sendSubmission<T>(slideType: SlideType, payload: SubmissionPayload<T>): Promise<Response> {
    const url = `${this.baseUrl}/api/live/submissions?slide_type=${slideType}`;

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }
}
