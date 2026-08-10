---
name: qa-implement
description: Use when turning an approved test-case design into runnable Playwright specs in any repo — triggers on "implement these test cases", "automate the design", "write the playwright tests for AHA-XXXX", "viết automation test", "implement test script". Runs research → page objects → specs as three checked sub-stages, reading the repo's .qa-profile.json so the generated code matches that repo's own conventions rather than a global template.
---

# Stage 5 — Implement

## Purpose

Turn a **committed test-case design** into specs that run and pass, in whichever repo you
are in, conforming to whatever conventions that repo already has.

This is the stage that did not exist portably before. The previous implementation skill
delegated to longbien's repo-local `/write-automation-e2e-test` command, so it only worked
inside longbien.

## Prerequisites — refuse to start without these

1. **`.qa-profile.json`** at the test root. Missing ⇒ stop and run `qa-repo-audit` first.
   Everything below reads paths, commands, and conventions from it. Never hardcode a path.
2. **A committed design document** under `paths.designDocs`, with a case id and layer for
   each case. Missing ⇒ stop and run `qa-design-cases`.

   Refusing here is deliberate. Implementing from a conversational description produces
   tests nobody reviewed, and makes the design↔code coverage check meaningless because
   there is no design side.
3. **Read the repo's conventions.** Read every file in the profile's `conventions[]`, in
   order. **They outrank this plugin's defaults.** If longbien's `QA_STANDARDS.md` says
   fixtures compose in `fixtures/customTest.js`, that is what you do — the canonical
   structure in `qa-scaffold` does not apply to a repo that was never scaffolded.

## Scope selection

From the design, take only the cases whose layer is a Playwright layer (a key of
`paths.specs` — typically `api`, `e2e`).

Cases assigned to `unit` / `integration` are **not** implemented here. Report them as gap
recommendations for the product repo's own suite. Promoting them to E2E to make the
coverage report green is the failure this pipeline exists to prevent.

## The three sub-stages

Run in order. Each has its own checker; a failing checker sends its sub-stage back, up to
**3 attempts**, then stops and reports.

| Sub-stage | Skill | Produces | Checker |
|---|---|---|---|
| 1 | `qa-impl-research` | selector + endpoint map for every case | `qa-impl-research-checker` |
| 2 | `qa-impl-objects` | new/extended Page Objects and API Objects | `qa-impl-objects-checker` |
| 3 | `qa-impl-specs` | spec files, run green | `qa-impl-specs-checker` |

Load each sub-skill from `qa-implement/<name>/SKILL.md` when you reach it. Do not skip
ahead: writing specs before the objects exist produces inline locators, which is the exact
thing the conventions forbid.

### The one blocking pause

`HALT_LOCATOR_MISSING` — sub-stage 1 cannot find a selector for a required element after
all its lookup strategies. Stop and ask the user; a guessed selector produces a test that
fails for a reason unrelated to the behaviour under test.

Everything else is logged as a warning and the pipeline continues, reporting warnings at
the end.

## Process

1. Read the profile. Read `conventions[]`. Read the design document.
2. Partition the designed cases by layer; list what is in scope and what is deferred to a
   lower layer. Print both.
3. Sub-stage 1 → checker. 4. Sub-stage 2 → checker. 5. Sub-stage 3 → checker.
6. Final gate (below).

## Validation — MANDATORY final gate

After sub-stage 3 passes its own checker, run all four against the whole change:

```bash
node <plugin>/scripts/qa-conventions-lint.mjs <testRoot>/.qa-profile.json
node <plugin>/scripts/qa-design-coverage.mjs <testRoot>/.qa-profile.json <design-doc.md>
<commands.typecheck>          # when language is ts
<commands.run> for the new/changed specs
```

- `qa-conventions-lint` enforces the repo's own `rules`, not a global standard.
- `qa-design-coverage` checks **both directions**: designed-but-missing, and
  implemented-but-never-designed. One direction alone lets an agent quietly drop the hard
  cases, or invent cases nobody reviewed.
- A spec that has not actually been executed against a real environment is not done.

Report the real command output. If a test is left failing or skipped, say so explicitly
with the reason — never describe a partially-green run as complete.

## Output

1. Cases implemented, by layer, with their case ids.
2. Cases deferred to a lower layer, with the recommendation for each.
3. Files created/modified, grouped: page objects · api objects · fixtures · specs.
4. The four validation results, with actual output.
5. Warnings collected during the run.
6. Anything left failing, and why.
