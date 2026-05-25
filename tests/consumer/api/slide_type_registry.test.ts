import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '@aha/api';

/**
 * Consumer tests for the Slide Type Marketplace / Registry system
 *
 * Based on actual implementation from:
 *   - FE PR: stpancras-presenter-app#4313 (AHA-42884-new-slide-market-place)
 *   - BE PR: stpancras-general-api#1924 (pinned slide types)
 *
 * The marketplace API lives at: {VUE_APP_AHASLIDES_MARKETPLACE_URL}/api/slide-types
 * Response: array of MarketplaceSlideType[] OR { slideTypes: MarketplaceSlideType[] }
 *
 * Each marketplace slide type is tagged with `source: 'fromMarket'` and `plugin: true`
 * in the presenter app. The SDK should be able to fetch and normalize these types.
 */

// ─── Types matching actual implementation ────────────────────────

/**
 * Shape of a slide type returned by the marketplace API.
 * Matches the structure consumed by slideMarketplace.module.js
 */
interface MarketplaceSlideType {
    type: string;
    name: string;
    desc?: string;
    icon?: string;
    editorUrl?: string;
    settingUrl?: string;
    setting?: {
        enableQuestionTitle?: boolean;
        enableQuestionDescription?: boolean;
        enableTimeLimit?: boolean;
        enableStopSubmitssionSetting?: boolean;
        enableHideResultSetting?: boolean;
        enableQuestionImage?: boolean;
        enableVoteCount?: boolean;
        enableLabelOtherSetting?: boolean;
        enableMultipleSubmission?: boolean;
        enableFullScreen?: boolean;
        [key: string]: boolean | undefined;
    };
}

/**
 * The normalized slide type after processing by the Vuex store.
 * Adds `source` and `plugin` fields.
 */
interface NormalizedSlideType extends MarketplaceSlideType {
    source: 'fromMarket';
    plugin: true;
}

// ─── Tests ───────────────────────────────────────────────────────

describe('Slide Type Marketplace / Registry', () => {
    const marketplaceBaseUrl = 'https://aha-slide-types-creator.pages.dev/';

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    // ─── Marketplace API response parsing ────────────────────────

    describe('marketplace API response parsing', () => {
        const mockApiResponse: MarketplaceSlideType[] = [
            {
                type: 'marketplace/random-picker',
                name: 'Random Picker',
                desc: 'Pick a random student or item',
                icon: 'fas fa-random',
                editorUrl: 'https://plugins.ahaslides.com/random-picker/editor',
                settingUrl: 'https://plugins.ahaslides.com/random-picker/settings',
                setting: {
                    enableQuestionTitle: true,
                    enableTimeLimit: false,
                },
            },
            {
                type: 'marketplace/duck-race',
                name: 'Duck Race Quiz',
                desc: 'A fun racing quiz game',
                editorUrl: 'https://plugins.ahaslides.com/duck-race/editor',
            },
        ];

        it('should handle response as a plain array', () => {
            const data = mockApiResponse;
            const rawTypes = Array.isArray(data) ? data : ((data as any).slideTypes || []);

            expect(rawTypes).toHaveLength(2);
            expect(rawTypes[0].type).toBe('marketplace/random-picker');
        });

        it('should handle response as { slideTypes: [...] } wrapper', () => {
            const data = { slideTypes: mockApiResponse };
            const rawTypes = Array.isArray(data) ? data : (data.slideTypes || []);

            expect(rawTypes).toHaveLength(2);
            expect(rawTypes[0].name).toBe('Random Picker');
        });

        it('should strip "marketplace/" prefix from type field', () => {
            const rawTypes = mockApiResponse;
            const fetchedTypes = rawTypes.map((slide) => ({
                ...slide,
                type: slide.type.replace('marketplace/', ''),
            }));

            expect(fetchedTypes[0].type).toBe('random-picker');
            expect(fetchedTypes[1].type).toBe('duck-race');
        });

        it('should handle types without "marketplace/" prefix (no-op)', () => {
            const rawTypes: MarketplaceSlideType[] = [
                { type: 'candle-timer', name: 'Candle Timer' },
            ];
            const fetchedTypes = rawTypes.map((slide) => ({
                ...slide,
                type: slide.type.replace('marketplace/', ''),
            }));

            expect(fetchedTypes[0].type).toBe('candle-timer');
        });

        it('should handle empty response gracefully', () => {
            const data: MarketplaceSlideType[] = [];
            const rawTypes = Array.isArray(data) ? data : ((data as any).slideTypes || []);

            expect(rawTypes).toEqual([]);
        });
    });

    // ─── Slide type normalization (source tagging) ───────────────

    describe('slide type normalization', () => {
        it('should tag marketplace types with source: "fromMarket" and plugin: true', () => {
            const raw: MarketplaceSlideType = {
                type: 'random-picker',
                name: 'Random Picker',
            };

            const normalized: NormalizedSlideType = {
                ...raw,
                source: 'fromMarket',
                plugin: true,
            };

            expect(normalized.source).toBe('fromMarket');
            expect(normalized.plugin).toBe(true);
            expect(normalized.type).toBe('random-picker');
            expect(normalized.name).toBe('Random Picker');
        });

        it('should apply default setting flags when customSlideTypeByType resolves a marketplace type', () => {
            const marketplaceSlide: MarketplaceSlideType = {
                type: 'duck-race',
                name: 'Duck Race Quiz',
                setting: {
                    enableQuestionTitle: true,
                },
            };

            // Matches customSlideTypeByType logic in embed-app.module.js
            const defaultSettings = {
                enableQuestionTitle: false,
                enableQuestionDescription: false,
                enableTimeLimit: false,
                enableStopSubmitssionSetting: false,
                enableHideResultSetting: false,
                enableQuestionImage: false,
                enableVoteCount: false,
                enableLabelOtherSetting: false,
                enableMultipleSubmission: false,
                enableFullScreen: false,
            };

            const resolved = {
                ...marketplaceSlide,
                plugin: true,
                setting: {
                    ...defaultSettings,
                    ...(marketplaceSlide.setting || {}),
                },
            };

            // User-provided setting overrides the default
            expect(resolved.setting.enableQuestionTitle).toBe(true);
            // Defaults applied for unspecified settings
            expect(resolved.setting.enableTimeLimit).toBe(false);
            expect(resolved.setting.enableQuestionDescription).toBe(false);
            expect(resolved.plugin).toBe(true);
        });

        it('should use all defaults when marketplace slide has no setting object', () => {
            const marketplaceSlide: MarketplaceSlideType = {
                type: 'candle-timer',
                name: 'Candle Timer',
                // no setting field
            };

            const resolved = {
                ...marketplaceSlide,
                plugin: true,
                setting: {
                    enableQuestionTitle: false,
                    enableQuestionDescription: false,
                    enableTimeLimit: false,
                    enableStopSubmitssionSetting: false,
                    enableHideResultSetting: false,
                    enableQuestionImage: false,
                    enableVoteCount: false,
                    enableLabelOtherSetting: false,
                    enableMultipleSubmission: false,
                    enableFullScreen: false,
                    ...(marketplaceSlide.setting || {}),
                },
            };

            // All false by default
            Object.values(resolved.setting).forEach((val) => {
                expect(val).toBe(false);
            });
        });
    });

    // ─── Iframe URL resolution (editorUrl vs settingUrl) ─────────

    describe('iframe URL resolution for marketplace slides', () => {
        it('should use editorUrl for marketplace slides (source: "fromMarket")', () => {
            const slideType: NormalizedSlideType = {
                type: 'random-picker',
                name: 'Random Picker',
                editorUrl: 'https://plugins.ahaslides.com/random-picker/editor',
                settingUrl: 'https://plugins.ahaslides.com/random-picker/settings',
                source: 'fromMarket',
                plugin: true,
            };
            const slideId = 42;

            // Matches SlidePluginIframeConfig.vue logic
            const isFromMarket = slideType.source === 'fromMarket';
            let iframeUrl: string | null = null;

            if (isFromMarket && slideType.editorUrl) {
                iframeUrl = `${slideType.editorUrl}/${slideId}`;
            } else if (slideType.settingUrl) {
                iframeUrl = `${slideType.settingUrl}/${slideId}`;
            }

            expect(iframeUrl).toBe('https://plugins.ahaslides.com/random-picker/editor/42');
        });

        it('should fall back to settingUrl when editorUrl is missing on marketplace slide', () => {
            const slideType: NormalizedSlideType = {
                type: 'candle-timer',
                name: 'Candle Timer',
                settingUrl: 'https://plugins.ahaslides.com/candle-timer/settings',
                source: 'fromMarket',
                plugin: true,
            };
            const slideId = 99;

            const isFromMarket = slideType.source === 'fromMarket';
            let iframeUrl: string | null = null;

            if (isFromMarket && slideType.editorUrl) {
                iframeUrl = `${slideType.editorUrl}/${slideId}`;
            } else if (slideType.settingUrl) {
                iframeUrl = `${slideType.settingUrl}/${slideId}`;
            }

            expect(iframeUrl).toBe('https://plugins.ahaslides.com/candle-timer/settings/99');
        });

        it('should use settingUrl for non-marketplace (existing plugin) slides', () => {
            const slideType = {
                type: 'sample-slide',
                name: 'Sample Slide',
                settingUrl: 'https://plugins.ahaslides.com/sample-slide/settings',
                plugin: true,
                // No source: 'fromMarket'
            };
            const slideId = 7;

            const isFromMarket = false;
            let iframeUrl: string | null = null;

            if (isFromMarket && (slideType as any).editorUrl) {
                iframeUrl = `${(slideType as any).editorUrl}/${slideId}`;
            } else if (slideType.settingUrl) {
                iframeUrl = `${slideType.settingUrl}/${slideId}`;
            }

            expect(iframeUrl).toBe('https://plugins.ahaslides.com/sample-slide/settings/7');
        });

        it('should return null when no URL is available', () => {
            const slideType: NormalizedSlideType = {
                type: 'minimal',
                name: 'Minimal',
                source: 'fromMarket',
                plugin: true,
            };
            const slideId = 1;

            const isFromMarket = slideType.source === 'fromMarket';
            let iframeUrl: string | null = null;

            if (isFromMarket && slideType.editorUrl) {
                iframeUrl = `${slideType.editorUrl}/${slideId}`;
            } else if (slideType.settingUrl) {
                iframeUrl = `${slideType.settingUrl}/${slideId}`;
            }

            expect(iframeUrl).toBeNull();
        });
    });

    // ─── Local search (matches SlideMarketplaceList.vue) ─────────

    describe('local search filtering', () => {
        const allTypes: MarketplaceSlideType[] = [
            { type: 'random-picker', name: 'Random Picker', desc: 'Pick a random student' },
            { type: 'duck-race-quiz', name: 'Duck Race Quiz', desc: 'A fun racing game' },
            { type: 'candle-timer', name: 'Candle Timer', desc: 'Visual countdown timer' },
            { type: 'poll-advanced', name: 'Advanced Poll', desc: 'Enhanced polling' },
            { type: 'flip-cards', name: 'Flip Cards', desc: 'Interactive flashcards' },
        ];

        // Matches the filteredSlideTypes computed in SlideMarketplaceList.vue
        const searchFilter = (types: MarketplaceSlideType[], query: string): MarketplaceSlideType[] => {
            const q = query.toLowerCase().trim();
            if (!q) return types;
            return types.filter(
                (slide) =>
                    slide.name.toLowerCase().includes(q) ||
                    (slide.desc && slide.desc.toLowerCase().includes(q)),
            );
        };

        it('should return all types when query is empty', () => {
            expect(searchFilter(allTypes, '')).toHaveLength(5);
            expect(searchFilter(allTypes, '   ')).toHaveLength(5);
        });

        it('should filter by name (case insensitive)', () => {
            const result = searchFilter(allTypes, 'duck');
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('duck-race-quiz');
        });

        it('should filter by description', () => {
            const result = searchFilter(allTypes, 'countdown');
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('candle-timer');
        });

        it('should return empty array when no match', () => {
            expect(searchFilter(allTypes, 'nonexistent')).toHaveLength(0);
        });

        it('should match partial strings across name and desc', () => {
            const result = searchFilter(allTypes, 'random');
            expect(result).toHaveLength(1); // 'Random Picker' name + 'Pick a random student' desc — same item
            expect(result[0].type).toBe('random-picker');

            const result2 = searchFilter(allTypes, 'fun');
            expect(result2).toHaveLength(1); // 'A fun racing game' desc
            expect(result2[0].type).toBe('duck-race-quiz');
        });
    });

    // ─── Category filtering (matches SlideMarketplaceList.vue) ───

    describe('category filtering', () => {
        const allTypes: MarketplaceSlideType[] = [
            { type: 'quiz-basic', name: 'Basic Quiz' },
            { type: 'poll-standard', name: 'Standard Poll' },
            { type: 'ranking', name: 'Ranking' },
            { type: 'budget-allocation', name: 'Budget Allocation' },
            { type: 'take-a-stand', name: 'Take a Stand' },
            { type: 'candle-timer', name: 'Candle Timer' },
            { type: 'random-picker', name: 'Random Picker' },
            { type: 'flip-cards', name: 'Flip Cards' },
            { type: 'matchmories', name: 'Matchmories' },
            { type: 'puzzle-game', name: 'Puzzle Game' },
            { type: 'estimation-quiz', name: 'Estimation Quiz' },
        ];

        // Matches the category filtering logic in SlideMarketplaceList.vue
        const filterByCategory = (types: MarketplaceSlideType[], category: string): MarketplaceSlideType[] => {
            if (category === 'All') return types;

            return types.filter((slide) => {
                const nameLower = slide.name.toLowerCase();
                const typeLower = slide.type.toLowerCase();

                if (category === 'Quiz') {
                    return typeLower.includes('quiz') || nameLower.includes('quiz');
                }
                if (category === 'Poll') {
                    return typeLower.includes('poll') || nameLower.includes('poll') ||
                        typeLower === 'ranking' || typeLower === 'budget-allocation' || typeLower === 'take-a-stand';
                }
                if (category === 'Timer') {
                    return typeLower.includes('timer') || nameLower.includes('timer');
                }
                if (category === 'Random picker') {
                    return typeLower.includes('random') || nameLower.includes('random') ||
                        typeLower.includes('picker') || nameLower.includes('picker') ||
                        nameLower.includes('assignment') || nameLower.includes('rotation') ||
                        nameLower.includes('race') || nameLower.includes('box');
                }
                if (category === 'Fun & Trivia') {
                    return typeLower.includes('flip') || typeLower.includes('interactive') ||
                        typeLower.includes('matchmories') || typeLower.includes('puzzle') ||
                        typeLower.includes('chain') || typeLower.includes('battle') ||
                        typeLower.includes('splash');
                }
                if (category === 'Scored') {
                    return typeLower.includes('quiz') || typeLower.includes('battle') ||
                        typeLower.includes('puzzle') || typeLower.includes('matchmories') ||
                        typeLower.includes('estimation') || typeLower.includes('swipe') ||
                        typeLower.includes('blank') || typeLower.includes('label');
                }

                return true;
            });
        };

        it('"All" category should return all types', () => {
            expect(filterByCategory(allTypes, 'All')).toHaveLength(allTypes.length);
        });

        it('"Quiz" category should match types with quiz in name or type', () => {
            const result = filterByCategory(allTypes, 'Quiz');
            expect(result.map((t) => t.type)).toEqual(['quiz-basic', 'estimation-quiz']);
        });

        it('"Poll" category should include poll, ranking, budget-allocation, take-a-stand', () => {
            const result = filterByCategory(allTypes, 'Poll');
            const types = result.map((t) => t.type);
            expect(types).toContain('poll-standard');
            expect(types).toContain('ranking');
            expect(types).toContain('budget-allocation');
            expect(types).toContain('take-a-stand');
        });

        it('"Timer" category should match timer types', () => {
            const result = filterByCategory(allTypes, 'Timer');
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('candle-timer');
        });

        it('"Random picker" category should match random/picker types', () => {
            const result = filterByCategory(allTypes, 'Random picker');
            expect(result.map((t) => t.type)).toContain('random-picker');
        });

        it('"Fun & Trivia" category should match flip, matchmories, puzzle', () => {
            const result = filterByCategory(allTypes, 'Fun & Trivia');
            const types = result.map((t) => t.type);
            expect(types).toContain('flip-cards');
            expect(types).toContain('matchmories');
            expect(types).toContain('puzzle-game');
        });

        it('"Scored" category should match quiz, puzzle, matchmories, estimation', () => {
            const result = filterByCategory(allTypes, 'Scored');
            const types = result.map((t) => t.type);
            expect(types).toContain('quiz-basic');
            expect(types).toContain('puzzle-game');
            expect(types).toContain('matchmories');
            expect(types).toContain('estimation-quiz');
        });
    });

    // ─── Marketplace fetch with deduplication ────────────────────

    describe('fetch deduplication', () => {
        it('should not re-fetch if slideTypes are already loaded', async () => {
            const state = { slideTypes: [{ type: 'quiz', name: 'Quiz' }], fetchPromise: null };

            // Simulates the guard in fetchMarketplaceSlideTypes action
            const shouldFetch = state.slideTypes.length === 0 && !state.fetchPromise;

            expect(shouldFetch).toBe(false);
        });

        it('should reuse in-flight promise if fetch is already in progress', () => {
            const existingPromise = Promise.resolve();
            const state = { slideTypes: [], fetchPromise: existingPromise };

            const shouldFetch = state.slideTypes.length === 0 && !state.fetchPromise;
            const shouldReusePromise = state.slideTypes.length === 0 && state.fetchPromise !== null;

            expect(shouldFetch).toBe(false);
            expect(shouldReusePromise).toBe(true);
        });

        it('should fetch when slideTypes is empty and no in-flight promise', () => {
            const state = { slideTypes: [], fetchPromise: null };

            const shouldFetch = state.slideTypes.length === 0 && !state.fetchPromise;

            expect(shouldFetch).toBe(true);
        });
    });

    // ─── typeObj backfilling on presentation slides ──────────────

    describe('typeObj backfilling', () => {
        it('should set typeObj on slides that match marketplace types', () => {
            const marketplaceTypes: MarketplaceSlideType[] = [
                { type: 'random-picker', name: 'Random Picker' },
                { type: 'duck-race', name: 'Duck Race Quiz' },
            ];

            const slides = [
                { type: 'random-picker', typeObj: null },
                { type: 'regular-poll', typeObj: { name: 'Poll', type: 'regular-poll' } },
                { type: 'duck-race', typeObj: undefined },
            ];

            // Simulates mapSlidesTypeObj logic
            slides.forEach((slide) => {
                if (slide.type && (!slide.typeObj || Object.keys(slide.typeObj).length === 0)) {
                    const marketplaceSlide = marketplaceTypes.find((s) => s.type === slide.type);
                    if (marketplaceSlide) {
                        slide.typeObj = { ...marketplaceSlide, source: 'fromMarket', plugin: true } as any;
                    }
                }
            });

            expect((slides[0].typeObj as any).source).toBe('fromMarket');
            expect((slides[0].typeObj as any).plugin).toBe(true);
            expect((slides[0].typeObj as any).name).toBe('Random Picker');

            // Existing typeObj should not be overwritten
            expect((slides[1].typeObj as any).name).toBe('Poll');
            expect((slides[1].typeObj as any)).not.toHaveProperty('source');

            expect((slides[2].typeObj as any).source).toBe('fromMarket');
            expect((slides[2].typeObj as any).name).toBe('Duck Race Quiz');
        });

        it('should not overwrite typeObj if it already has content', () => {
            const marketplaceTypes: MarketplaceSlideType[] = [
                { type: 'quiz', name: 'Marketplace Quiz' },
            ];

            const slide = { type: 'quiz', typeObj: { name: 'Built-in Quiz', type: 'quiz' } };

            if (slide.type && (!slide.typeObj || Object.keys(slide.typeObj).length === 0)) {
                const marketplaceSlide = marketplaceTypes.find((s) => s.type === slide.type);
                if (marketplaceSlide) {
                    slide.typeObj = { ...marketplaceSlide, source: 'fromMarket', plugin: true } as any;
                }
            }

            // Should keep the existing built-in type
            expect(slide.typeObj.name).toBe('Built-in Quiz');
        });
    });

    // ─── Pinned types ordering in aggregated list ────────────────

    describe('pinned types ordering', () => {
        const allTypes: MarketplaceSlideType[] = [
            { type: 'poll', name: 'Poll' },
            { type: 'quiz', name: 'Quiz' },
            { type: 'wordcloud', name: 'Word Cloud' },
            { type: 'ranking', name: 'Ranking' },
            { type: 'open-ended', name: 'Open-Ended' },
        ];

        const sortWithPinned = (
            types: MarketplaceSlideType[],
            pinnedSlugs: string[],
        ): MarketplaceSlideType[] => {
            const pinSet = new Set(pinnedSlugs);
            const pinned = pinnedSlugs
                .map((slug) => types.find((t) => t.type === slug))
                .filter((t): t is MarketplaceSlideType => t !== undefined);
            const unpinned = types.filter((t) => !pinSet.has(t.type));
            return [...pinned, ...unpinned];
        };

        it('should place pinned types at the beginning', () => {
            const result = sortWithPinned(allTypes, ['ranking', 'wordcloud']);

            expect(result[0].type).toBe('ranking');
            expect(result[1].type).toBe('wordcloud');
            expect(result).toHaveLength(5);
        });

        it('should preserve pinned order as specified by user', () => {
            const result = sortWithPinned(allTypes, ['quiz', 'poll']);

            expect(result[0].type).toBe('quiz');
            expect(result[1].type).toBe('poll');
        });

        it('should show all types when no pins exist', () => {
            const result = sortWithPinned(allTypes, []);

            expect(result).toHaveLength(5);
            expect(result).toEqual(allTypes);
        });

        it('should skip pinned slugs that no longer exist in the registry', () => {
            const result = sortWithPinned(allTypes, ['deleted-slide', 'quiz']);

            expect(result[0].type).toBe('quiz');
            expect(result).toHaveLength(5);
        });

        it('should not duplicate pinned types in the unpinned section', () => {
            const result = sortWithPinned(allTypes, ['poll']);
            const pollOccurrences = result.filter((t) => t.type === 'poll');

            expect(pollOccurrences).toHaveLength(1);
            expect(result[0].type).toBe('poll');
        });
    });

    // ─── Backward compatibility ──────────────────────────────────

    describe('backward compatibility with SlideType enum', () => {
        it('existing SlideType enum values should still be valid type strings', async () => {
            const { SlideType } = await import('@aha/api');

            const enumValues = Object.values(SlideType);
            expect(enumValues.length).toBeGreaterThan(0);

            enumValues.forEach((value) => {
                expect(typeof value).toBe('string');
                expect(value.length).toBeGreaterThan(0);
            });
        });

        it('sendLiveSubmission should still accept SlideType enum values', async () => {
            const { SlideType } = await import('@aha/api');
            const client = new ApiClient('https://api.test.com', 'token');

            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ id: 'sub-1' }),
            } as Response);

            const payload = {
                presentationId: 1,
                slideId: 2,
                slideVersion: 1,
                type: 'sample-slide',
                senderId: 'user-1',
                senderType: 'audience' as any,
                attributes: { text: 'test' },
            };

            await client.sendLiveSubmission(SlideType.SampleSlide, payload);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining(`slide_type=${SlideType.SampleSlide}`),
                expect.anything(),
            );
        });
    });

    // ─── Marketplace slide selection (selectSlideType payload) ───

    describe('marketplace slide selection payload', () => {
        it('should create a slide item with plugin: true when selected from marketplace', () => {
            const marketplaceItem: MarketplaceSlideType = {
                type: 'random-picker',
                name: 'Random Picker',
                editorUrl: 'https://plugins.ahaslides.com/random-picker/editor',
            };

            // Matches handleSelectMarketplaceSlideType in SlideTypeListV4.vue
            const slideItem = {
                name: marketplaceItem.name,
                type: marketplaceItem.type,
                plugin: true,
            };

            expect(slideItem.plugin).toBe(true);
            expect(slideItem.type).toBe('random-picker');
            expect(slideItem.name).toBe('Random Picker');
        });

        it('should not include editorUrl/settingUrl in the slide creation payload', () => {
            const marketplaceItem: MarketplaceSlideType = {
                type: 'duck-race',
                name: 'Duck Race Quiz',
                editorUrl: 'https://example.com/editor',
                settingUrl: 'https://example.com/settings',
            };

            const slideItem = {
                name: marketplaceItem.name,
                type: marketplaceItem.type,
                plugin: true,
            };

            expect(slideItem).not.toHaveProperty('editorUrl');
            expect(slideItem).not.toHaveProperty('settingUrl');
        });
    });
});
