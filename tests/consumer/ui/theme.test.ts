import { describe, it, expect } from 'vitest';
import { ahaSlidesDefaultTheme } from '@aha/ui';

describe('@aha/ui - Theme', () => {
    it('should export ahaSlidesDefaultTheme', () => {
        expect(ahaSlidesDefaultTheme).toBeDefined();
    });

    it('should have basic theme structure', () => {
        // Should have algorithm and token properties as per Ant Design Vue ThemeConfig
        expect(ahaSlidesDefaultTheme).toHaveProperty('algorithm');
        expect(ahaSlidesDefaultTheme).toHaveProperty('token');

        // token should be an object
        expect(typeof ahaSlidesDefaultTheme.token).toBe('object');
    });

    it('should contain some expected tokens', () => {
        // Just verifying it's not empty and has some token properties
        const tokens = ahaSlidesDefaultTheme.token;
        expect(tokens).toBeDefined();
        if (tokens) {
            expect(Object.keys(tokens).length).toBeGreaterThan(0);
        }
    });
});
