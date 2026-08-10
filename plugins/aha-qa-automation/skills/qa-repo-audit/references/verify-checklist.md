# Verify checklist — Stage 0 (repo audit)

Used by the `qa-audit-verifier` agent. Each rule returns `pass` / `fail` / `needs-human`,
and every `fail` MUST quote the offending value from the profile and name a concrete fix.

Re-derive independently. Do not accept a value because it looks plausible — the failure
mode this catches is a path copied from a different repo's layout.

## A. Profile is truthful

| # | Rule |
|---|---|
| A1 | Every directory in `paths.*` exists AND contains what its key claims (`paths.pages` holds locator classes, not specs). |
| A2 | `testRoot` contains the playwright config that actually governs the specs in `paths.specs`. |
| A3 | Each `paths.specs.<layer>` directory really holds that layer — an `api` entry must not contain browser tests, and vice versa. |
| A4 | Every file in `conventions[]` exists and is genuinely about test conventions (not an unrelated README). |
| A5 | `repo`, `archetype`, `language` match the repository as observed. |

## B. Commands are real

| # | Rule |
|---|---|
| B1 | `commands.run` is a command this repo actually supports — prefer an existing package.json script over an invented invocation. |
| B2 | `commands.runOne` contains `{file}`, and `{id}` if `caseIdPattern` is enforced. Substituting a real spec path produces a runnable command. |
| B3 | `language: ts` ⇒ `commands.typecheck` is set and resolves. |
| B4 | Commands carry any env setup the repo requires (e.g. `NODE_ENV=staging`); a bare `npx playwright test` that would fail without env vars is a fail. |

## C. Inferred rules match reality — the highest-risk section

| # | Rule |
|---|---|
| C1 | Every `rules.*` set to `true` is **already satisfied** by the existing code. Sample at least 5 files per rule. A rule the repo violates in bulk must be `false` with the violation count recorded in the audit. |
| C2 | Every `rules.*` set to `false`/`null` is genuinely not practised — not merely unverified. |
| C3 | A rule stated explicitly in a `conventions[]` document is reflected in `rules`, and the doc wins over sampling. |
| C4 | `caseIdPattern` matches ids in real test titles in this repo, and does NOT match arbitrary prose. Test it against 10 real titles and 3 non-ids. |
| C5 | If no test carries an id, `requireCaseIdInTitle` is `false` and the audit says traceability is unenforced. |

## D. Lower-layer inventory

| # | Rule |
|---|---|
| D1 | Every declared lower layer's `root` exists and its `cmd` matches how that suite is really run. |
| D2 | No lower-layer suite in the repo was missed. Search for vitest/jest/pytest/go-test configs independently. |
| D3 | An empty `lowerLayers` is asserted only after searching — and the audit says so explicitly. |

## E. Audit document

| # | Rule |
|---|---|
| E1 | Every count in the audit (spec files, tests, hits) is reproducible; spot-check two. |
| E2 | Competing test locations are reported, not silently dropped. |
| E3 | Every rule in §4 carries evidence, not an assertion. |
| E4 | Gaps section names uncovered surfaces concretely, not "some areas lack coverage". |

## Escalate to `needs-human`

- Several plausible canonical test roots and no clear winner.
- Conventions documents that contradict each other.
- A rule the team appears to be mid-migration on (roughly half the files comply).
