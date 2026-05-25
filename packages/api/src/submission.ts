import { SlideType } from "./slideType";
import { SubmissionPayload } from "@aha/common";
export { SubmissionPayload } from "@aha/common";
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  constructor(baseUrl: string, accessToken?: string) {
    this.baseUrl = baseUrl;
    if (accessToken) {
      this.headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  async fetchUrl(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      headers: this.headers,
      ...options
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return [202, 204].includes(response.status) ? undefined : response.json();
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

  /**
   * List by slideId with optional slideVersion and type (query params)
   * @param slideId 
   * @param slideVersion 
   * @param type 
   * @param limit
   * @param offset
   * @returns 
   */
  async getSubmissions<T>({ slideId, slideVersion, type }: {
    slideId: number,
    slideVersion?: number,
    type?: string,
  }, { limit, offset }: { limit?: number, offset?: number } = {}): Promise<(SubmissionPayload<T> & { id: string })[]> {
    const params = new URLSearchParams();
    params.append("slideId", slideId.toString());
    if (slideVersion) params.append("slideVersion", slideVersion.toString());
    if (type) params.append("type", type);
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());

    const url = `${this.baseUrl}/api/submissions?${params.toString()}`;
    const result = await this.fetchUrl(url);
    return result || [];
  }

  /**
   * List submissions of an audience
   * @param audienceId 
   * @param slideId 
   * @param slideVersion 
   * @param type 
   * @param limit
   * @param offset
   * @returns 
   */
  async getParticipantSubmissions<T>({ audienceId, slideId, slideVersion, type }: {
    audienceId: string,
    slideId: number,
    slideVersion?: number,
    type?: string,
  }, { limit, offset }: { limit?: number, offset?: number } = {}): Promise<(SubmissionPayload<T> & { id: string })[]> {
    const params = new URLSearchParams();
    params.append("slideId", slideId.toString());
    if (slideVersion) params.append("slideVersion", slideVersion.toString());
    if (type) params.append("type", type);
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());

    const url = `${this.baseUrl}/api/audiences/${audienceId}/submissions?${params.toString()}`;
    const result = await this.fetchUrl(url);
    return result || [];
  }

  /**
   * Get the current user's pinned slide types.
   * Requires presenter+ role.
   */
  async getPinnedSlideTypes(): Promise<string[]> {
    const url = `${this.baseUrl}/api/slide/pinned-slide-type`;
    const result = await this.fetchUrl(url);
    return result || [];
  }

  /**
   * Create or replace the current user's pinned slide types.
   * Requires presenter+ role.
   * @param slugs Array of slide type slugs (min 1, max 30)
   */
  async upsertPinnedSlideTypes(slugs: string[]): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/api/slide/pinned-slide-type`;
    return this.fetchUrl(url, {
      method: "POST",
      body: JSON.stringify({ slugs }),
    });
  }
}
