# Seed profiles

One `.qa-profile.json` per known AhaSlides repo. Copy the matching file to that repo's test
root as `.qa-profile.json`, then **run `qa-repo-audit` to verify and correct it**.

```bash
cp profiles/aha-survey.qa-profile.json  <aha-survey>/tests/.qa-profile.json
```

These are seeds, not truth. They were derived from a point-in-time reading of each repo on
2026-08-09; the audit is what makes a profile trustworthy, and it re-derives every value.

## What the seeds record — and why several rules are `false`

Rules are set from **what each repo actually does today**, not from what its documentation
says it should do. A rule set `true` that the repo violates in bulk makes
`qa-conventions-lint` permanently red, and a permanently red linter gets switched off.

| Repo | Evidence found | Consequence |
|---|---|---|
| `longbien-automation-test` | 43 raw-locator hits across 237 specs; 162 `expect()` calls inside `objects/pages`; page objects are camelCase `.js` with no suffix convention; 169/217 titles carry an `AHA-T` id | `noRawLocatorsInSpecs: false`, `noExpectInPageObjects: false`, suffix rules `null`, `requireCaseIdInTitle: false` |
| `aha-survey` | Only 3 raw-locator hits in specs, and `TEST_SCRIPT_RULES.md` states that rule as binding. But 92 of its 145 Locator-returning methods do **not** use the `get` prefix, there are 56 `expect()` calls inside page objects, and ids appear in only 94/126 e2e and 1/78 api titles | `noRawLocatorsInSpecs: true` (3 known violations to clean up); `locatorGetterPrefix: null` and `noExpectInPageObjects: false` despite being documented; `requireCaseIdInTitle: false` until the API layer adopts ids |
| `aha-slide-plugin` | Single page object `pages/presenter.ts`, no suffix convention, no case ids in titles | all style rules `false`/`null` |
| `workspace-app` | No Playwright suite exists yet | all rules `true` — a scaffolded repo has no legacy to grandfather |

`aha-survey` shows both sides of the judgement clearly:

- `noRawLocatorsInSpecs` stays `true`. Three hits across the whole suite is *drift* from a
  binding rule, not an unadopted convention. Those three are worth fixing, so they are
  listed as a gap rather than legitimised by turning the rule off.
- `locatorGetterPrefix` and `noExpectInPageObjects` are turned **off** even though
  `TEST_SCRIPT_RULES.md` states both. 92 non-`get` methods and 56 in-object `expect()` calls
  is not drift — the rules were written down and never adopted. Enforcing them now would
  produce 148 failures on the first run, which is how a linter gets disabled.

Documentation is evidence of intent, not evidence of practice. Measure before enforcing.

## workspace-app is a target, not a description

`workspace-app` has no `tests/` directory today, so its profile describes the **post-scaffold
target state**. `qa-profile-validate.mjs` will fail against it until `qa-scaffold` has run —
that is correct behaviour, not a bug in the seed.

## Keeping a profile honest

Re-run `qa-repo-audit` after any restructure of a test layer, and whenever
`qa-conventions-lint` starts failing for reasons that look like the profile rather than the
code. A rule can be tightened from `false` to `true` once the repo has actually been cleaned
up — that is the intended ratchet.
