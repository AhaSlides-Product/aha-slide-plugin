// Shared package-name mapping for the publish workflows.
//
// Single source of truth for "local @aha/* name -> published @ahaslides-product/*
// name", used by both publish-packages.yaml (GitHub Packages) and
// publish-packages-npmjs.yaml (public npm) so the mapping logic lives in ONE place.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** local package name -> published package name. */
export const NAME_MAP = JSON.parse(
  readFileSync(new URL('./name-map.json', import.meta.url), 'utf8'),
);

/** Expand root package.json workspace globs to dirs that contain a package.json. */
export function expandWorkspaces(patterns) {
  const results = [];
  for (const pat of patterns) {
    const parts = pat.split('/');
    let candidates = [''];
    for (const part of parts) {
      const next = [];
      for (const c of candidates) {
        if (part === '*') {
          const dir = c || '.';
          let entries = [];
          try { entries = readdirSync(dir, { withFileTypes: true }); } catch {}
          for (const e of entries) {
            if (e.isDirectory()) next.push(c ? join(c, e.name) : e.name);
          }
        } else {
          next.push(c ? join(c, part) : part);
        }
      }
      candidates = next;
    }
    results.push(...candidates);
  }
  return results.filter((p) => {
    try { return statSync(join(p, 'package.json')).isFile(); } catch { return false; }
  });
}

/**
 * Build a Map of local package name -> { path, dir, pkg } across all workspaces,
 * and fail fast if any NAME_MAP entry has no matching workspace package.
 */
export function workspaceInfo() {
  const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const dirs = expandWorkspaces(rootPkg.workspaces || []);
  const infoByLocal = new Map();
  for (const dir of dirs) {
    const pkgPath = join(dir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    infoByLocal.set(pkg.name, { path: pkgPath, dir, pkg });
  }
  for (const local of Object.keys(NAME_MAP)) {
    if (!infoByLocal.has(local)) {
      console.error('::error::Mapped package not found in workspaces: ' + local);
      process.exit(1);
    }
  }
  return infoByLocal;
}
