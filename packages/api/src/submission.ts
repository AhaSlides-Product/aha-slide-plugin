import { SlideType } from "./slideType";
import { SubmissionPayload } from "@aha/common";
import {
  AnswerRequest,
  AnswerResultRequest,
  BaseLeaderboardScope,
  GetLeaderboardAroundRequest,
  GetLeaderboardSlideAroundRequest,
  GetLeaderboardSlideTopNRequest,
  GetLeaderboardTopNRequest,
  LeaderboardMultiResponse,
  LeaderboardResponse,
  ResetResultRequest,
} from "./answer";
export { SubmissionPayload } from "@aha/common";
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  private logFn?: (message: string) => void;

  constructor(
    baseUrl: string,
    accessToken?: string,
    options: { logFn?: (message: string) => void } = {},
  ) {
    this.baseUrl = baseUrl;
    if (accessToken) {
      this.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    this.logFn = options.logFn;
  }

  /** Fill in `timestamp` with the current time when the caller omitted it. */
  private withTimestamp<T extends { timestamp?: number }>(scope: T): T {
    return scope.timestamp == null ? { ...scope, timestamp: Date.now() } : scope;
  }

  async fetchUrl(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      headers: this.headers,
      ...options
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    if ([202, 204].includes(response.status)) {
      return undefined;
    }

    // Some endpoints (e.g. liveproxy answer results) reply 200 with an empty
    // body, which would make response.json() throw. Parse only when there is
    // a body to parse.
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
  }

  /**
   * Send submission to liveproxy. This API is used by audience to submit their response.
   * @param slideType
   * @param payload
   * @returns
   */
  async sendLiveSubmission<T>(slideType: SlideType, payload: SubmissionPayload<T>): Promise<Response> {
    const url = `${this.baseUrl}/api/live/submissions?slide_type=${slideType}`;

    this.logFn?.(`sendLiveSubmission ${slideType}: ${JSON.stringify(payload)}`);

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
   * Submit an answer to liveproxy. This API is used by audience to submit their answers.
   * The proxy forwards the answer upstream and returns the resulting scored answer payloads.
   * @param slideType slide type, sent as the `slide_type` query param
   * @param payload answer scope plus the slide-type-specific `data`
   * @returns the scored answer results
   */
  async createAnswer<T>(slideType: string, payload: AnswerRequest<T>): Promise<AnswerResultRequest> {
    const url = `${this.baseUrl}/api/live/answers?slide_type=${slideType}`;
    const body = this.withTimestamp(payload);

    this.logFn?.(`createAnswer: ${JSON.stringify(body)}`);

    return this.fetchUrl(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Persist manual results without going through the answer flow. This API is used by presenter.
   * Requires an authenticated (JWT) client.
   * @param payload the results to persist
   */
  async createAnswerResults(payload: AnswerResultRequest): Promise<void> {
    const url = `${this.baseUrl}/api/live/answers/results`;

    return this.fetchUrl(url, {
      method: "POST",
      body: JSON.stringify({
        results: payload.results.map((result) => this.withTimestamp(result)),
      }),
    });
  }

  /** Build the shared leaderboard query string from the base scope. */
  private toLeaderboardParams(scope: BaseLeaderboardScope): URLSearchParams {
    const params = new URLSearchParams();
    params.append("presentationId", scope.presentationId.toString());
    params.append("presentationVersion", scope.presentationVersion.toString());
    if (scope.scoreChannel) params.append("scoreChannel", scope.scoreChannel);
    if (scope.subject) params.append("subject", scope.subject);
    return params;
  }

  /**
   * Fetch the top-N leaderboard.
   * @param request base scope plus optional `slideId`, `aggregations` and `n`
   * @returns the ranked entries keyed by aggregation name
   */
  async getLeaderboardTopN(request: GetLeaderboardTopNRequest): Promise<LeaderboardMultiResponse> {
    const { n, aggregations, slideId, slideVersion, ...scope } = request;
    const params = this.toLeaderboardParams(scope);
    if (slideId) params.append("slideId", slideId.toString());
    if (slideVersion !== undefined) params.append("slideVersion", slideVersion.toString());
    if (aggregations) params.append("aggregations", JSON.stringify(aggregations));
    if (n !== undefined) params.append("n", n.toString());

    const url = `${this.baseUrl}/api/aha-sync/answers/leaderboards/topn?${params.toString()}`;
    return this.fetchUrl(url);
  }

  /**
   * Fetch the leaderboard slice around a subject.
   * @param request base scope plus the required `subjectId` and optional `slideId`, `aggregation` and `k`
   * @returns the ranked leaderboard entries around the subject
   */
  async getLeaderboardAround(request: GetLeaderboardAroundRequest): Promise<LeaderboardResponse> {
    const { k, subjectId, aggregation, slideId, slideVersion, ...scope } = request;
    const params = this.toLeaderboardParams(scope);
    if (slideId) params.append("slideId", slideId.toString());
    if (slideVersion !== undefined) params.append("slideVersion", slideVersion.toString());
    params.append("subjectId", subjectId);
    if (aggregation) params.append("aggregation", aggregation);
    if (k !== undefined) params.append("k", k.toString());

    const url = `${this.baseUrl}/api/aha-sync/answers/leaderboards/around?${params.toString()}`;
    return this.fetchUrl(url);
  }

  /**
   * Fetch the top-N leaderboard over a slide window.
   * Unlike {@link getLeaderboardTopN}, `oldScore` reflects the standings before the last slide.
   * @param request base scope plus the required `slideIds` and optional `aggregations` and `n`
   * @returns the ranked entries keyed by aggregation name
   */
  async getLeaderboardSlideTopN(request: GetLeaderboardSlideTopNRequest): Promise<LeaderboardMultiResponse> {
    const { n, aggregations, slideIds, ...scope } = request;
    const params = this.toLeaderboardParams(scope);
    params.append("slideIds", JSON.stringify(slideIds));
    if (aggregations) params.append("aggregations", JSON.stringify(aggregations));
    if (n !== undefined) params.append("n", n.toString());

    const url = `${this.baseUrl}/api/aha-sync/answers/leaderboards/slide/topn?${params.toString()}`;
    return this.fetchUrl(url);
  }

  /**
   * Fetch the leaderboard slice around a subject over a slide window.
   * @param request base scope plus the required `slideIds`/`subjectId` and optional `aggregation` and `k`
   * @returns the ranked leaderboard entries around the subject
   */
  async getLeaderboardSlideAround(request: GetLeaderboardSlideAroundRequest): Promise<LeaderboardResponse> {
    const { k, subjectId, aggregation, slideIds, ...scope } = request;
    const params = this.toLeaderboardParams(scope);
    params.append("slideIds", JSON.stringify(slideIds));
    params.append("subjectId", subjectId);
    if (aggregation) params.append("aggregation", aggregation);
    if (k !== undefined) params.append("k", k.toString());

    const url = `${this.baseUrl}/api/aha-sync/answers/leaderboards/slide/around?${params.toString()}`;
    return this.fetchUrl(url);
  }

  /**
   * Reset (delete) previously persisted results.
   * Narrow the scope with the optional `activityId` / `subActivityId` / `answerId` fields.
   * Requires an authenticated (JWT) client.
   * @param payload the scope of the results to reset
   */
  async resetAnswerResult(payload: ResetResultRequest): Promise<void> {
    const url = `${this.baseUrl}/api/live/answers/results`;

    return this.fetchUrl(url, {
      method: "DELETE",
      body: JSON.stringify(payload),
    });
  }
}
