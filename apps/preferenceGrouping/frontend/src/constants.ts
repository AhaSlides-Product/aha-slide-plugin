import { SlideType } from '@aha/api';

/** This plugin's slide type — must match the app directory name. */
export const SLIDE_TYPE = SlideType.PreferenceGrouping;

/** Peers a participant may pick. Fixed in V1. */
export const PICK_LIMIT = 3;

/** Default ideal group size the presenter can change in settings. */
export const DEFAULT_TARGET_SIZE = 4;

/** Smallest group the algorithm forms where headcount allows. */
export const MIN_GROUP_SIZE = 3;

/** Live topic the backend pings on each submission; the canvas tally subscribes. */
export const SUBMITTED_BUCKET = 'picks-submitted';

/** Slide-attribute keys written by the presenter and read by the audience. */
export const ATTR_GROUPS = 'groups';
export const ATTR_ROSTER = 'roster';
export const ATTR_TARGET_SIZE = 'targetSize';
export const ATTR_REVEALED = 'revealed';

/** useSync channel keys (canvas <-> settings), suffixed with the slide id. */
export const syncKey = {
  targetSize: (slideId: string | number) => `pg-target-size-${slideId}`,
};
