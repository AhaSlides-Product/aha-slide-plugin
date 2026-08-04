import { BadRequestException, Injectable } from '@nestjs/common';
import type { PluginDescriptor } from './plugin-registry.types';
import { REGISTRY_SEED } from './plugin-registry.seed';
import { descriptorKey, mergeRegistry, validationError } from './plugin-registry.logic';

/**
 * Serves the plugin registry the presenter resolves install-by-ID against.
 *
 * Storage model:
 *  - `REGISTRY_SEED` is the DURABLE catalogue (committed; a durable publish is a PR).
 *  - `overlay` is an EPHEMERAL, in-memory upsert layer for runtime register/swap
 *    during testing. It is lost on restart and NOT shared across ECS instances
 *    (staging dev01 runs a single task, so it is consistent there). A durable
 *    runtime publish needs a datastore — deliberately out of scope this round.
 */
@Injectable()
export class PluginRegistryService {
  private readonly overlay = new Map<string, PluginDescriptor>();

  /** Full registry: committed seed with the in-memory overlay applied on top. */
  list(): PluginDescriptor[] {
    return mergeRegistry(REGISTRY_SEED, this.overlay);
  }

  /**
   * Validate and upsert a descriptor into the ephemeral overlay (by kind+id).
   * @throws BadRequestException (HTTP 400) when the descriptor is invalid.
   */
  register(input: unknown): PluginDescriptor {
    const error = validationError(input);
    if (error) {
      throw new BadRequestException(`Invalid plugin descriptor: ${error}`);
    }
    const descriptor = input as PluginDescriptor;
    this.overlay.set(descriptorKey(descriptor), descriptor);
    return descriptor;
  }
}
