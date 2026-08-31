import { SlideType } from '@aha/api';

/** This plugin's slide type — must match the app directory name. */
export const SLIDE_TYPE = SlideType.PreferenceGrouping;

/** Default ideal group size the presenter can change in settings. */
export const DEFAULT_TARGET_SIZE = 4;

/** Peers a participant may pick: a group of N already holds the picker, so they choose the other N-1. */
export const pickLimitForTargetSize = (targetSize: number): number =>
  Math.max(1, (targetSize || DEFAULT_TARGET_SIZE) - 1);

/** Smallest group the algorithm forms where headcount allows. */
export const MIN_GROUP_SIZE = 3;

/** Live topic the backend pings on each submission; the canvas tally subscribes. */
export const SUBMITTED_BUCKET = 'picks-submitted';

/** Slide-attribute keys written by the presenter and read by the audience. */
export const ATTR_GROUPS = 'groups';
export const ATTR_ROSTER = 'roster';
export const ATTR_TARGET_SIZE = 'targetSize';
export const ATTR_REVEALED = 'revealed';

/**
 * Read the persisted group size from slide attributes — the useSync channel
 * never replays it to a late subscriber, so it must be read back here. Returns
 * undefined when genuinely unset so the caller falls back to DEFAULT_TARGET_SIZE.
 */
export const readStoredTargetSize = (
  attributes: Record<string, any> | undefined,
): number | undefined => {
  const stored = attributes?.[ATTR_TARGET_SIZE] ?? attributes?.preferenceGrouping?.[ATTR_TARGET_SIZE];
  return typeof stored === 'number' ? stored : undefined;
};

/** useSync channel keys (canvas <-> settings), suffixed with the slide id. */
export const syncKey = {
  targetSize: (slideId: string | number) => `pg-target-size-${slideId}`,
};
