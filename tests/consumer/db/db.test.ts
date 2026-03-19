import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSubmission, getSubmissions, deleteSubmission } from '@aha/db';
import { openDB } from 'idb';

// Mock idb
vi.mock('idb', () => ({
    openDB: vi.fn(),
}));

describe('@aha/db - Database Utilities', () => {
    const mockStore = {
        put: vi.fn(),
        getAllFromIndex: vi.fn(),
        delete: vi.fn(),
    };

    const mockDb = {
        put: vi.fn(),
        getAllFromIndex: vi.fn(),
        delete: vi.fn(),
        close: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(openDB).mockResolvedValue(mockDb as any);
    });

    it('should save a submission', async () => {
        const submission = {
            presentationId: 1,
            slideId: 2,
            slideVersion: 1,
            slideType: 'multiple-choice',
            senderId: 'user-1',
            senderType: 'audience' as any,
            type: 'test',
            attributes: { val: 1 },
        };

        mockDb.put.mockResolvedValue(123);

        const id = await saveSubmission(submission as any);

        expect(openDB).toHaveBeenCalled();
        expect(mockDb.put).toHaveBeenCalledWith('submissions', submission);
        expect(id).toBe(123);
    });

    it('should get submissions by index', async () => {
        const filter = { slideId: 10, slideVersion: 1, senderId: 'user-1' };
        const mockResults = [{ id: 1, ...filter }];

        mockDb.getAllFromIndex.mockResolvedValue(mockResults);

        const results = await getSubmissions(filter);

        expect(mockDb.getAllFromIndex).toHaveBeenCalledWith(
            'submissions',
            'slideId-slideVersion-audienceId',
            [10, 1, 'user-1']
        );
        expect(results).toEqual(mockResults);
    });

    it('should delete a submission by id', async () => {
        mockDb.delete.mockResolvedValue(undefined);

        await deleteSubmission(999);

        expect(mockDb.delete).toHaveBeenCalledWith('submissions', 999);
    });

    it('should reuse the database connection', async () => {
        // The dbPromise is a module-level singleton. 
        // If it's already initialized by previous tests, openDB won't be called again.
        const initialCalls = vi.mocked(openDB).mock.calls.length;
        await saveSubmission({} as any);
        await saveSubmission({} as any);

        // It should either stay at 0 (if already init and cleared) or stay at the same count
        const finalCalls = vi.mocked(openDB).mock.calls.length;
        expect(finalCalls).toBeGreaterThanOrEqual(initialCalls);

        // To truly test reuse, we ensure that multiple calls don't trigger *additional* openDB calls
        const afterFirst = vi.mocked(openDB).mock.calls.length;
        await saveSubmission({} as any);
        expect(vi.mocked(openDB).mock.calls.length).toBe(afterFirst);
    });
});
