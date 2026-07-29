import { SubmissionPayload } from "@aha/common";
import {
  AnswerRecord,
  AnswerRequest,
  AnswerResponse,
  AnswerResultRequest,
  BaseLeaderboardScope,
  GetParticipantSlideAnswersRequest,
  GetSlideAnswersRequest,
  GetLeaderboardAroundRequest,
  GetLeaderboardSlideAroundRequest,
  GetLeaderboardSlideTopNRequest,
  GetLeaderboardSlideStreakRequest,
  GetLeaderboardTopNRequest,
  GetScoreRequest,
  GetStatsRequest,
  LeaderboardResponse,
  LeaderboardStreakResponse,
  ResetResultRequest,
  ScoreResponse,
  StatsResponse,
} from "./answer";
import { SlideType } from "./slideType";

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
  private withTimestamp<T extends { timestamp?: number }>(request: T): T {
    return request.timestamp == null ? { ...request, timestamp: Date.now() } : request;
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
  async createAnswer<T>(slideType: string, payload: AnswerRequest<T>): Promise<AnswerResponse> {
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

  /**
   * Read one participant's answers for a slide (AnswersV3) — audience-facing, no
   * auth. Omit `questionId` to match every question. Returns the raw answer rows.
   */
  async getParticipantSlideAnswers<T = unknown>(request: GetParticipantSlideAnswersRequest): Promise<AnswerRecord<T>[]> {
    const url = `${this.baseUrl}/api/answers/v3/slide/participant?${this.toAnswersV3Params(request)}`;
    const body = await this.fetchUrl(url);
    return body?.answers ?? [];
  }

  /**
   * Read a slide's answers (AnswersV3) — presenter-facing, requires an access
   * token. Omit `participantId` to read every participant; page with `limit`/`offset`.
   */
  async getSlideAnswers<T = unknown>(request: GetSlideAnswersRequest): Promise<AnswerRecord<T>[]> {
    const url = `${this.baseUrl}/api/answers/v3/slide?${this.toAnswersV3Params(request)}`;
    const body = await this.fetchUrl(url);
    return body?.answers ?? [];
  }

  /** Build the AnswersV3 read query string (participantId optional). */
  private toAnswersV3Params(request: GetSlideAnswersRequest): URLSearchParams {
    const params = new URLSearchParams();
    params.append("presentationId", request.presentationId.toString());
    params.append("presentationVersion", request.presentationVersion.toString());
    params.append("slideId", request.slideId.toString());
    params.append("slideVersion", request.slideVersion.toString());
    if (request.participantId) params.append("participantId", request.participantId);
    if (request.questionId) params.append("questionId", request.questionId);
    if (request.limit != null) params.append("limit", request.limit.toString());
    if (request.offset != null) params.append("offset", request.offset.toString());
    return params;
  }

  /** Build the shared leaderboard query string from the base scope. */
  private toLeaderboardParams(scope: BaseLeaderboardScope): URLSearchParams {
    const params = new URLSearchParams();
    params.append("presentationId", scope.presentationId.toString());
    params.append("presentationVersion", scope.presentationVersion.toString());
    if (scope.subject) params.append("subject", scope.subject);
    return params;
  }

  /**
   * Fetch the top-N leaderboard.
   * @param request base scope plus optional `slideId`, `aggregation` and `n`
   * @returns the ranked entries keyed by aggregation name
   */
  async getLeaderboardTopN(request: GetLeaderboardTopNRequest): Promise<LeaderboardResponse> {
    const { n, aggregation, slideId, slideVersion, ...scope } = request;
    const params = this.toLeaderboardParams(scope);
    if (slideId) params.append("slideId", slideId.toString());
    if (slideVersion !== undefined) params.append("slideVersion", slideVersion.toString());
    if (aggregation) params.append("aggregation", aggregation);
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
   * Unlike {@link getLeaderboardTopN}, `oldScore` reflects the standings as of `lastSlideId`.
   * @param request base scope plus the required `slideIds` and optional `lastSlideId`, `aggregation` and `n`
   * @returns the ranked entries keyed by aggregation name
   */
  async getLeaderboardSlideTopN(request: GetLeaderboardSlideTopNRequest): Promise<LeaderboardResponse> {
    const { n, aggregation, slideIds, lastSlideId, ...scope } = request;
    const params = this.toLeaderboardParams(scope);
    params.append("slideIds", JSON.stringify(slideIds));
    if (lastSlideId !== undefined) params.append("lastSlideId", lastSlideId.toString());
    if (aggregation) params.append("aggregation", aggregation);
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
   * Fetch the top current-streak and longest-streak leaders for a single slide.
   * @param request presentation scope plus the `slideId` to read streaks for
   * @returns the current-streak and longest-streak leader lists
   */
  async getLeaderboardSlideStreaks(request: GetLeaderboardSlideStreakRequest): Promise<LeaderboardStreakResponse> {
    const params = new URLSearchParams();
    params.append("presentationId", request.presentationId.toString());
    params.append("presentationVersion", request.presentationVersion.toString());
    params.append("slideId", request.slideId.toString());

    const url = `${this.baseUrl}/api/aha-sync/answers/leaderboards/slide/streaks?${params.toString()}`;
    return this.fetchUrl(url);
  }

  /**
   * Fetch a single subject's score over a slide window.
   * @param request base scope plus the required `slideIds`/`subjectId` and optional `aggregation`
   * @returns the subject score and, for teams, the first-scoring member
   */
  async getScore(request: GetScoreRequest): Promise<ScoreResponse> {
    const { slideIds, subjectId, aggregation, ...scope } = request;
    const params = this.toLeaderboardParams(scope);
    params.append("slideIds", JSON.stringify(slideIds));
    params.append("subjectId", subjectId);
    if (aggregation) params.append("aggregation", aggregation);

    const url = `${this.baseUrl}/api/aha-sync/answers/scores?${params.toString()}`;
    return this.fetchUrl(url);
  }

  /**
   * Fetch a single subject's stats (streaks + answer counts) over a slide window.
   * Aggregation-independent — streaks are only populated for `subject=participant`.
   * @param request base scope plus the required `slideIds`/`subjectId`
   * @returns the subject's current/longest streak and answer/correct-answer counts
   */
  async getStats(request: GetStatsRequest): Promise<StatsResponse> {
    const { slideIds, subjectId, ...scope } = request;
    const params = this.toLeaderboardParams(scope);
    params.append("slideIds", JSON.stringify(slideIds));
    params.append("subjectId", subjectId);

    const url = `${this.baseUrl}/api/aha-sync/answers/stats?${params.toString()}`;
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
