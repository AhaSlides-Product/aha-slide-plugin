#!/usr/bin/env node
/**
 * qa-design-coverage — validator for stage 5 (qa-impl-specs).
 *
 * Checks the design document and the implemented specs against each other, in BOTH
 * directions:
 *
 *   missing  — a case was designed for an automatable layer but no test implements it
 *   orphan   — a test exists whose case id appears in no design document
 *   dup      — the same case id is implemented by more than one test
 *
 * The both-directions check is the point. One direction alone lets an agent quietly
 * drop the hard cases (caught by `missing`) or invent cases nobody reviewed (caught by
 * `orphan`).
 *
 * Cases whose designed layer is a lower layer (unit/integration) are NOT expected in the
 * Playwright suite — they are reported separately as `lower-layer` so they can be checked
 * against the repo's own unit suite rather than silently promoted to E2E.
 *
 *   node qa-design-coverage.mjs <path-to-.qa-profile.json> <design-doc.md> [more-docs.md ...]
 *
 * Exit 0 = pass. Exit 1 = missing/orphan/dup found. No dependencies.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';

const argv = process.argv.slice(2);
const [profilePath, ...designDocs] = argv.filter((a) => !a.startsWith('--'));
const allowOrphans = argv.includes('--allow-orphans');

if (!profilePath || designDocs.length === 0) {
  console.error('usage: qa-design-coverage.mjs <path-to-.qa-profile.json> <design-doc.md> [...]');
  process.exit(2);
}

const profile = JSON.parse(readFileSync(profilePath, 'utf8'));
const profileDir = dirname(resolve(profilePath));
const repoRootAbs = !profile.testRoot || profile.testRoot === '.' ? profileDir : resolve(profileDir, '..');
const resolveDeclared = (p) => (p.startsWith('<repo>/') ? join(repoRootAbs, p.slice(7)) : join(profileDir, p));

const caseRe = new RegExp(profile.caseIdPattern, 'g');
const LOWER_LAYERS = new Set(['unit', 'integration', 'contract', 'property', 'load']);
const AUTOMATABLE = new Set(['api', 'e2e', ...Object.keys(profile.paths?.specs ?? {})]);

/* ------------------------------------------------- 1. read the designs --- */

/** id -> { layer, doc, line } */
const designed = new Map();
const layerless = [];

for (const doc of designDocs) {
  if (!existsSync(doc)) {
    console.error(`FAIL: design document not found: ${doc}`);
    process.exit(1);
  }
  const lines = readFileSync(doc, 'utf8').split('\n');
  lines.forEach((line, i) => {
    caseRe.lastIndex = 0;
    const ids = [...line.matchAll(caseRe)].map((m) => m[0]);
    if (!ids.length) return;
    // Layer marker on the same line: a table cell, or `layer: xxx`, or a bare token.
    const lower = line.toLowerCase();
    const explicit = lower.match(/\blayer\s*[:=]\s*([a-z]+)/)?.[1];
    const cell = [...LOWER_LAYERS, ...AUTOMATABLE].find((l) =>
      new RegExp(`(^|[|(\\s])${l}([|)\\s,]|$)`, 'i').test(lower),
    );
    const layer = explicit ?? cell ?? null;
    for (const id of ids) {
      if (designed.has(id)) continue; // first mention wins (title row, not the detail body)
      if (!layer) layerless.push({ id, doc, line: i + 1 });
      designed.set(id, { layer: layer ?? 'e2e', doc, line: i + 1 });
    }
  });
}

/* ------------------------------------------------- 2. read the specs ----- */

const CODE_EXT = /\.(ts|js|mjs|tsx|jsx)$/;
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const p = join(dir, entry);
    statSync(p).isDirectory() ? walk(p, out) : CODE_EXT.test(entry) && out.push(p);
  }
  return out;
}

const TEST_DECL = /(?:^|\s)(?:test|it)(?:\.(?:skip|only|fixme|fail))?\s*\(\s*(['"`])([\s\S]*?)\1/g;

/** id -> [{file, title, skipped}] */
const implemented = new Map();

for (const [layer, dir] of Object.entries(profile.paths?.specs ?? {})) {
  for (const file of walk(resolveDeclared(dir))) {
    const src = readFileSync(file, 'utf8');
    let m;
    TEST_DECL.lastIndex = 0;
    while ((m = TEST_DECL.exec(src)) !== null) {
      const title = m[2];
      const skipped = /\.(skip|fixme)\s*\($/.test(src.slice(Math.max(0, m.index), m.index + m[0].indexOf('(') + 1));
      caseRe.lastIndex = 0;
      for (const idMatch of title.matchAll(caseRe)) {
        const id = idMatch[0];
        if (!implemented.has(id)) implemented.set(id, []);
        implemented.get(id).push({ file: relative(repoRootAbs, file), title, layer, skipped });
      }
    }
  }
}

/* ------------------------------------------------------ 3. compare ------ */

const missing = [];
const lowerLayer = [];
for (const [id, meta] of designed) {
  if (LOWER_LAYERS.has(meta.layer)) {
    lowerLayer.push({ id, ...meta });
    continue;
  }
  if (!implemented.has(id)) missing.push({ id, ...meta });
}

const orphans = [...implemented.keys()].filter((id) => !designed.has(id));
const dups = [...implemented.entries()].filter(([, hits]) => hits.length > 1);

/* -------------------------------------------------------- 4. report ----- */

const line = (s = '') => console.log(s);

if (lowerLayer.length) {
  line(`\nLOWER-LAYER (${lowerLayer.length}) — designed for a non-Playwright layer, not expected in the suite:`);
  for (const c of lowerLayer) line(`  ${c.id}  [${c.layer}]  ${relative(repoRootAbs, resolve(c.doc))}:${c.line}`);
  if (!(profile.lowerLayers ?? []).length)
    line(`  NOTE: this repo declares no lowerLayers in its profile — these are gap recommendations,`);
  if (!(profile.lowerLayers ?? []).length)
    line(`        and must NOT be re-implemented as E2E to make this report green.`);
}

if (layerless.length) {
  line(`\nWARN (${layerless.length}) — case has no layer marker in the design doc, assumed 'e2e':`);
  for (const c of layerless.slice(0, 10)) line(`  ${c.id}  ${relative(repoRootAbs, resolve(c.doc))}:${c.line}`);
  if (layerless.length > 10) line(`  ... and ${layerless.length - 10} more`);
}

if (missing.length) {
  line(`\nMISSING (${missing.length}) — designed but not implemented:`);
  for (const c of missing) line(`  ${c.id}  [${c.layer}]  ${relative(repoRootAbs, resolve(c.doc))}:${c.line}`);
}

if (orphans.length) {
  line(`\nORPHAN (${orphans.length}) — implemented but absent from every design doc:`);
  for (const id of orphans) for (const h of implemented.get(id)) line(`  ${id}  ${h.file}  "${h.title.slice(0, 70)}"`);
}

if (dups.length) {
  line(`\nDUPLICATE (${dups.length}) — one case id implemented by several tests:`);
  for (const [id, hits] of dups) {
    line(`  ${id}`);
    for (const h of hits) line(`      ${h.file}  "${h.title.slice(0, 70)}"`);
  }
}

const skipped = [...implemented.entries()].filter(([, hits]) => hits.every((h) => h.skipped)).map(([id]) => id);
if (skipped.length) line(`\nNOTE — implemented but skipped: ${skipped.join(', ')}`);

const hardFail = missing.length + dups.length + (allowOrphans ? 0 : orphans.length);
const designedAutomatable = designed.size - lowerLayer.length;
line(
  `\nqa-design-coverage: ${hardFail ? 'FAIL' : 'PASS'} — ` +
    `${designedAutomatable - missing.length}/${designedAutomatable} automatable case(s) implemented, ` +
    `${orphans.length} orphan(s), ${dups.length} duplicate(s), ${lowerLayer.length} lower-layer.`,
);
process.exit(hardFail ? 1 : 0);
