/** Topic (bucket) the tally pings are published to; the canvas subscribes to it. */
export const SUBMITTED_BUCKET = 'picks-submitted';

/** Slide-type-specific submission payload: the peers this participant picked. */
export interface PickAttributes {
  pickedPeerIds: string[];
}

/**
 * Request body for `POST /preferenceGrouping/external/form-groups`.
 *
 * The presenter collects every participant's private picks (which it alone is
 * authorised to read) and posts them here; the peer ids never travel over the
 * shared live topics, so no client can reconstruct who picked whom.
 */
export interface FormGroupsRequestDto {
  /** The full roster to place — every joined participant, abstainers included. */
  participantIds: string[];
  /** participantId -> the peer ids they picked. */
  picks: Record<string, string[]>;
  /** Ideal group size (default 4). */
  targetSize?: number;
  /** Smallest acceptable group where headcount allows (default 3). */
  minSize?: number;
  /** Optional seed so a re-run reproduces the same groups. */
  seed?: number;
}

/** One formed group. */
export interface FormedGroup {
  id: string;
  memberIds: string[];
}

/** Response body for the form-groups endpoint. */
export interface FormGroupsResponseDto {
  groups: FormedGroup[];
  seed: number;
}
