import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '@aha/api';

/**
 * Consumer tests for Pinned Slide Types API
 *
 * Contract (from stpancras-general-api PR #1924):
 *   GET  /api/slide/pinned-slide-type        → string[]  (presenter+ role)
 *   POST /api/slide/pinned-slide-type        → { ok: true }  (presenter+ role)
 *        body: { slugs: string[] }  (min 1, max 30)
 *
 * These tests verify the SDK ApiClient methods that will consume the above endpoints.
 */
describe('@aha/api - Pinned Slide Types', () => {
    const baseUrl = 'https://api.test.com';
    const token = 'test-presenter-token';
    let client: ApiClient;

    beforeEach(() => {
        client = new ApiClient(baseUrl, token);
        vi.stubGlobal('fetch', vi.fn());
    });

    // ─── GET pinned slide types ──────────────────────────────────────

    describe('getPinnedSlideTypes()', () => {
        it('should call GET /api/slide/pinned-slide-type with auth header', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(['poll', 'quiz', 'wordcloud']),
            } as Response);

            const result = await client.getPinnedSlideTypes();

            expect(fetch).toHaveBeenCalledWith(
                `${baseUrl}/api/slide/pinned-slide-type`,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${token}`,
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

            const result = await client.getPinnedSlideTypes();

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should throw when the request fails (e.g. 403 for non-presenter)', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
            } as Response);

            await expect(client.getPinnedSlideTypes()).rejects.toThrow();
        });

        it('should throw on network error', async () => {
            vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

            await expect(client.getPinnedSlideTypes()).rejects.toThrow('Failed to fetch');
        });
    });

    // ─── POST (upsert) pinned slide types ────────────────────────────

    describe('upsertPinnedSlideTypes()', () => {
        it('should call POST /api/slide/pinned-slide-type with slugs in body', async () => {
            const slugs = ['poll', 'quiz'];

            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
            } as Response);

            const result = await client.upsertPinnedSlideTypes(slugs);

            expect(fetch).toHaveBeenCalledWith(
                `${baseUrl}/api/slide/pinned-slide-type`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }),
                    body: JSON.stringify({ slugs }),
                }),
            );
            expect(result).toEqual({ ok: true });
        });

        it('should accept up to 30 slugs (maxPinnedTypes)', async () => {
            const slugs = Array.from({ length: 30 }, (_, i) => `slide-type-${i}`);

            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
            } as Response);

            const result = await client.upsertPinnedSlideTypes(slugs);

            expect(result).toEqual({ ok: true });
            expect(JSON.parse((fetch as any).mock.calls[0][1].body).slugs).toHaveLength(30);
        });

        it('should overwrite previous pins on subsequent calls', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
            } as Response);

            await client.upsertPinnedSlideTypes(['poll', 'quiz']);
            await client.upsertPinnedSlideTypes(['wordcloud', 'brainstorm']);

            // Second call should send the new slugs, not append
            const secondCallBody = JSON.parse((fetch as any).mock.calls[1][1].body);
            expect(secondCallBody.slugs).toEqual(['wordcloud', 'brainstorm']);
        });

        it('should throw when server returns 400 (validation error)', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
            } as Response);

            await expect(client.upsertPinnedSlideTypes([])).rejects.toThrow();
        });

        it('should throw when server returns 403 (non-presenter)', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
            } as Response);

            await expect(client.upsertPinnedSlideTypes(['poll'])).rejects.toThrow();
        });
    });

    // ─── Round-trip: upsert then get ─────────────────────────────────

    describe('round-trip contract', () => {
        it('should be able to pin types and then retrieve the same list', async () => {
            const slugs = ['ranking', 'ideaBoard', 'pinOnImage'];

            // Mock upsert
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
            } as Response);

            // Mock get (returns what was just upserted)
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(slugs),
            } as Response);

            await client.upsertPinnedSlideTypes(slugs);
            const result = await client.getPinnedSlideTypes();

            expect(result).toEqual(slugs);
        });
    });

    // ─── Payload shape validation (SDK-side) ─────────────────────────

    describe('payload shape', () => {
        it('should send slugs as a JSON array of strings', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
            } as Response);

            await client.upsertPinnedSlideTypes(['poll', 'quiz']);

            const body = JSON.parse((fetch as any).mock.calls[0][1].body);
            expect(body).toHaveProperty('slugs');
            expect(Array.isArray(body.slugs)).toBe(true);
            body.slugs.forEach((slug: unknown) => {
                expect(typeof slug).toBe('string');
            });
        });

        it('GET response should always be an array', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(['poll']),
            } as Response);

            const result = await client.getPinnedSlideTypes();

            expect(Array.isArray(result)).toBe(true);
            result.forEach((slug: unknown) => {
                expect(typeof slug).toBe('string');
            });
        });
    });
});
