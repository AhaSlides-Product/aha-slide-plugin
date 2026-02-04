import { SlideType } from "./slideType";
import { SubmissionPayload } from "@aha/common";
export { SubmissionPayload } from "@aha/common";
export class ApiClient {
  private baseUrl: string;
  private headers = {
    "Content-Type": "application/json",
  };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchUrl(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      headers: this.headers,
      ...options
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return response.status === 202 ? {} : response.json();
  }

  /**
   * Send submission to liveproxy. This API is used by audience to submit their response.
   * @param slideType 
   * @param payload 
   * @returns 
   */
  async sendLiveSubmission<T>(slideType: SlideType, payload: SubmissionPayload<T>): Promise<Response> {
    const url = `${this.baseUrl}/api/live/submissions?slide_type=${slideType}`;

    return this.fetchUrl(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * This API is used by presenter to delete a submission.
   * @param submissionId 
   * @returns 
   */
  async deleteSubmission(submissionId: string): Promise<Response> {
    const url = `${this.baseUrl}/api/submissions/${submissionId}`;

    return this.fetchUrl(url, {
      method: "DELETE",
    });
  }

  async updateSubmission<T>(submissionId: string, payload: SubmissionPayload<T>): Promise<Response> {
    const url = `${this.baseUrl}/api/submissions/${submissionId}`;

    return this.fetchUrl(url, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
}
