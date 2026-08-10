---
name: qa-scaffold
description: Use when a repository has no Playwright test layer yet and needs one created — triggers on "set up playwright here", "scaffold tests", "add e2e testing to this repo", "no tests in this repo", "khởi tạo test cho repo mới". Creates the canonical AhaSlides test structure (config, page objects, fixtures, specs, conventions doc, qa profile) and proves it works by running a real smoke test.
---

# Stage 1 — Scaffold the canonical structure

## Purpose

Create the standard AhaSlides Playwright test layer in a repository that does not have one,
and leave it in a state where `qa-implement` can start immediately.

**Scope rule — this skill only runs on greenfield.** Repos that already have a suite
(longbien, aha-survey, aha-slide-plugin) are **never** migrated. If `qa-repo-audit` found a
playwright config, stop and say so: those repos keep their own layout and their own
conventions, and the pipeline adapts to them via their profile instead.

## When to use

- `qa-repo-audit` reported "no playwright config found".
- A new repo/service needs a test layer.

Not for: restructuring an existing suite, adding one spec to an existing suite.

## The canonical structure

Mounted at `tests/` for a product repo, or at the repo root for a standalone QA repo. The
internals are identical either way — only the mount point differs.

```
tests/
├── CONVENTIONS.md          # binding ruleset for this repo — the contract stage 5 reads
├── README.md               # how to run
├── .qa-profile.json        # machine-readable adapter (schemas/qa-profile.schema.json)
├── .env.example
├── package.json            # self-contained: playwright, typescript, dotenv
├── tsconfig.json           # path aliases: @pages @fixtures @config @helpers
├── playwright.config.ts    # projects: setup · api · e2e
├── config/
│   ├── env.ts              # environment matrix + base URLs, read from .env
│   └── constants.ts        # endpoints, timeouts
├── pages/                  # UI Page Objects
│   ├── base.page.ts        # BasePage: page handle, goto, waitFor primitives
│   └── index.ts            # barrel — the only import surface for specs
├── objects/api/            # API Objects: one class per resource, returns typed responses
├── fixtures/
│   ├── test.ts             # composed `test`/`expect` — the ONLY import specs use
│   └── data/               # payloads, per environment
├── helpers/                # business logic, no locators, no assertions
├── specs/
│   ├── api/<domain>/*.spec.ts
│   └── e2e/<domain>/*.spec.ts
└── docs/
    ├── test-design/        # committed design docs from stage 4
    └── qa-audit.md
```

### Why this shape

- **Self-contained `tests/` package.** Its own `package.json` keeps Playwright and its
  types out of the product's dependency tree, and lets the suite be installed and run in CI
  without building the app. (Taken from aha-survey, which already works this way.)
- **Four layers, one direction.** `spec → fixture/helper → page object / api object →
  playwright`. A spec never reaches past its neighbour. This is what makes a selector change
  a one-line edit.
- **Barrel imports.** Specs import from `@pages` and `@fixtures` only. Moving a file does
  not touch a single spec.
- **`specs/` split by layer first, domain second.** The layer split is what lets CI run the
  fast API suite on every PR and the E2E suite on a schedule.

## Process

### 1. Confirm greenfield and pick the mount point

Re-check for `playwright.config.*` outside `node_modules`. If one exists, stop.

Ask the user to confirm the mount point when it is not obvious: `tests/` at repo root is
the default for a product repo. For a monorepo, mount beside the app it tests, not at the
workspace root.

### 2. Ask the three questions the templates cannot infer

Ask these together, then proceed — do not interview one at a time:

1. **Base URL(s) and environments** — which environments will this suite target
   (`local`, `staging`, `canary`, `prod`) and what is the base URL of each?
2. **Authentication** — how does a test get a logged-in session? (storage-state via a
   `setup` project, an API token, or no auth at all.) This decides whether the scaffold
   includes `auth.setup.ts`.
3. **Case-id convention** — the prefix for this repo's test ids, e.g. `WS` giving
   `WS-TC01`. Default `[A-Z]+-TC\d+`.

### 3. Write the tree

Copy from `templates/`, substituting the answers. Every template is a real working file,
not a stub with TODOs.

Then write `CONVENTIONS.md` from `templates/CONVENTIONS.md`. **This file is the repo's own
contract from now on** — stage 5 reads it via `conventions[]` in the profile, exactly as it
reads longbien's `QA_STANDARDS.md`. A new repo starts aligned with the standard and is free
to diverge later; the profile keeps the tooling working either way.

### 4. Write the profile

Write `.qa-profile.json` matching the tree by construction:
`archetype`, `testRoot`, `language: "ts"`, the canonical `paths`, the commands from the
generated `package.json`, the chosen `caseIdPattern`, and all `rules` set `true` (a new repo
has no legacy to grandfather).

Populate `lowerLayers` from the audit if one ran — a new *test layer* in an existing product
repo often sits next to an existing vitest suite, and stage 4 needs to know.

### 5. Install and generate one real smoke test

Install dependencies, then write **one** genuine smoke spec that loads the base URL and
asserts a stable landing element through a Page Object. Not a placeholder `expect(true)`.

Its job is to prove the whole chain works end to end: config → env → fixture → page object →
browser → assertion. If the scaffold is broken, this is what reveals it.

## Validation — MANDATORY

### 5a. Mechanical gate

Run all four, in order. Every one must pass:

```bash
node <plugin>/scripts/qa-profile-validate.mjs tests/.qa-profile.json --run-commands
cd tests && npx tsc --noEmit
cd tests && npx playwright test --list
cd tests && npx playwright test specs/e2e/smoke.spec.ts
```

- `--list` resolving proves the config, aliases and projects load.
- The smoke test **actually passing against a real environment** proves auth, base URL and
  the fixture chain. A scaffold that only typechecks is not verified.

If the smoke test fails on the environment rather than on the scaffold (site down, no
credentials), say so explicitly and leave the stage **incomplete** — do not mark it green.

### 5b. Adversarial gate

Dispatch `qa-scaffold-verifier` with the generated tree and
`references/verify-checklist.md`. Fix every `fail` and re-run 5a. Up to 3 rounds.

### 5c. Hand back

Report the tree, the commands to run it, and the profile. Tell the user the next stage is
`qa-analyze-requirement` (or `qa-design-cases` if a requirement is already understood).

## Output

1. The created tree.
2. Smoke test result — with the actual command output.
3. Both validation verdicts.
4. `.qa-profile.json` contents.
5. The three answers captured in step 2, and where each was written.
