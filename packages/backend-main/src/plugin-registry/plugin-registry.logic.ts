/**
 * Pure, dependency-free registry logic (no Nest imports), so it can be unit-tested
 * without the framework and reused by the service. Mirrors the presenter consumer's
 * `isValidDescriptor` trust rules exactly (see plugin-registry.types.ts).
 */
import type { PluginDescriptor, PluginKind } from './plugin-registry.types';

const KINDS: PluginKind[] = ['slide', 'embed'];

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** A trusted URL is an http(s) absolute URL string. Anything else is rejected. */
export function isHttpUrl(v: unknown): v is string {
  if (typeof v !== 'string' || v.length === 0) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Validate an untrusted descriptor against the consumer's trust rules.
 * @returns null when valid, otherwise a human-readable reason string.
 */
export function validationError(input: unknown): string | null {
  if (!isPlainObject(input)) return 'descriptor must be an object';

  const { id, kind, name, version, payload } = input as Record<string, unknown>;

  if (!isNonEmptyString(id)) return 'id must be a non-empty string';
  if (typeof kind !== 'string' || !KINDS.includes(kind as PluginKind)) {
    return `kind must be one of ${KINDS.join(', ')}`;
  }
  if (!isNonEmptyString(name)) return 'name must be a non-empty string';
  if (!isNonEmptyString(version)) return 'version must be a non-empty string';
  if (!isPlainObject(payload)) return 'payload must be an object';

  if (kind === 'embed') {
    if (!isHttpUrl(payload.baseUrl)) return 'embed payload.baseUrl must be an http(s) URL';
    if (payload.staticTabs !== undefined) {
      if (!Array.isArray(payload.staticTabs)) return 'embed payload.staticTabs must be an array';
      for (const tab of payload.staticTabs) {
        if (!isPlainObject(tab) || !isHttpUrl(tab.contentUrl)) {
          return 'embed payload.staticTabs[].contentUrl must be an http(s) URL';
        }
      }
    }
  } else {
    // kind === 'slide'
    if (!isNonEmptyString(payload.type)) return 'slide payload.type must be a non-empty string';
    if (!isHttpUrl(payload.canvasUrl)) return 'slide payload.canvasUrl must be an http(s) URL';
    for (const key of ['audienceUrl', 'editorUrl', 'settingUrl'] as const) {
      if (payload[key] !== undefined && !isHttpUrl(payload[key])) {
        return `slide payload.${key} must be an http(s) URL when present`;
      }
    }
  }

  return null;
}

export function isValidDescriptor(input: unknown): input is PluginDescriptor {
  return validationError(input) === null;
}

/** Stable de-dup key: a plugin is identified by (kind, id). */
export function descriptorKey(d: Pick<PluginDescriptor, 'kind' | 'id'>): string {
  return `${d.kind}:${d.id}`;
}

/**
 * Merge a base list with an overlay map, overlay winning on the same (kind, id).
 * Order: base entries first (in their original order, overlaid in place),
 * then any overlay-only entries appended.
 */
export function mergeRegistry(
  base: readonly PluginDescriptor[],
  overlay: ReadonlyMap<string, PluginDescriptor>,
): PluginDescriptor[] {
  const seen = new Set<string>();
  const out: PluginDescriptor[] = [];
  for (const d of base) {
    const key = descriptorKey(d);
    seen.add(key);
    out.push(overlay.get(key) ?? d);
  }
  for (const [key, d] of overlay) {
    if (!seen.has(key)) out.push(d);
  }
  return out;
}
