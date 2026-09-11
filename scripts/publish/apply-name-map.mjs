// Rewrites each mapped workspace package to its published name — package.json
// `name`, cross-mapped `@aha/*` dep keys, and source imports — so the workspace
// can be published under the @ahaslides-product scope. Used by both publish
// workflows.
//
// Env:
//   PUBLISH_REGISTRY  when set, inject `publishConfig { access: public, registry }`
//                     into each mapped package.json (public npm needs it; the
//                     GitHub-Packages workflow leaves it unset).

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { NAME_MAP, workspaceInfo } from './name-map.mjs';

const infoByLocal = workspaceInfo();
const registry = process.env.PUBLISH_REGISTRY;

// 1. package.json: rename + remap cross-deps + optional publishConfig.
for (const local of Object.keys(NAME_MAP)) {
  const info = infoByLocal.get(local);
  info.pkg.name = NAME_MAP[local];
  if (registry) {
    // Scoped packages default to restricted; force public on the target registry.
    info.pkg.publishConfig = Object.assign({}, info.pkg.publishConfig, {
      access: 'public',
      registry,
    });
  }
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    if (!info.pkg[field]) continue;
    for (const [depName, depVer] of Object.entries(info.pkg[field])) {
      if (NAME_MAP[depName]) {
        delete info.pkg[field][depName];
        info.pkg[field][NAME_MAP[depName]] = depVer;
      }
    }
  }
  writeFileSync(info.path, JSON.stringify(info.pkg, null, 2) + '\n');
  console.log('Rewrote ' + info.path + ': ' + local + ' -> ' + NAME_MAP[local]);
}

// 2. source imports of each mapped package.
const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue']);
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', 'build', '.turbo', 'docs', '.git']);
const esc = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
const patterns = Object.entries(NAME_MAP).map(([local, published]) => ({
  regex: new RegExp('([\'"`])' + esc(local) + '\\1', 'g'),
  replacement: '$1' + published + '$1',
}));

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (SOURCE_EXTS.has(extname(entry.name))) {
      let content = readFileSync(full, 'utf8');
      let changed = false;
      for (const { regex, replacement } of patterns) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          changed = true;
        }
      }
      if (changed) {
        writeFileSync(full, content);
        console.log('Rewrote imports in ' + full);
      }
    }
  }
}

for (const local of Object.keys(NAME_MAP)) {
  walk(infoByLocal.get(local).dir);
}
