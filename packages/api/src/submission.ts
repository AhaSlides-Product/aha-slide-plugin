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

  async sendSubmission<T>(payload: SubmissionPayload<T>): Promise<Response> {
    const url = `${this.baseUrl}/api/live/submissions?slide_type=${payload.type}`;

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }
}
