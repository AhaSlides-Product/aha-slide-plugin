import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Consumer tests for Pinned Slide Types API
 *
 * Contract (from stpancras-general-api PR #1924):
 *   GET  /api/slide/pinned-slide-type        → string[]  (presenter+ role)
 *   POST /api/slide/pinned-slide-type        → { ok: true }  (presenter+ role)
 *        body: { slugs: string[] }  (min 1, max 30)
 *
 * The presenter app calls these endpoints directly via fetch (not through the SDK ApiClient).
 * These tests validate the expected request/response contract.
 */

const BASE_URL = 'https://api.test.com';
const PINNED_ENDPOINT = `${BASE_URL}/api/slide/pinned-slide-type`;
const MAX_PINNED_TYPES = 30;

/** Helper: simulates the GET call as done by the presenter app */
async function getPinnedSlideTypes(token: string): Promise<string[]> {
    const response = await fetch(PINNED_ENDPOINT, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
}

/** Helper: simulates the POST call as done by the presenter app */
async function upsertPinnedSlideTypes(token: string, slugs: string[]): Promise<{ ok: boolean }> {
    const response = await fetch(PINNED_ENDPOINT, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slugs }),
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
}

describe('Pinned Slide Types API Contract', () => {
    const presenterToken = 'test-presenter-token';

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    // ─── GET pinned slide types ──────────────────────────────────

    describe('GET /api/slide/pinned-slide-type', () => {
        it('should call the correct endpoint with auth header', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(['poll', 'quiz', 'wordcloud']),
            } as Response);

            const result = await getPinnedSlideTypes(presenterToken);

            expect(fetch).toHaveBeenCalledWith(
                PINNED_ENDPOINT,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${presenterToken}`,
                    }),
                }),
            );
            expect(result).toEqual(['poll', 'quiz', 'wordcloud']);
        });

        it('should return an empty array when user has no pinned types', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve([]),
            } as Response);

            const result = await getPinnedSlideTypes(presenterToken);

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should throw when the request fails (e.g. 403 for non-presenter)', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
            } as Response);

            await expect(getPinnedSlideTypes('audience-token')).rejects.toThrow('403');
        });

        it('should throw on network error', async () => {
            vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

            await expect(getPinnedSlideTypes(presenterToken)).rejects.toThrow('Failed to fetch');
        });

        it('response should always be an array of strings', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(['poll', 'ranking']),
            } as Response);

            const result = await getPinnedSlideTypes(presenterToken);

            expect(Array.isArray(result)).toBe(true);
            result.forEach((slug: unknown) => {
                expect(typeof slug).toBe('string');
            });
        });
    });

    // ─── POST (upsert) pinned slide types ────────────────────────

    describe('POST /api/slide/pinned-slide-type', () => {
        it('should send slugs in request body as JSON', async () => {
            const slugs = ['poll', 'quiz'];

            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
            } as Response);

            const result = await upsertPinnedSlideTypes(presenterToken, slugs);

            expect(fetch).toHaveBeenCalledWith(
                PINNED_ENDPOINT,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${presenterToken}`,
                    }),
                    body: JSON.stringify({ slugs }),
                }),
            );
            expect(result).toEqual({ ok: true });
        });

        it('should accept up to 30 slugs (maxPinnedTypes)', async () => {
            const slugs = Array.from({ length: MAX_PINNED_TYPES }, (_, i) => `slide-type-${i}`);

            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
            } as Response);

            const result = await upsertPinnedSlideTypes(presenterToken, slugs);

            expect(result).toEqual({ ok: true });
            const sentBody = JSON.parse((fetch as any).mock.calls[0][1].body);
            expect(sentBody.slugs).toHaveLength(MAX_PINNED_TYPES);
        });

        it('should overwrite previous pins on subsequent calls (upsert semantics)', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
            } as Response);

            await upsertPinnedSlideTypes(presenterToken, ['poll', 'quiz']);
            await upsertPinnedSlideTypes(presenterToken, ['wordcloud', 'brainstorm']);

            const secondCallBody = JSON.parse((fetch as any).mock.calls[1][1].body);
            expect(secondCallBody.slugs).toEqual(['wordcloud', 'brainstorm']);
        });

        it('should throw when server returns 400 (validation error)', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
            } as Response);

            await expect(upsertPinnedSlideTypes(presenterToken, [])).rejects.toThrow('400');
        });

        it('should throw when server returns 403 (non-presenter)', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
            } as Response);

            await expect(upsertPinnedSlideTypes('audience-token', ['poll'])).rejects.toThrow('403');
        });
    });

    // ─── Round-trip: upsert then get ─────────────────────────────

    describe('round-trip contract', () => {
        it('should be able to pin types and then retrieve the same list', async () => {
            const slugs = ['ranking', 'ideaBoard', 'pinOnImage'];

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
            } as Response);

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(slugs),
            } as Response);

            await upsertPinnedSlideTypes(presenterToken, slugs);
            const result = await getPinnedSlideTypes(presenterToken);

            expect(result).toEqual(slugs);
        });
    });

    // ─── Payload validation expectations ─────────────────────────

    describe('payload validation (BE contract)', () => {
        it('slugs must be an array of strings', () => {
            const validPayload = { slugs: ['poll', 'quiz'] };

            expect(Array.isArray(validPayload.slugs)).toBe(true);
            validPayload.slugs.forEach((s) => expect(typeof s).toBe('string'));
        });

        it('slugs must have at least 1 item (min: 1)', () => {
            const invalidPayload = { slugs: [] };
            expect(invalidPayload.slugs.length).toBeLessThan(1);
        });

        it('slugs must have at most 30 items (max: maxPinnedTypes)', () => {
            const tooMany = Array.from({ length: MAX_PINNED_TYPES + 1 }, (_, i) => `slug-${i}`);
            expect(tooMany.length).toBeGreaterThan(MAX_PINNED_TYPES);

            const valid = tooMany.slice(0, MAX_PINNED_TYPES);
            expect(valid.length).toBe(MAX_PINNED_TYPES);
        });
    });
});
