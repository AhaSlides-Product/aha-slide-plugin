/**
 * Marketplace slide type utilities.
 *
 * Logic extracted from:
 *   - FE: stpancras-presenter-app (SlideMarketplaceList.vue, slideMarketplace.module.js)
 *   - BE: stpancras-general-api (pinned slide types)
 */

// ─── Types ───────────────────────────────────────────────────────

export interface MarketplaceSlideType {
    type: string;
    name: string;
    desc?: string;
    icon?: string;
    editorUrl?: string;
    settingUrl?: string;
    setting?: MarketplaceSlideSettings;
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

// ─── Constants ───────────────────────────────────────────────────

export const DEFAULT_SLIDE_SETTINGS: Required<Omit<MarketplaceSlideSettings, string> & Record<string, boolean>> = {
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
    return type.replace('marketplace/', '');
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
