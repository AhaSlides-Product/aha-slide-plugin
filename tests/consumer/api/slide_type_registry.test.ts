import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    ApiClient,
    SlideType,
    searchFilter,
    filterByCategory,
    sortWithPinned,
    normalizeMarketplaceType,
    stripMarketplacePrefix,
    parseMarketplaceResponse,
    resolveSlideSettings,
    resolveIframeUrl,
    backfillTypeObj,
    createSlideSelectionPayload,
} from '@aha/api';
import type { MarketplaceSlideType, NormalizedSlideType } from '@aha/api';

/**
 * Consumer tests for the Slide Type Marketplace / Registry system
 *
 * Based on actual implementation from:
 *   - FE PR: stpancras-presenter-app#4313 (AHA-42884-new-slide-market-place)
 *   - BE PR: stpancras-general-api#1924 (pinned slide types)
 *
 * The marketplace API lives at: {VUE_APP_AHASLIDES_MARKETPLACE_URL}/api/slide-types
 * Response: array of MarketplaceSlideType[] OR { slideTypes: MarketplaceSlideType[] }
 */

// ─── Tests ───────────────────────────────────────────────────────

describe('Slide Type Marketplace / Registry', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
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
            const rawTypes = parseMarketplaceResponse(mockApiResponse);

            expect(rawTypes).toHaveLength(2);
            expect(rawTypes[0].type).toBe('marketplace/random-picker');
        });

        it('should handle response as { slideTypes: [...] } wrapper', () => {
            const rawTypes = parseMarketplaceResponse({ slideTypes: mockApiResponse });

            expect(rawTypes).toHaveLength(2);
            expect(rawTypes[0].name).toBe('Random Picker');
        });

        it('should strip "marketplace/" prefix from type field', () => {
            const fetchedTypes = mockApiResponse.map((slide) => ({
                ...slide,
                type: stripMarketplacePrefix(slide.type),
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
                type: stripMarketplacePrefix(slide.type),
            }));

            expect(fetchedTypes[0].type).toBe('candle-timer');
        });

        it('should handle empty response gracefully', () => {
            const rawTypes = parseMarketplaceResponse([]);

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

            const normalized = normalizeMarketplaceType(raw);

            expect(normalized.source).toBe('fromMarket');
            expect(normalized.plugin).toBe(true);
            expect(normalized.type).toBe('random-picker');
            expect(normalized.name).toBe('Random Picker');
        });

        it('should apply default setting flags when resolving a marketplace type', () => {
            const marketplaceSlide: MarketplaceSlideType = {
                type: 'duck-race',
                name: 'Duck Race Quiz',
                setting: {
                    enableQuestionTitle: true,
                },
            };

            const resolved = resolveSlideSettings(marketplaceSlide);

            // User-provided setting overrides the default
            expect(resolved.enableQuestionTitle).toBe(true);
            // Defaults applied for unspecified settings
            expect(resolved.enableTimeLimit).toBe(false);
            expect(resolved.enableQuestionDescription).toBe(false);
        });

        it('should use all defaults when marketplace slide has no setting object', () => {
            const marketplaceSlide: MarketplaceSlideType = {
                type: 'candle-timer',
                name: 'Candle Timer',
            };

            const resolved = resolveSlideSettings(marketplaceSlide);

            // All false by default
            Object.values(resolved).forEach((val) => {
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

            const iframeUrl = resolveIframeUrl(slideType, 42);

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

            const iframeUrl = resolveIframeUrl(slideType, 99);

            expect(iframeUrl).toBe('https://plugins.ahaslides.com/candle-timer/settings/99');
        });

        it('should use settingUrl for non-marketplace (existing plugin) slides', () => {
            const slideType = {
                type: 'sample-slide',
                name: 'Sample Slide',
                settingUrl: 'https://plugins.ahaslides.com/sample-slide/settings',
                plugin: true,
            };

            const iframeUrl = resolveIframeUrl(slideType, 7);

            expect(iframeUrl).toBe('https://plugins.ahaslides.com/sample-slide/settings/7');
        });

        it('should return null when no URL is available', () => {
            const slideType: NormalizedSlideType = {
                type: 'minimal',
                name: 'Minimal',
                source: 'fromMarket',
                plugin: true,
            };

            const iframeUrl = resolveIframeUrl(slideType, 1);

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
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('random-picker');

            const result2 = searchFilter(allTypes, 'fun');
            expect(result2).toHaveLength(1);
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

    // ─── typeObj backfilling on presentation slides ──────────────

    describe('typeObj backfilling', () => {
        it('should set typeObj on slides that match marketplace types', () => {
            const marketplaceTypes: MarketplaceSlideType[] = [
                { type: 'random-picker', name: 'Random Picker' },
                { type: 'duck-race', name: 'Duck Race Quiz' },
            ];

            const slides = [
                { type: 'random-picker', typeObj: null as any },
                { type: 'regular-poll', typeObj: { name: 'Poll', type: 'regular-poll' } },
                { type: 'duck-race', typeObj: undefined as any },
            ];

            backfillTypeObj(slides, marketplaceTypes);

            expect(slides[0].typeObj.source).toBe('fromMarket');
            expect(slides[0].typeObj.plugin).toBe(true);
            expect(slides[0].typeObj.name).toBe('Random Picker');

            // Existing typeObj should not be overwritten
            expect(slides[1].typeObj.name).toBe('Poll');
            expect(slides[1].typeObj).not.toHaveProperty('source');

            expect(slides[2].typeObj.source).toBe('fromMarket');
            expect(slides[2].typeObj.name).toBe('Duck Race Quiz');
        });

        it('should not overwrite typeObj if it already has content', () => {
            const marketplaceTypes: MarketplaceSlideType[] = [
                { type: 'quiz', name: 'Marketplace Quiz' },
            ];

            const slides = [{ type: 'quiz', typeObj: { name: 'Built-in Quiz', type: 'quiz' } }];

            backfillTypeObj(slides, marketplaceTypes);

            expect(slides[0].typeObj.name).toBe('Built-in Quiz');
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
        it('existing SlideType enum values should still be valid type strings', () => {
            const enumValues = Object.values(SlideType);
            expect(enumValues.length).toBeGreaterThan(0);

            enumValues.forEach((value) => {
                expect(typeof value).toBe('string');
                expect(value.length).toBeGreaterThan(0);
            });
        });

        it('sendLiveSubmission should still accept SlideType enum values', async () => {
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

            const slideItem = createSlideSelectionPayload(marketplaceItem);

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

            const slideItem = createSlideSelectionPayload(marketplaceItem);

            expect(slideItem).not.toHaveProperty('editorUrl');
            expect(slideItem).not.toHaveProperty('settingUrl');
        });
    });
});
