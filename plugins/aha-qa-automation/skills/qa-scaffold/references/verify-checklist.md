# Verify checklist — Stage 1 (scaffold)

Used by the `qa-scaffold-verifier` agent. Each rule returns `pass` / `fail` /
`needs-human`; every `fail` quotes the offending file and names a concrete fix.

## A. It runs — no rule below matters if these fail

| # | Rule |
|---|---|
| A1 | `npx playwright test --list` resolves and lists the generated specs. |
| A2 | `npx tsc --noEmit` is clean. |
| A3 | The smoke spec was **actually executed against a real environment and passed**. A scaffold that only typechecks is not verified. |
| A4 | `qa-profile-validate.mjs --run-commands` passes. |
| A5 | Every path alias in `tsconfig.json` resolves, and each is used by at least one generated file. |

## B. No placeholders survived

| # | Rule |
|---|---|
| B1 | No `{{PLACEHOLDER}}` remains in any generated file. Grep for `{{`. |
| B2 | No `TODO`, `FIXME`, or commented-out block was shipped as if it were finished. |
| B3 | The smoke test asserts a real element of this app, not `expect(true).toBe(true)`. |
| B4 | Base URLs are this project's real URLs, not the template defaults. |

## C. Structure matches the standard

| # | Rule |
|---|---|
| C1 | Directory tree matches the canonical layout in the skill (config/pages/objects/fixtures/helpers/specs/docs). |
| C2 | Dependency direction holds: no spec imports a page object by relative path, no page object imports a spec, no helper contains a locator. |
| C3 | `pages/index.ts` exports every page object, and specs import via `@pages`. |
| C4 | `specs/` is split by layer first (`api`, `e2e`), domain second. |
| C5 | The generated `.gitignore` covers `.env`, `.auth/`, `playwright-report/`, `test-results/`. Credentials must not be committable. |

## D. Profile matches the tree it describes

| # | Rule |
|---|---|
| D1 | Every `paths.*` entry points at a directory that was actually created. |
| D2 | `commands.*` match the scripts in the generated `package.json`. |
| D3 | `caseIdPattern` matches the ids used in the generated smoke/health specs. |
| D4 | Every `rules.*` is `true` — a new repo has no legacy to grandfather. Any `false` needs a stated reason. |
| D5 | `conventions[]` includes the generated `CONVENTIONS.md`. |

## E. Consistency

| # | Rule |
|---|---|
| E1 | `CONVENTIONS.md` and the profile's `rules` block agree. A rule in prose but not in `rules` is unenforced; a rule in `rules` but not in prose is unexplained. |
| E2 | `README.md` commands actually work as written. |
| E3 | The example Page Object demonstrates the rules it documents (getter methods, no expect, action calls getter). |

## Escalate to `needs-human`

- The smoke test fails for an environment reason (site down, no credentials) rather than a
  scaffold reason — report it, and do not mark the stage green.
- The repo has an unusual auth model the template cannot express.
