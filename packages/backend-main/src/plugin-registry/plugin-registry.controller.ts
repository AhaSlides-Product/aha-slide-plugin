import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PluginRegistryService } from './plugin-registry.service';
import type { PluginDescriptor } from './plugin-registry.types';

/**
 * Publish-registry HOST for install-by-ID.
 *
 * Route note: the global prefix is `api/plugins` (see main.ts). The public
 * CloudFront gateway in front of the ECS backend only forwards paths shaped
 * `/api/plugins/*<sla>/external/*` to the backend (the documented `external/`
 * custom-API convention, README) — a bare `/api/plugins/plugin-registry` falls
 * through to the S3 frontend. So this controller is mounted UNDER `external/` to
 * stay reachable through the gateway. Full paths:
 *   GET  /api/plugins/plugin-registry/external/list
 *   POST /api/plugins/plugin-registry/external/register
 */
@Controller('plugin-registry/external')
export class PluginRegistryController {
  constructor(private readonly registry: PluginRegistryService) {}

  /** Returns `{ plugins: [...] }` — the shape the presenter `fetchRegistry` accepts. */
  @Get('list')
  list(): { plugins: PluginDescriptor[] } {
    return { plugins: this.registry.list() };
  }

  /**
   * Register/swap a plugin descriptor at runtime (EPHEMERAL — see the service).
   * 200 with the stored descriptor on success, 400 on an invalid descriptor.
   */
  @Post('register')
  @HttpCode(HttpStatus.OK)
  register(@Body() body: unknown): { ok: true; plugin: PluginDescriptor } {
    const plugin = this.registry.register(body);
    return { ok: true, plugin };
  }
}
