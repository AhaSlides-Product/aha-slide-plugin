import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Base for API Objects — one subclass per resource (SurveyApi, UserApi, ...).
 *
 * API Objects return the raw APIResponse plus parsed body. They do NOT assert:
 * status-code and schema assertions belong in the spec, so one object can serve both
 * the happy-path test and the 4xx tests.
 */
export abstract class BaseApi {
  constructor(protected readonly request: APIRequestContext) {}

  protected abstract readonly resource: string;

  protected async parse<T>(res: APIResponse): Promise<{ res: APIResponse; body: T }> {
    const text = await res.text();
    let body: T;
    try {
      body = text ? (JSON.parse(text) as T) : (undefined as T);
    } catch {
      // Leave the raw text reachable — a non-JSON body is usually the actual bug.
      body = text as unknown as T;
    }
    return { res, body };
  }

  async list<T>(query: Record<string, string> = {}) {
    return this.parse<T>(await this.request.get(this.resource, { params: query }));
  }

  async create<T>(payload: unknown) {
    return this.parse<T>(await this.request.post(this.resource, { data: payload }));
  }

  async get<T>(id: string) {
    return this.parse<T>(await this.request.get(`${this.resource}/${id}`));
  }

  async remove<T>(id: string) {
    return this.parse<T>(await this.request.delete(`${this.resource}/${id}`));
  }
}
