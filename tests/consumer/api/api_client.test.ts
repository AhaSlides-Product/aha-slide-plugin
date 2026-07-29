import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, SlideType } from '@aha/api';

describe('@aha/api - ApiClient', () => {
    const baseUrl = 'https://api.test.com';
    const token = 'test-token';
    let client: ApiClient;

    const mockOk = (body: unknown, status = 200) =>
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status,
            text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
        } as Response);

    /** The body passed to the Nth fetch call, parsed back from JSON. */
    const sentBody = (call = 0) => JSON.parse((vi.mocked(fetch).mock.calls[call][1] as RequestInit).body as string);

    beforeEach(() => {
        client = new ApiClient(baseUrl, token);
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should attach the bearer token when provided', async () => {
        mockOk({ success: true });

        await client.fetchUrl(`${baseUrl}/test`);

        expect(fetch).toHaveBeenCalledWith(`${baseUrl}/test`, expect.objectContaining({
            headers: expect.objectContaining({ 'Authorization': `Bearer ${token}` }),
        }));
    });

    it('should throw when the response is not ok', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false, statusText: 'Not Found' } as Response);

        await expect(client.fetchUrl(`${baseUrl}/fail`)).rejects.toThrow('Failed to fetch https://api.test.com/fail: Not Found');
    });

    it('should return undefined for empty or no-content responses', async () => {
        mockOk(undefined, 204);
        expect(await client.fetchUrl(`${baseUrl}/no-content`)).toBeUndefined();

        mockOk(undefined, 200);
        expect(await client.fetchUrl(`${baseUrl}/empty-body`)).toBeUndefined();
    });

    it('should fill timestamp on createAnswer only when the caller omits it', async () => {
        vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000);
        mockOk({ answerId: 'a-1', results: [] });

        await client.createAnswer(SlideType.SampleSlide, {
            presentationId: 1, presentationVersion: 2, participantId: 'p-1', slideId: 3, slideVersion: 1, data: {},
        });
        expect(sentBody().timestamp).toBe(1_700_000_000);

        await client.createAnswer(SlideType.SampleSlide, {
            presentationId: 1, presentationVersion: 2, participantId: 'p-1', slideId: 3, slideVersion: 1, timestamp: 42, data: {},
        });
        expect(sentBody(1).timestamp).toBe(42);
    });

    it('should fill timestamp on every result of createAnswerResults', async () => {
        vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000);
        mockOk(undefined);

        await client.createAnswerResults({
            results: [
                { resultId: 'r-1', presentationId: 1, presentationVersion: 2, participantId: 'p-1', slideId: 3, slideVersion: 1 },
                { resultId: 'r-2', presentationId: 1, presentationVersion: 2, participantId: 'p-1', slideId: 3, slideVersion: 1, timestamp: 42 },
            ],
        });

        const { results } = sentBody();
        expect(results.map((r: { timestamp: number }) => r.timestamp)).toEqual([1_700_000_000, 42]);
    });

    it('should unwrap the answers array, defaulting to empty', async () => {
        mockOk({ answers: [{ labels: {}, data: {}, timestamp: 1 }] });
        expect(await client.getSlideAnswers({ presentationId: 1, presentationVersion: 2, slideId: 3, slideVersion: 1 })).toHaveLength(1);

        mockOk(undefined);
        expect(await client.getSlideAnswers({ presentationId: 1, presentationVersion: 2, slideId: 3, slideVersion: 1 })).toEqual([]);
    });

    // The path + query serialization is the wire contract with aha-sync; a typo
    // (/scores -> /score, subjectId -> subject_id) is a silent 400 no type check catches.
    it('should build the correct URL for the new answerstats endpoints', async () => {
        mockOk({});
        const scope = { presentationId: 1, presentationVersion: 2 };

        await client.getLeaderboardSlideStreaks({ ...scope, slideId: 10 });
        await client.getScore({ ...scope, slideIds: [10, 11], subjectId: 's-1', aggregation: 'first_score' });
        await client.getStats({ ...scope, slideIds: [10, 11], subjectId: 's-1' });

        const ids = encodeURIComponent(JSON.stringify([10, 11]));
        expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual([
            `${baseUrl}/api/aha-sync/answers/leaderboards/slide/streaks?presentationId=1&presentationVersion=2&slideId=10`,
            `${baseUrl}/api/aha-sync/answers/scores?presentationId=1&presentationVersion=2&slideIds=${ids}&subjectId=s-1&aggregation=first_score`,
            `${baseUrl}/api/aha-sync/answers/stats?presentationId=1&presentationVersion=2&slideIds=${ids}&subjectId=s-1`,
        ]);
    });
});
