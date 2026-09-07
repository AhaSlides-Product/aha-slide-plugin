import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/** Topic (bucket) the tally pings are published to; the canvas subscribes to it. */
export const SUBMITTED_BUCKET = 'picks-submitted';

/** Largest room the group former accepts in a single request. */
export const MAX_ROOM_SIZE = 500;

/** Largest ideal group size the presenter may request. */
export const MAX_TARGET_SIZE = 50;

/** Default ideal group size when the presenter hasn't chosen one (mirrors the client). */
export const DEFAULT_TARGET_SIZE = 4;

/** Peers one participant may pick: a group of N already holds the picker, so they choose the other N-1. */
export const pickLimitForTargetSize = (targetSize?: number): number =>
  Math.max(1, (targetSize || DEFAULT_TARGET_SIZE) - 1);

/**
 * Trim each pick list to the derived per-person limit so a client that bypasses
 * its own cap can't submit an over-long pick array — while a legitimately larger
 * pick list (a bigger group size) is kept intact rather than truncated to 3.
 */
export function capPickLists(
  picks: Record<string, string[]>,
  targetSize?: number,
): Record<string, string[]> {
  const limit = pickLimitForTargetSize(targetSize);
  const capped: Record<string, string[]> = {};
  for (const [picker, chosen] of Object.entries(picks)) {
    capped[picker] = Array.isArray(chosen) ? chosen.slice(0, limit) : [];
  }
  return capped;
}

/** Slide-type-specific submission payload: the peers this participant picked. */
export interface PickAttributes {
  pickedPeerIds: string[];
}

/** `minSize` must not exceed the sibling `targetSize`, or a group can never reach it. */
@ValidatorConstraint({ name: 'minSizeNotAboveTargetSize', async: false })
class MinSizeNotAboveTargetSize implements ValidatorConstraintInterface {
  validate(minSize: unknown, args: ValidationArguments): boolean {
    const { targetSize } = args.object as FormGroupsRequestDto;
    if (typeof minSize !== 'number' || typeof targetSize !== 'number') return true;
    return minSize <= targetSize;
  }

  defaultMessage(): string {
    return 'minSize must be less than or equal to targetSize';
  }
}

/**
 * Request body for `POST /preferenceGrouping/external/form-groups`.
 *
 * The presenter collects every participant's private picks (which it alone is
 * authorised to read) and posts them here; the peer ids never travel over the
 * shared live topics, so no client can reconstruct who picked whom.
 */
export class FormGroupsRequestDto {
  /** The full roster to place — every joined participant, abstainers included. */
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(MAX_ROOM_SIZE)
  participantIds!: string[];

  /** participantId -> the peer ids they picked. */
  @IsObject()
  picks!: Record<string, string[]>;

  /** Ideal group size (default 4). */
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(MAX_TARGET_SIZE)
  targetSize?: number;

  /** Smallest acceptable group where headcount allows (default 3). */
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(MAX_TARGET_SIZE)
  @Validate(MinSizeNotAboveTargetSize)
  minSize?: number;

  /** Optional seed so a re-run reproduces the same groups. */
  @IsOptional()
  @IsInt()
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
