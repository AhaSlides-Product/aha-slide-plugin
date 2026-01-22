interface CurosrPagination {
  cursor: number;
  limit: number;
}

interface CountTotalPayload {
  bucket: string;
  key: string;
  increase_by: number;
}

interface CountTotalRequest {
  counts: CountTotalPayload[];
}

interface CountUniquePayload {
  bucket: string;
  key: string;
  item: string;
}

interface CountUniqueRequest {
  counts: CountUniquePayload[];
}

interface CountKey {
  bucket: string;
  key: string;
}

interface ResetCountRequest {
  keys: CountKey[];
}

interface SetTotalPayload {
  bucket: string;
  key: string;
  total: number;
  timestamp: number;
}

interface SetTotalRequest {
  totals: SetTotalPayload[];
}

enum CountType {
  TOTAL = 0,
  UNIQUE = 1
}

interface CountResult {
  count_type: CountType;
  total: number;
}

interface KvCreateRequest {
  path: string;
  end_parts: string;
  type: string;
  value: string;
  expire_at?: number;
  not_publish_mqtt?: boolean;
  not_persist?: boolean;
  not_retained_mqtt?: boolean;
  last_update_ts?: number;
  no_dedup_mqtt_publish?: boolean;
}

interface KvGetRequest {
  key: string;
}

interface KvGetResponse {
  key: string;
  path: string;
  value: string;
  delta: boolean;
  last_update_ts: number;
}

interface KvGetByPathRequest {
  path: string;
  cursor_path?: string;
  cursor_key?: string;
  limit?: number;
}

interface KvGetByPathResponse {
  path: string;
  keysvalues: KvGetResponse[];
}

interface Submission {
  id: string
  type: string
  slideId: number;
  slideVersion: number;
  data: any;
  createdAt: Date;
}

interface CreateSubmissionRequest {
  type: string
  slideId: number;
  slideVersion: number;
  data: any;
}

interface CreateSubmissionsRequest {
  submissions: CreateSubmissionRequest[];
}

interface UpdateSubmissionRequest {
  id: string
  data: any;
}

interface UpdateSubmissionsRequest {
  updates: UpdateSubmissionRequest[];
}

interface GetSubmissionsRequest {
  slideId: number;
  slideVersion: number;
  type: string;
  pagination: CurosrPagination;
}

interface GetSubmissionsResponse {
  submissions: Submission[];
}

interface SlideAttribute {
  id: string;
  slideId: number;
  type: string;
  attributes: any;
  createdAt: Date;
  updatedAt: Date;
}

interface FindSlideAttributesRequest {
  presentationId?: number;
  slideIds: number[];
  types: string[];
}

interface UpsertSlideAttributeRequest {
  slideId: number;
  attributeKey: string;
  attributeValue: any;
}

const defaultMaxRetries = 5;
const defaultTimeoutSeconds = 30;
const defaultBackOffTriesSeconds = [1, 1, 2, 3, 5, 8];

interface HttpClientOptions {
  baseUrl: string;
  timeoutSeconds?: number;
  backOffTriesSeconds?: number[];
  maxRetries?: number;
}

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  timeout?: number;
}

class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutSeconds: number;
  private readonly backOffTriesSeconds: number[];
  private readonly maxRetries: number;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.timeoutSeconds = options.timeoutSeconds ?? defaultTimeoutSeconds;
    this.backOffTriesSeconds = options.backOffTriesSeconds ?? defaultBackOffTriesSeconds;
    this.maxRetries = options.maxRetries ?? defaultMaxRetries;
  }

  private sleep(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path.startsWith('http') ? path : `${this.baseUrl}${path}`,
                        this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async doRequest<T = any>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    options: RequestOptions = {},
  ): Promise<T> {
    const requestUrl = this.buildUrl(url, options.params);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Exponential backoff on retry
        if (attempt > 0) {
          const backoffSeconds = this.backOffTriesSeconds[
            Math.min(attempt - 1, this.backOffTriesSeconds.length - 1)
          ];
          await this.sleep(backoffSeconds);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutSeconds * 1000);

        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
        };

        if (options.body !== undefined) {
          fetchOptions.body = typeof options.body === 'string'
            ? options.body
            : JSON.stringify(options.body);
        }

        const response = await fetch(requestUrl, fetchOptions);
        clearTimeout(timeoutId);

        // Retry on 5xx errors or 408 (timeout)
        const isRetryableStatus = response.status >= 500 || response.status === 408;
        if (isRetryableStatus && attempt < this.maxRetries) {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return (await response.json()) as T;
        }

        return (await response.text()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Abort errors are not retryable (timeout)
        if (lastError.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${this.timeoutSeconds}s`);
          // Still retry timeout errors as they may be transient
          if (attempt < this.maxRetries) {
            continue;
          }
        }

        if (attempt >= this.maxRetries) {
          throw lastError;
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  async get<T = any>(path: string, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    return this.doRequest<T>(path, 'GET', options);
  }

  async post<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.doRequest<T>(path, 'POST', options);
  }

  async put<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.doRequest<T>(path, 'PUT', options);
  }

  async delete<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.doRequest<T>(path, 'DELETE', options);
  }

  async patch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.doRequest<T>(path, 'PATCH', options);
  }
}

export { HttpClient, type HttpClientOptions, type RequestOptions };
export type {
  CurosrPagination,
  CountTotalPayload,
  CountTotalRequest,
  CountUniquePayload,
  CountUniqueRequest,
  CountKey,
  ResetCountRequest,
  SetTotalPayload,
  SetTotalRequest,
  CountResult,
  KvCreateRequest,
  KvGetRequest,
  KvGetResponse,
  KvGetByPathRequest,
  KvGetByPathResponse,
  Submission,
  CreateSubmissionsRequest as CreateSubmissionRequest,
  UpdateSubmissionsRequest as UpdateSubmissionRequest,
  GetSubmissionsRequest,
  GetSubmissionsResponse,
  SlideAttribute,
  FindSlideAttributesRequest,
  UpsertSlideAttributeRequest,
};

export default class AhaSDK {
  private generalApiBaseUrl: string;
  private ahasyncApiBaseUrl: string;
  private liveproxyApiBaseUrl: string;
  private jwtToken: string | null = null;

  constructor(
    private readonly pluginNamespace: string,
    private readonly apiBaseUrl: string,
    private readonly httpClient: HttpClient,
    jwtToken?: string,
  ) {
    this.generalApiBaseUrl = `${apiBaseUrl}/api`;
    this.ahasyncApiBaseUrl = `${apiBaseUrl}/api/aha-sync/kv`;
    this.liveproxyApiBaseUrl = `${apiBaseUrl}/api/live`;
    this.jwtToken = jwtToken || null;
  }

  public setJwtToken(token: string): void {
    this.jwtToken = token;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.jwtToken) {
      return {};
    }
    return {
      'Authorization': `Bearer ${this.jwtToken}`,
    };
  }

  public async countTotal(request: CountTotalRequest): Promise<void> {
    const url = `${this.liveproxyApiBaseUrl}/counting/total`;
    await this.httpClient.put(url, { body: request });
  }

  public async countUnique(request: CountUniqueRequest): Promise<void> {
    const url = `${this.liveproxyApiBaseUrl}/counting/unique`;
    await this.httpClient.put(url, { body: request });
  }

  public async resetCountTotal(request: ResetCountRequest): Promise<void> {
    const url = `${this.liveproxyApiBaseUrl}/counting/total`;
    await this.httpClient.delete(url, {
      body: request,
      headers: this.getAuthHeaders(),
    });
  }

  public async resetCountUnique(request: ResetCountRequest): Promise<void> {
    const url = `${this.liveproxyApiBaseUrl}/counting/unique`;
    await this.httpClient.delete(url, {
      body: request,
      headers: this.getAuthHeaders(),
    });
  }

  public async setTotal(request: SetTotalRequest): Promise<void> {
    const url = `${this.liveproxyApiBaseUrl}/counting/total`;
    await this.httpClient.patch(url, {
      body: request,
      headers: this.getAuthHeaders(),
    });
  }

  public async kvCreate(request: KvCreateRequest): Promise<void> {
    const url = `${this.ahasyncApiBaseUrl}`;
    await this.httpClient.post(url, {
      body: request,
      headers: this.getAuthHeaders(),
    });
  }

  public async kvGet(request: KvGetRequest): Promise<KvGetResponse> {
    const url = `${this.ahasyncApiBaseUrl}`;
    return this.httpClient.get<KvGetResponse>(url, {
      params: {
        key: request.key,
      },
    });
  }

  public async kvGetByPath(request: KvGetByPathRequest): Promise<KvGetByPathResponse> {
    const url = `${this.ahasyncApiBaseUrl}/paths`;
    return this.httpClient.get<KvGetByPathResponse>(url, {
      params: {
        path: request.path,
        ...(request.cursor_path && { cursor_path: request.cursor_path }),
        ...(request.cursor_key && { cursor_key: request.cursor_key }),
        ...(request.limit && { limit: request.limit }),
      },
    });
  }

  public async upsertSlideAttribute(request: UpsertSlideAttributeRequest): Promise<SlideAttribute> {
    const url = `${this.generalApiBaseUrl}/v2/slides/${request.slideId}/attributes`;
    return this.httpClient.post<SlideAttribute>(url, {
      body: request,
      headers: this.getAuthHeaders(),
    });
  }

  public async findSlideAttributes(request: FindSlideAttributesRequest): Promise<SlideAttribute[]> {
    const url = `${this.generalApiBaseUrl}/v2/slides/attributes`;
    return this.httpClient.get<SlideAttribute[]>(url, {
      params: {
        ...(request.presentationId && { presentationId: request.presentationId }),
        ...(request.slideIds?.length && { slideIds: request.slideIds.join(',') }),
        ...(request.types?.length && { types: request.types.join(',') }),
      },
    });
  }

  public async createSubmissions(request: CreateSubmissionsRequest): Promise<Submission[]> {
    throw new Error('Method not implemented.');
  }

  public async getSubmissionsByIds(ids: string[]): Promise<Submission[]> {
    throw new Error('Method not implemented.');
  }

  public async getSlideSubmissions(request: GetSubmissionsRequest): Promise<GetSubmissionsResponse> {
    throw new Error('Method not implemented.');
  }

  public async updateSubmissions(request: UpdateSubmissionsRequest): Promise<Submission[]> {
    throw new Error('Method not implemented.');
  }

  public async deleteSubmission(ids: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
