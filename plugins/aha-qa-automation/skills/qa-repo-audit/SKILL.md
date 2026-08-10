---
name: qa-repo-audit
description: Use when onboarding a repository to the QA automation pipeline, or when asked what test coverage a repo already has — triggers on "audit tests in this repo", "what tests does this repo have", "set up QA for this repo", "generate qa profile", "kiểm tra test hiện có". Inventories every test layer (unit/integration/API/E2E), reads the repo's own convention docs, and emits a validated .qa-profile.json that every later QA skill reads instead of guessing paths.
---

# Stage 0 — Repo Audit

## Purpose

Produce two artifacts for a repository:

1. **`<testRoot>/.qa-profile.json`** — the machine-readable adapter every other skill in
   this plugin reads. It declares where page objects live, how to run one test, what a
   valid case id looks like, which conventions apply, and which lower test layers already
   exist.
2. **`<testRoot>/docs/qa-audit.md`** — the human-readable inventory: what is covered
   today, by which layer, and where the gaps are.

**Why the profile exists.** The standard structure in this plugin applies to *new* repos
only. Existing repos are never migrated — so the pipeline has to work against
`objects/pages` in one repo and `tests/pages` in another, JS in one and TS in another,
`AHA-T3015` ids in one and `B-TC18` in another. Rather than branch on repo name, every
skill reads the profile. **One skill body, N profiles.** Without a correct profile the
later stages write confidently-misplaced code.

## When to use

- First time a repo is used with this plugin (required — later stages refuse to run without it).
- After a repo restructures its test layer.
- When someone asks "what test coverage do we have here?"

Not for: designing cases (`qa-design-cases`), writing specs (`qa-implement`).

## Inputs

1. **repo root** — default: the current working directory. Confirm with the user if the
   session spans several repos.
2. **existing profile** — if `<testRoot>/.qa-profile.json` already exists, read it, and
   ask: refresh (re-derive and diff), or abort. Never silently overwrite a
   human-reviewed profile.

## Process

### 1. Locate the test root

Find `playwright.config.{ts,js,mjs}`. Ignore anything under `node_modules`.

- Exactly one, at repo root → `archetype: standalone-qa`, `testRoot: "."`.
- Exactly one, in a subdirectory → `archetype: product-repo`, `testRoot: "<that dir>"`.
- **More than one** → do not guess. List them with the spec count under each and ask which
  is canonical. Record the others in the audit under "Competing test locations" — this is a
  real finding, not noise (aha-survey has both `tests/specs/e2e/` and `frontend/e2e/`, and
  only the former follows its POM rules).
- **None** → this is a greenfield repo. Stop, report that, and offer `qa-scaffold`. Do not
  invent a profile for a suite that does not exist.

### 2. Read the repo's own conventions — before looking at any code

Collect, in precedence order (general → specific):

`CLAUDE.md` (root) → `<testRoot>/CLAUDE.md` → any of
`TEST_SCRIPT_RULES.md`, `QA_STANDARDS.md`, `QA_GUIDE.md`, `CONVENTIONS.md`,
`CONTRIBUTING.md`, `README.md` under `<testRoot>` or `docs/guidance/`.

List every one that exists in `conventions[]`. **These files outrank this plugin's
defaults for that repo.** Read them now — they usually state the naming rules and the
locator policy outright, which saves inferring them in step 5.

### 3. Map the directory layout

Derive `paths.*` by inspection, not assumption:

| Profile key | Find it by |
|---|---|
| `paths.specs` | Directories under `testRoot` containing `*.spec.*` / `*.test.*`. Group into layers by directory name (`api`, `e2e`, `ui-based`, `accessibility`, `visual`). Use the repo's own directory names as the layer keys. |
| `paths.pages` | Directory of classes holding locators — `pages/`, `objects/pages/`, `page-objects/`. |
| `paths.apiObjects` | Directory of API request wrappers — `objects/apis/`, `api/`. `null` if the repo calls the API from helpers instead. |
| `paths.fixtures` | Directory exporting the extended `test` object. |
| `paths.helpers` | Business-logic helpers with no locators. `null` if absent. |
| `paths.designDocs` | Existing test-design docs if any; otherwise default to `docs/test-design`. Allowed not to exist yet. |

### 4. Derive the commands

Read `<testRoot>/package.json` scripts and the repo's README. Prefer a script the repo
already defines (`npm run test:staging`) over a raw invocation — the script usually carries
required env setup.

`commands.runOne` MUST contain `{file}`, and `{id}` when the repo greps by case id, e.g.
`npx playwright test {file} --grep "{id}"`.

Set `commands.typecheck` whenever `language` is `ts` and a `tsconfig.json` exists
(`npx tsc --noEmit`). Set `commands.lint` only if the repo has a lint config.

### 5. Infer `caseIdPattern` and `rules` from evidence

Do not copy this plugin's defaults. **Sample the repo and let it tell you its rules.**

**`caseIdPattern`** — extract 30–50 existing test titles. Find the id token they share
(`AHA-T3015`, `B-TC18`, `SM-07`). Write the regex that matches it. If titles carry no id at
all, set the pattern to the plugin default `[A-Z]+-TC\d+` and set
`rules.requireCaseIdInTitle: false`, then note in the audit that traceability is not
currently enforced here.

**`rules.noRawLocatorsInSpecs`** — grep the spec dirs for
`page.(getByTestId|locator|getByRole|getByText)`. Near-zero hits across many specs ⇒ the
repo enforces it ⇒ `true`. Widespread hits ⇒ `false`, and record the count in the audit as
an observation. **Do not set a rule to `true` that the repo currently violates in bulk** —
that turns stage 5's linter into permanent red and the team will disable it.

Same evidence test for `locatorGetterPrefix`, `noExpectInPageObjects`,
`pageObjectFileSuffix`, `pageObjectClassSuffix`. When a conventions doc from step 2 states
a rule explicitly, the doc wins over the sample.

### 6. Inventory the lower layers — read-only

Find unit/integration suites the repo already owns: `vitest.config.*`, `jest.config.*`,
`pytest.ini` / `pyproject.toml`, `*_test.go`, `backend/tests/`, `src/**/__tests__/`.

For each, record `kind`, `tool`, `cmd`, `root`, and the paths it covers. Count the test
files.

**This stage never writes, runs to completion, or judges a unit test.** The inventory has
exactly one downstream job: `qa-design-cases` reads `lowerLayers` to decide whether a rule
can be pushed down instead of proven through a 40-second browser test. A repo with an empty
`lowerLayers` is not a failure — longbien is a pure QA repo and correctly has none.

### 7. Write the profile and the audit

Write `<testRoot>/.qa-profile.json` from `templates/qa-profile.template.json`, and
`<testRoot>/docs/qa-audit.md` from `templates/audit-output.md`.

## Validation — MANDATORY, this stage is not done without it

### 7a. Mechanical gate

```bash
node <plugin>/scripts/qa-profile-validate.mjs <testRoot>/.qa-profile.json --run-commands
```

It fails on: a missing required key, a path that does not exist, a `runOne` without
`{file}`, a `caseIdPattern` that does not compile or matches everything, a missing
playwright config, and a declared command that will not execute.

On failure: fix the profile and re-run. Up to **3 attempts**. If it still fails, stop and
report the blocking finding to the user — do not hand a broken profile to stage 5.

### 7b. Adversarial gate

Dispatch the `qa-audit-verifier` agent with the profile, the audit doc, and
`references/verify-checklist.md`. It re-derives the facts independently and returns a
pass/fail verdict per rule. Fix every `fail` and re-run 7a + 7b, up to 3 rounds.

A fresh context that never saw the derivation catches the failure mode this stage is
prone to: plausible-looking paths copied from another repo's layout.

### 7c. Human confirmation

Print the profile and ask the user to confirm the three things a machine cannot check:

1. Is the chosen `testRoot` the canonical suite (when several were found)?
2. Are the inferred `rules` the ones the team actually wants enforced going forward?
3. Should any competing test location be deprecated?

The profile is a reviewed artifact. Commit it.

## Output

Report, in this order:

1. Archetype, testRoot, language.
2. Layer inventory table: layer · directory · spec files · test count.
3. Lower layers found (tool, count) — or an explicit "none; this repo owns no lower layer".
4. Conventions documents adopted, in precedence order.
5. Rules inferred, each with the evidence (`noRawLocatorsInSpecs: true — 0 hits in 214 specs`).
6. Gaps and competing locations.
7. Both validation verdicts.
