---
name: qa-impl-specs
description: Sub-stage 3 of qa-implement — writes the spec files for the designed cases, runs them against a real environment, and fixes them until green. Dispatched by qa-implement; not usually invoked directly.
---

# Sub-stage 5.3 — Specs

## Purpose

Write the tests, run them, and leave them green — or leave an honest report of what is not.

## Inputs

- The resolution map (sub-stage 1) and the objects (sub-stage 2)
- The design document — the source of truth for what each case must prove
- `.qa-profile.json` and the repo's `conventions[]`

## Process

### 1. Place the file

`paths.specs.<layer>/<domain>/<name>.spec.<ext>`, following the repo's existing grouping.
Look at how neighbouring specs are grouped and match it.

### 2. Title every test with its case id

```
test('<CASE-ID>: <what behaviour this proves>', ...)
```

The id must match the profile's `caseIdPattern`. This is not bookkeeping — it is what makes
the design↔code coverage check possible in both directions, and in repos with
`integrations.zephyr` it is what links the test to its Zephyr case.

The title states the **behaviour proven**, not the steps taken. "publishing a draft makes
it visible to respondents", not "click publish and check badge".

### 3. Write the body

```ts
test('XX-TC10: publishing a draft makes it visible to respondents', async ({ api, editorPage }) => {
  // 1. Seed preconditions via API — never by clicking through the UI.
  const survey = await seedSurvey(api, { status: 'draft' });

  // 2. Drive the UI through page object actions only.
  await editorPage.goto(survey.id);
  await editorPage.publish();

  // 3. Assert here, in the spec.
  await expect(editorPage.getStatusBadge()).toHaveText('Published');
});
```

Rules, all of them checkable:

- **No raw locators** when `rules.noRawLocatorsInSpecs` is set.
- **Seed via API, verify via UI.** UI setup is slow and makes unrelated failures look like
  this test's failure.
- **Self-contained.** Each test creates its own data and cleans up. It must pass when run
  alone with `--grep`. No ordering dependency between tests.
- **No `waitForTimeout`.** Wait on the condition you mean — a locator state, a response, a
  URL. Arbitrary sleeps are the largest single source of flake.
- **Assert the behaviour the design names**, not an incidental side effect that happens to
  be easier to observe. If the design says "respondent can now open it", asserting the
  badge text alone is a weaker test than the design asked for — assert both.

### 4. Run it — against a real environment

```bash
<commands.runOne with {file} and {id}>     # each new case, individually first
<commands.run> <file>                       # then the whole file
```

Run each case alone before running the file. A case that passes in a file but fails alone
has an ordering dependency, and finding that now is much cheaper than finding it in CI.

### 5. Fix failures — diagnose before editing

For each failure, decide **which of three things it is**, and say which:

1. **Script defect** — wrong selector, bad wait, wrong assumption. Fix the script.
2. **Product defect** — the app is genuinely wrong. **Do not weaken the test to make it
   pass.** Report it, and leave the test failing or marked with the repo's own mechanism
   for known-broken behaviour.
3. **Environment issue** — data missing, service down, credentials. Report it; do not
   code around it.

Weakening an assertion to get green is the single worst outcome of this stage. A test that
passes without proving the behaviour is worse than no test, because it also removes the
pressure to write a real one.

### 6. Re-run until stable

Run the new specs **twice** in a row. A test that passes once and fails once is flaky and
is not done. Diagnose the race rather than adding a retry.

## Validation — `qa-impl-specs-checker`

Mechanical gate — all must pass:

```bash
node <plugin>/scripts/qa-conventions-lint.mjs <testRoot>/.qa-profile.json
node <plugin>/scripts/qa-design-coverage.mjs <testRoot>/.qa-profile.json <design-doc.md>
<commands.typecheck>
<commands.run> <changed specs>          # twice
```

Then the checker's rules:

| # | Rule |
|---|---|
| S1 | Every in-scope designed case has a test, and every new test maps to a designed case. Both directions. |
| S2 | Each test proves what its design entry says it proves — read the design row and the assertion side by side. An assertion that is merely adjacent to the designed behaviour is a fail. |
| S3 | No assertion was weakened, deleted, or replaced with a truthy check to obtain green. Compare against the design's expected result. |
| S4 | No test was silently skipped, `.only`'d, or given a retry to mask a race. |
| S5 | No raw locators in specs, where the repo enforces that. |
| S6 | No `waitForTimeout` / arbitrary sleep. |
| S7 | Preconditions are seeded via API where an API route exists. |
| S8 | Each test passes when run alone with `--grep`, and the suite passes twice in a row. |
| S9 | Test data created by the test is cleaned up. |
| S10 | Failures left in place are classified (script / product / environment) with evidence, not left unexplained. |

Fix and re-run, up to 3 attempts. Then stop and report honestly what is still red.

## Output

1. Specs created/modified, with the case ids in each.
2. Run output — the real thing, both runs.
3. Coverage report output.
4. Any product defects found, with evidence.
5. Anything still failing or skipped, and why.
