/**
 * Marketplace slide type utilities.
 *
 * Logic extracted from:
 *   - FE: stpancras-presenter-app (SlideMarketplaceList.vue, slideMarketplace.module.js)
 *   - BE: stpancras-general-api (pinned slide types)
 */

// ─── Types ───────────────────────────────────────────────────────

export type ThumbnailMode = 'icon' | 'static' | 'snapshot'

export type SlideTypeThumbnail =
    | { mode: 'icon' | 'snapshot'; thumbnailUrl?: string }
    /** static mode requires the image URL at compile time. */
    | { mode: 'static'; thumbnailUrl: string }

export interface MarketplaceSlideType {
    type: string;
    name: string;
    desc?: string;
    icon?: string;
    editorUrl?: string;
    settingUrl?: string;
    setting?: MarketplaceSlideSettings;
    /** Left-panel thumbnail configuration. Omitting defaults to icon mode. */
    thumbnail?: SlideTypeThumbnail;
}

export interface MarketplaceSlideSettings {
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
}

export interface NormalizedSlideType extends MarketplaceSlideType {
    source: 'fromMarket';
    plugin: true;
}

// ─── Scored slide types ──────────────────────────────────────────

/**
 * A slide type is "scored" (quiz-style, feeds the leaderboard) via a signal
 * that differs by source:
 *   - Local constant entries hard-code `label: 'Quiz'`.
 *   - Marketplace-catalogue entries have no `label`; their scored marker is the
 *     `Scored` tag. `category` is unreliable (mixes Quiz/quiz/Vote/Game/Media),
 *     so the tag is the one signal consistent across every scored entry.
 * Tags arrive as string[] or, defensively, object[] of { label }.
 */
export interface ScoredSlideTypeInput {
    label?: string;
    tags?: Array<string | { label?: string }>;
}

export const QUIZ_LABEL = 'Quiz';
export const SCORED_TAG = 'Scored';

const tagLabel = (tag: string | { label?: string }): string =>
    typeof tag === 'string' ? tag : (tag && tag.label) || '';

export function isScoredSlideType(item?: ScoredSlideTypeInput | null): boolean {
    if (!item) return false;
    if (item.label === QUIZ_LABEL) return true;
    const tags = Array.isArray(item.tags) ? item.tags : [];
    return tags.some((tag) => tagLabel(tag) === SCORED_TAG);
}

// ─── Constants ───────────────────────────────────────────────────

export const DEFAULT_SLIDE_SETTINGS = {
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
} satisfies Required<Pick<MarketplaceSlideSettings,
    | 'enableQuestionTitle'
    | 'enableQuestionDescription'
    | 'enableTimeLimit'
    | 'enableStopSubmitssionSetting'
    | 'enableHideResultSetting'
    | 'enableQuestionImage'
    | 'enableVoteCount'
    | 'enableLabelOtherSetting'
    | 'enableMultipleSubmission'
    | 'enableFullScreen'
>>;

// ─── Normalization ───────────────────────────────────────────────

/**
 * Tags a marketplace slide type with source and plugin markers.
 */
export function normalizeMarketplaceType(raw: MarketplaceSlideType): NormalizedSlideType {
    return {
        ...raw,
        source: 'fromMarket',
        plugin: true,
    };
}

/**
 * Strips the "marketplace/" prefix from a slide type string.
 */
export function stripMarketplacePrefix(type: string): string {
    return type.replace(/^marketplace\//, '');
}

/**
 * Parses the marketplace API response which can be either a plain array
 * or a `{ slideTypes: [...] }` wrapper.
 */
export function parseMarketplaceResponse(data: MarketplaceSlideType[] | { slideTypes: MarketplaceSlideType[] }): MarketplaceSlideType[] {
    return Array.isArray(data) ? data : (data.slideTypes || []);
}

/**
 * Resolves the settings for a marketplace slide, applying defaults
 * for any unspecified flags.
 */
export function resolveSlideSettings(slide: MarketplaceSlideType): MarketplaceSlideSettings {
    return {
        ...DEFAULT_SLIDE_SETTINGS,
        ...(slide.setting || {}),
    };
}

// ─── Iframe URL resolution ───────────────────────────────────────

/**
 * Resolves the iframe URL for a slide type.
 * Marketplace slides (source: 'fromMarket') prefer editorUrl; others use settingUrl.
 */
export function resolveIframeUrl(
    slideType: { source?: string; editorUrl?: string; settingUrl?: string },
    slideId: number,
): string | null {
    const isFromMarket = slideType.source === 'fromMarket';

    if (isFromMarket && slideType.editorUrl) {
        return `${slideType.editorUrl}/${slideId}`;
    }
    if (slideType.settingUrl) {
        return `${slideType.settingUrl}/${slideId}`;
    }
    return null;
}

// ─── Search & filtering ──────────────────────────────────────────

/**
 * Filters slide types by a text query matching name or description.
 */
export function searchFilter(types: MarketplaceSlideType[], query: string): MarketplaceSlideType[] {
    const q = query.toLowerCase().trim();
    if (!q) return types;
    return types.filter(
        (slide) =>
            slide.name.toLowerCase().includes(q) ||
            (slide.desc && slide.desc.toLowerCase().includes(q)),
    );
}

/**
 * Filters slide types by category.
 * NOTE: Unrecognized categories fall through to `return true` (returns all types).
 * This matches the presenter app behavior where unknown categories are a no-op.
 */
export function filterByCategory(types: MarketplaceSlideType[], category: string): MarketplaceSlideType[] {
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
}

// ─── Backfilling & payload helpers ────────────────────────────────

export interface SlideWithTypeObj {
    type: string;
    typeObj: any;
}

/**
 * Backfills typeObj on slides that have no typeObj (null/undefined/empty)
 * by matching against marketplace slide types.
 * Mutates slides in place.
 */
export function backfillTypeObj(
    slides: SlideWithTypeObj[],
    marketplaceTypes: MarketplaceSlideType[],
): void {
    slides.forEach((slide) => {
        if (slide.type && (!slide.typeObj || Object.keys(slide.typeObj).length === 0)) {
            const marketplaceSlide = marketplaceTypes.find((s) => s.type === slide.type);
            if (marketplaceSlide) {
                slide.typeObj = normalizeMarketplaceType(marketplaceSlide);
            }
        }
    });
}

/**
 * Creates a slide creation payload from a marketplace item.
 * Only includes name, type, and plugin flag — excludes URLs and other metadata.
 */
export function createSlideSelectionPayload(item: MarketplaceSlideType): { name: string; type: string; plugin: true } {
    return {
        name: item.name,
        type: item.type,
        plugin: true,
    };
}

// ─── Pinned ordering ─────────────────────────────────────────────

/**
 * Sorts slide types so that pinned types appear first in the specified order.
 */
export function sortWithPinned(
    types: MarketplaceSlideType[],
    pinnedSlugs: string[],
): MarketplaceSlideType[] {
    const pinSet = new Set(pinnedSlugs);
    const pinned = pinnedSlugs
        .map((slug) => types.find((t) => t.type === slug))
        .filter((t): t is MarketplaceSlideType => t !== undefined);
    const unpinned = types.filter((t) => !pinSet.has(t.type));
    return [...pinned, ...unpinned];
}
