import { describe, it, expect } from 'vitest';
import { getBucket } from '@aha/common';

describe('@aha/common - Utilities', () => {
    describe('getBucket', () => {
        it('should return correctly formatted bucket name', () => {
            const bucket = getBucket('data', {
                presentationId: 'pres-1',
                slideId: 'slide-2',
                slideVersion: 'v3',
            });
            expect(bucket).toBe('sslide-2-vv3/data');
        });

        it('should handle numeric IDs', () => {
            const bucket = getBucket('results', {
                presentationId: 100,
                slideId: 200,
                slideVersion: 1,
            });
            expect(bucket).toBe('s200-v1/results');
        });
    });
});
