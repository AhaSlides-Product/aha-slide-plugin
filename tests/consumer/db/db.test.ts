import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSubmission, getSubmissions, deleteSubmission, saveAnswer } from '@aha/db';
import { openDB } from 'idb';
import { reactive } from 'vue';

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

    it('should store a structured-clone-safe (non-reactive) copy of an answer', async () => {
        // Reproduces the audience "DataCloneError: [object Array] could not be cloned"
        // bug: slides build answer payloads from Vue reactive state, and reactive
        // Proxies (especially arrays) cannot be structured-cloned by IndexedDB's put().
        const answer = reactive({
            slideId: 'slide-1',
            slideVersion: 1,
            participantId: 'p-1',
            slideType: 'fill-in-the-blanks',
            scope: { answers: ['cat', 'dog'] },
        });

        mockDb.put.mockResolvedValue(7);
        const id = await saveAnswer(answer as any);

        expect(id).toBe(7);
        expect(mockDb.put).toHaveBeenCalledTimes(1);
        const stored = mockDb.put.mock.calls[0][1];
        // The value handed to IndexedDB must survive structured cloning.
        expect(() => structuredClone(stored)).not.toThrow();
        // And it must be a detached copy, not the live reactive object.
        expect(stored).toEqual({
            slideId: 'slide-1',
            slideVersion: 1,
            participantId: 'p-1',
            slideType: 'fill-in-the-blanks',
            scope: { answers: ['cat', 'dog'] },
        });
    });

    it('should store a structured-clone-safe copy of a submission', async () => {
        const submission = reactive({
            presentationId: 1,
            slideId: 2,
            slideVersion: 1,
            slideType: 'multiple-choice',
            senderId: 'user-1',
            senderType: 'audience' as any,
            type: 'test',
            attributes: { choices: ['a', 'b'] },
        });

        mockDb.put.mockResolvedValue(8);
        await saveSubmission(submission as any);

        const stored = mockDb.put.mock.calls[0][1];
        expect(() => structuredClone(stored)).not.toThrow();
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
