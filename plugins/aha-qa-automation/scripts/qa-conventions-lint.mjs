#!/usr/bin/env node
/**
 * qa-conventions-lint — validator for stage 5 (qa-impl-objects / qa-impl-specs).
 *
 * Enforces the `rules` block of a repo's .qa-profile.json against its spec files and
 * Page Objects. Every rule is opt-in per repo: a rule that is absent or false is simply
 * not checked. That is what lets longbien, aha-survey, aha-slide-plugin and a brand new
 * repo share one linter while keeping four different standards.
 *
 *   node qa-conventions-lint.mjs <path-to-.qa-profile.json> [--only <file> ...]
 *
 * --only restricts checking to specific files (used to lint just the diff).
 *
 * Exit 0 = pass. Exit 1 = violations found. No dependencies.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join, basename, relative } from 'node:path';

const argv = process.argv.slice(2);
const profilePath = argv.find((a) => !a.startsWith('--'));
const onlyIdx = argv.indexOf('--only');
const only = onlyIdx === -1 ? null : argv.slice(onlyIdx + 1).filter((a) => !a.startsWith('--')).map((p) => resolve(p));

if (!profilePath) {
  console.error('usage: qa-conventions-lint.mjs <path-to-.qa-profile.json> [--only <file> ...]');
  process.exit(2);
}

const profile = JSON.parse(readFileSync(profilePath, 'utf8'));
const rules = profile.rules ?? {};
const profileDir = dirname(resolve(profilePath));
const repoRootAbs = !profile.testRoot || profile.testRoot === '.' ? profileDir : resolve(profileDir, '..');
const resolveDeclared = (p) => (p.startsWith('<repo>/') ? join(repoRootAbs, p.slice(7)) : join(profileDir, p));

const violations = [];
const add = (file, line, rule, msg) =>
  violations.push({ file: relative(repoRootAbs, file), line, rule, msg });

/* ------------------------------------------------------------- helpers --- */

const CODE_EXT = /\.(ts|js|mjs|tsx|jsx)$/;
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (CODE_EXT.test(entry)) out.push(p);
  }
  return out;
}

const inScope = (f) => !only || only.includes(resolve(f));

/** Strip line- and block-comments so rules don't fire on documentation of the rule. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, (m, p1) => p1 + ' '.repeat(Math.max(0, m.length - p1.length)));
}

const linesOf = (src) => src.split('\n');

/* ------------------------------------------------------------ 1. specs --- */

const specFiles = Object.values(profile.paths?.specs ?? {})
  .flatMap((d) => walk(resolveDeclared(d)))
  .filter((f) => inScope(f));

const RAW_LOCATOR = /\bpage\s*\.\s*(getByTestId|locator|getByRole|getByText|getByLabel|getByPlaceholder)\s*\(/;
const TEST_DECL = /(?:^|\s)(?:test|it)(?:\.(?:skip|only|fixme|fail))?\s*\(\s*(['"`])([\s\S]*?)\1/g;

for (const file of specFiles) {
  const raw = readFileSync(file, 'utf8');
  const src = stripComments(raw);
  const lines = linesOf(src);

  if (rules.noRawLocatorsInSpecs) {
    lines.forEach((l, i) => {
      if (RAW_LOCATOR.test(l)) {
        add(file, i + 1, 'noRawLocatorsInSpecs',
          `raw locator in a spec — move it to a Page Object getter: ${l.trim().slice(0, 100)}`);
      }
    });
  }

  if (rules.requireCaseIdInTitle !== false && profile.caseIdPattern) {
    const caseRe = new RegExp(profile.caseIdPattern);
    let m;
    TEST_DECL.lastIndex = 0;
    while ((m = TEST_DECL.exec(src)) !== null) {
      const title = m[2];
      if (!caseRe.test(title)) {
        const line = src.slice(0, m.index).split('\n').length;
        add(file, line, 'requireCaseIdInTitle',
          `test title has no case id matching /${profile.caseIdPattern}/: "${title.slice(0, 80)}"`);
      }
    }
  }
}

/* ----------------------------------------------------- 2. page objects --- */

const poDirs = [profile.paths?.pages, profile.paths?.apiObjects].filter(Boolean);
const poFiles = poDirs.flatMap((d) => walk(resolveDeclared(d))).filter((f) => inScope(f));

const METHOD_DECL = /^\s*(?:async\s+)?(?:public\s+|private\s+|protected\s+)?([A-Za-z_$][\w$]*)\s*\(/;
const RETURNS_LOCATOR = /\)\s*:\s*Locator\b/;

for (const file of poFiles) {
  const raw = readFileSync(file, 'utf8');
  const src = stripComments(raw);
  const lines = linesOf(src);
  const base = basename(file);

  if (rules.pageObjectFileSuffix && profile.paths?.pages && file.startsWith(resolveDeclared(profile.paths.pages))) {
    const suffix = rules.pageObjectFileSuffix;
    const isBarrel = base === 'index.ts' || base === 'index.js';
    if (!isBarrel && !base.endsWith(suffix)) {
      add(file, 1, 'pageObjectFileSuffix', `Page Object file must end with '${suffix}', got '${base}'`);
    }
  }

  if (rules.pageObjectClassSuffix) {
    lines.forEach((l, i) => {
      const m = l.match(/^\s*export\s+(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/);
      if (m && !m[1].endsWith(rules.pageObjectClassSuffix) && !/^Base/.test(m[1])) {
        add(file, i + 1, 'pageObjectClassSuffix',
          `class '${m[1]}' must end with '${rules.pageObjectClassSuffix}'`);
      }
    });
  }

  // Track the enclosing method so waitFor* can be exempted from the no-expect rule.
  let currentMethod = null;
  lines.forEach((l, i) => {
    const md = l.match(METHOD_DECL);
    if (md && !/^(if|for|while|switch|catch|return|await|constructor|function)$/.test(md[1])) {
      currentMethod = md[1];

      if (rules.locatorGetterPrefix && RETURNS_LOCATOR.test(l) && !md[1].startsWith(rules.locatorGetterPrefix)) {
        add(file, i + 1, 'locatorGetterPrefix',
          `method '${md[1]}' returns Locator so it must start with '${rules.locatorGetterPrefix}'`);
      }
    }

    if (rules.noExpectInPageObjects && /(?:^|[^.\w])expect\s*\(/.test(l)) {
      const exempt = currentMethod && /^waitFor/i.test(currentMethod);
      if (!exempt) {
        add(file, i + 1, 'noExpectInPageObjects',
          `expect() inside a Page Object${currentMethod ? ` (method '${currentMethod}')` : ''} — assertions belong in the spec` +
            ` (only waitFor* methods are exempt)`);
      }
    }
  });
}

/* ------------------------------------------------------------- report --- */

const checked = specFiles.length + poFiles.length;
const enabled = Object.entries(rules).filter(([, v]) => v !== false && v !== null).map(([k]) => k);

if (!violations.length) {
  console.log(`qa-conventions-lint: PASS — ${checked} file(s), rules: ${enabled.join(', ') || 'none enabled'}`);
  process.exit(0);
}

const byFile = new Map();
for (const v of violations) {
  if (!byFile.has(v.file)) byFile.set(v.file, []);
  byFile.get(v.file).push(v);
}
for (const [file, vs] of byFile) {
  console.log(`\n${file}`);
  for (const v of vs.sort((a, b) => a.line - b.line)) console.log(`  ${v.line}:  [${v.rule}] ${v.msg}`);
}
console.log(`\nqa-conventions-lint: FAIL — ${violations.length} violation(s) across ${byFile.size} file(s)`);
process.exit(1);
