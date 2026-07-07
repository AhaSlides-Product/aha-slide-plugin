import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient, SlideType } from '@aha/api';

describe('@aha/api - ApiClient', () => {
    const baseUrl = 'https://api.test.com';
    const token = 'test-token';
    let client: ApiClient;

    beforeEach(() => {
        client = new ApiClient(baseUrl, token);
        vi.stubGlobal('fetch', vi.fn());
    });

    it('should include Authorization header if token is provided', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify({ success: true })),
        } as Response);

        await client.fetchUrl(`${baseUrl}/test`);

        expect(fetch).toHaveBeenCalledWith(`${baseUrl}/test`, expect.objectContaining({
            headers: expect.objectContaining({
                'Authorization': `Bearer ${token}`,
            }),
        }));
    });

    it('should send live submission', async () => {
        const payload = {
            presentationId: 1,
            slideId: 2,
            slideVersion: 1,
            type: 'sample-slide',
            senderId: 'user-1',
            senderType: 'audience' as any,
            attributes: { text: 'test' },
        };

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify({ id: 'sub-1' })),
        } as Response);

        const result = await client.sendLiveSubmission(SlideType.SampleSlide, payload);

        expect(fetch).toHaveBeenCalledWith(
            `${baseUrl}/api/live/submissions?slide_type=${SlideType.SampleSlide}`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(payload),
            })
        );
        expect(result).toEqual({ id: 'sub-1' });
    });

    it('should delete a submission', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 204,
        } as Response);

        await client.deleteSubmission('sub-123');

        expect(fetch).toHaveBeenCalledWith(
            `${baseUrl}/api/submissions/sub-123`,
            expect.objectContaining({
                method: 'DELETE',
            })
        );
    });

    it('should get submissions with query parameters', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify([{ id: '1' }, { id: '2' }])),
        } as Response);

        const results = await client.getSubmissions({ slideId: 10, slideVersion: 2, type: 'test' }, { limit: 10, offset: 5 });

        const expectedUrl = `${baseUrl}/api/submissions?slideId=10&slideVersion=2&type=test&limit=10&offset=5`;
        expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.anything());
        expect(results).toHaveLength(2);
    });

    it('should get participant submissions', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify([])),
        } as Response);

        await client.getParticipantSubmissions({ audienceId: 'aud-1', slideId: 101 }, { limit: 5 });

        const expectedUrl = `${baseUrl}/api/audiences/aud-1/submissions?slideId=101&limit=5`;
        expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.anything());
    });

    it('should throw error if response is not ok', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            statusText: 'Not Found',
        } as Response);

        await expect(client.fetchUrl(`${baseUrl}/fail`)).rejects.toThrow('Failed to fetch https://api.test.com/fail: Not Found');
    });

    it('should request top-N leaderboard with a single aggregation param', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify({ aggregations: {} })),
        } as Response);

        await client.getLeaderboardTopN({
            presentationId: 1,
            presentationVersion: 2,
            slideId: 10,
            aggregation: 'average_score',
            n: 5,
        });

        const expectedUrl = `${baseUrl}/api/aha-sync/answers/leaderboards/topn?presentationId=1&presentationVersion=2&slideId=10&aggregation=average_score&n=5`;
        expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.anything());
    });

    it('should request slide top-N leaderboard with a single aggregation param', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify({ aggregations: {} })),
        } as Response);

        await client.getLeaderboardSlideTopN({
            presentationId: 1,
            presentationVersion: 2,
            slideIds: [10, 11],
            aggregation: 'total_score',
        });

        const expectedUrl = `${baseUrl}/api/aha-sync/answers/leaderboards/slide/topn?presentationId=1&presentationVersion=2&slideIds=${encodeURIComponent(JSON.stringify([10, 11]))}&aggregation=total_score`;
        expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.anything());
    });
});
