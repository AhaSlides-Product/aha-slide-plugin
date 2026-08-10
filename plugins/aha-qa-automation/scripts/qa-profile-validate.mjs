#!/usr/bin/env node
/**
 * qa-profile-validate — validator for stage 0 (qa-repo-audit).
 *
 * Checks that a .qa-profile.json is (a) shaped correctly, (b) points only at paths
 * that actually exist, and (c) declares commands that actually execute.
 *
 * A profile that passes shape-checking but names a directory that isn't there is the
 * exact failure this guards: every later skill trusts the profile blindly, so a wrong
 * profile produces confidently-misplaced code.
 *
 *   node qa-profile-validate.mjs <path-to-.qa-profile.json> [--run-commands]
 *
 * Exit 0 = pass. Exit 1 = fail (findings printed). No dependencies.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';

const args = process.argv.slice(2);
const profilePath = args.find((a) => !a.startsWith('--'));
const runCommands = args.includes('--run-commands');

if (!profilePath) {
  console.error('usage: qa-profile-validate.mjs <path-to-.qa-profile.json> [--run-commands]');
  process.exit(2);
}

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

if (!existsSync(profilePath)) {
  console.error(`FAIL: profile not found at ${profilePath}`);
  process.exit(1);
}

let profile;
try {
  profile = JSON.parse(readFileSync(profilePath, 'utf8'));
} catch (e) {
  console.error(`FAIL: profile is not valid JSON — ${e.message}`);
  process.exit(1);
}

/* ---------------------------------------------------------------- shape --- */

const REQUIRED = ['version', 'repo', 'archetype', 'language', 'testRoot', 'paths', 'commands', 'caseIdPattern'];
for (const k of REQUIRED) {
  if (profile[k] === undefined) err(`missing required key: ${k}`);
}

if (profile.version !== 1) err(`version must be 1, got ${JSON.stringify(profile.version)}`);
if (!['standalone-qa', 'product-repo'].includes(profile.archetype))
  err(`archetype must be 'standalone-qa' or 'product-repo', got ${JSON.stringify(profile.archetype)}`);
if (!['js', 'ts'].includes(profile.language))
  err(`language must be 'js' or 'ts', got ${JSON.stringify(profile.language)}`);

const paths = profile.paths ?? {};
for (const k of ['specs', 'pages', 'fixtures', 'designDocs']) {
  if (paths[k] === undefined) err(`missing required key: paths.${k}`);
}
if (paths.specs && (typeof paths.specs !== 'object' || Object.keys(paths.specs).length === 0))
  err('paths.specs must be a non-empty object mapping layer name -> directory');

const commands = profile.commands ?? {};
for (const k of ['run', 'runOne']) {
  if (!commands[k]) err(`missing required key: commands.${k}`);
}
if (commands.runOne && !commands.runOne.includes('{file}'))
  err("commands.runOne must contain the '{file}' placeholder");
if (profile.language === 'ts' && !commands.typecheck)
  warn("language is 'ts' but commands.typecheck is not set — the implement stage cannot typecheck this repo");

// caseIdPattern must compile, and must not match everything.
if (profile.caseIdPattern) {
  try {
    const re = new RegExp(profile.caseIdPattern);
    if (re.test('')) err('caseIdPattern matches the empty string — it would match every test title');
  } catch (e) {
    err(`caseIdPattern is not a valid regex: ${e.message}`);
  }
}

// lowerLayers shape
for (const [i, l] of (profile.lowerLayers ?? []).entries()) {
  for (const k of ['kind', 'tool', 'cmd']) {
    if (!l[k]) err(`lowerLayers[${i}] missing required key: ${k}`);
  }
  if (l.kind && !['unit', 'integration', 'contract', 'property', 'load'].includes(l.kind))
    err(`lowerLayers[${i}].kind is not a recognised layer: ${l.kind}`);
}

/* ---------------------------------------------------- paths really exist --- */

// Profile lives at <repoRoot>/<testRoot>/.qa-profile.json, so repo root is two hops up
// unless testRoot is '.'.
const profileDir = dirname(resolve(profilePath));
const testRootAbs = profileDir;
const repoRootAbs =
  !profile.testRoot || profile.testRoot === '.' ? profileDir : resolve(profileDir, '..');

const resolveDeclared = (p) => (p.startsWith('<repo>/') ? join(repoRootAbs, p.slice(7)) : join(testRootAbs, p));

const checkDir = (label, p) => {
  if (p === null || p === undefined) return;
  const abs = resolveDeclared(p);
  if (!existsSync(abs)) return err(`${label} points at a path that does not exist: ${p}  (resolved: ${abs})`);
  if (!statSync(abs).isDirectory()) err(`${label} is not a directory: ${p}`);
};

const checkFile = (label, p) => {
  const abs = resolveDeclared(p);
  if (!existsSync(abs)) err(`${label} points at a file that does not exist: ${p}  (resolved: ${abs})`);
};

if (paths.specs) for (const [layer, dir] of Object.entries(paths.specs)) checkDir(`paths.specs.${layer}`, dir);
checkDir('paths.pages', paths.pages);
checkDir('paths.apiObjects', paths.apiObjects);
checkDir('paths.fixtures', paths.fixtures);
checkDir('paths.helpers', paths.helpers);
// designDocs is allowed not to exist yet — it is created by the design stage.
if (paths.designDocs && !existsSync(resolveDeclared(paths.designDocs)))
  warn(`paths.designDocs does not exist yet: ${paths.designDocs} — the design stage will create it`);

for (const c of profile.conventions ?? []) checkFile('conventions entry', c);

const zephyr = profile.integrations?.zephyr;
if (zephyr?.enabled && zephyr.folderMap) checkFile('integrations.zephyr.folderMap', zephyr.folderMap);

// A playwright config must be findable at testRoot, else `run` cannot work.
const hasPwConfig = ['playwright.config.ts', 'playwright.config.js', 'playwright.config.mjs'].some((f) =>
  existsSync(join(testRootAbs, f)),
);
if (!hasPwConfig) err(`no playwright.config.{ts,js,mjs} found in testRoot (${testRootAbs})`);

/* ------------------------------------------------- commands really run --- */

if (runCommands) {
  const probe = (label, cmd, cwd) => {
    if (!cmd) return;
    try {
      execSync(cmd, { cwd, stdio: 'pipe', timeout: 180_000 });
    } catch (e) {
      const out = `${e.stdout ?? ''}${e.stderr ?? ''}`.toString().trim().split('\n').slice(-4).join('\n');
      err(`${label} failed to execute: \`${cmd}\`\n      ${out}`);
    }
  };
  // `run` is probed in list-only mode so we don't execute the suite.
  probe('commands.run (--list)', `${commands.run} --list`, testRootAbs);
  probe('commands.typecheck', commands.typecheck, testRootAbs);
  for (const l of profile.lowerLayers ?? []) {
    const cwd = l.root ? join(repoRootAbs, l.root) : repoRootAbs;
    if (!existsSync(cwd)) err(`lowerLayers root does not exist: ${l.root}`);
  }
}

/* ------------------------------------------------------------- report --- */

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`FAIL  ${e}`);

if (errors.length) {
  console.log(`\nqa-profile-validate: FAIL — ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
console.log(
  `qa-profile-validate: PASS — ${profile.repo} (${profile.archetype}, ${profile.language})` +
    `${warnings.length ? `, ${warnings.length} warning(s)` : ''}`,
);
