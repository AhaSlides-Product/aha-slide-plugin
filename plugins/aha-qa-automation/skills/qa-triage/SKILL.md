---
name: qa-triage
description: Use when a Playwright run has failures or skips that need explaining or fixing — triggers on "why did these tests fail", "triage the report", "fix the failing tests", "check e2e report", "phân tích report", or when a report URL, run id, or failing run output is pasted. Classifies every failure as product defect, script defect, environment issue, or flake, with evidence, then fixes the script defects.
---

# Stage 6 — Run & Triage

## Purpose

Turn a red run into a decision per failure. The output that matters is not "fixed" — it is
**a correct classification with evidence**, because the three failure kinds have three
different owners.

## Prerequisites

`.qa-profile.json` at the test root. It supplies the run commands, the spec paths and the
case-id pattern used to link a failure back to its design.

## Inputs

Any one of: a hosted report URL, a CI run id, a local `playwright-report/` directory,
`test-results/junit-results.xml`, or pasted run output. If none is given, run the suite via
`commands.run` and triage the result.

## Process

### 1. Collect the failures

Build one row per failing or skipped test: case id · spec file · error message · the failing
step · attachments (trace, screenshot, video) · duration.

Read the trace before forming an opinion. The error message alone is usually the symptom,
not the cause — "locator not found" is equally consistent with a renamed testid, an
unauthenticated session, and a backend 500 that left the page empty.

### 2. Classify each failure — this is the actual work

| Class | Signal | Owner |
|---|---|---|
| **Product defect** | The app genuinely does the wrong thing. The test is right. | Product team — file a bug |
| **Script defect** | Wrong selector, bad wait, wrong assumption, stale test data. | This repo — fix it |
| **Environment** | Service down, missing/expired credentials, missing seed data, quota. | Infra/QA — fix the env |
| **Flake** | Passes on retry, or passes in isolation but not in the suite. | This repo — fix the race |

Rules that keep classification honest:

- **Never classify as "script defect" by default.** That is the classification that leads to
  weakening the test until it passes, which destroys the signal the test existed to provide.
  If the app's behaviour differs from the design's expected result, it is a product defect
  until someone with authority says the design was wrong.
- **Check the design.** Look up the case id in `paths.designDocs`. If the assertion no
  longer matches the designed expected result, the test drifted from its design — that is a
  finding in itself.
- **A retry-pass is not a pass.** Record it as a flake with the race identified, not as
  green.
- **Cascades:** in a serial file, one failure can fail everything after it. Identify the
  root failure and mark the rest as cascade, so a 14-failure report is not triaged as 14
  independent problems.

### 3. Fix only the script defects and flakes

For a script defect: fix the cause, not the symptom. A renamed testid is fixed in the Page
Object getter — one line, and every spec using it recovers.

For a flake: find the race. Replace a sleep with a condition, an unscoped locator with a
scoped one, shared data with per-test data. **Adding a retry is not a fix**, it is a way of
paying the cost forever.

**Do not touch a product defect.** Do not relax the assertion, extend the timeout, or skip
the test to get a green board. Report it.

### 4. Re-run and confirm

Run the fixed specs individually, then together, twice. A fix confirmed by a single green
run is not confirmed.

## Validation — MANDATORY

```bash
node <plugin>/scripts/qa-conventions-lint.mjs <testRoot>/.qa-profile.json
<commands.run> <fixed specs>          # twice
```

Then check every one of these before reporting:

| # | Rule |
|---|---|
| T1 | Every failure has a class and evidence — trace, screenshot, or log line. No unexplained rows. |
| T2 | No assertion was weakened, no timeout extended, and no test skipped to obtain green. Diff every changed assertion against the design. |
| T3 | Product defects are reported, not fixed away, and each has reproduction steps. |
| T4 | Every flake fix names the race it removed. A retry added instead of a fix is a fail. |
| T5 | Cascades are identified so the root failure is not double-counted. |
| T6 | Fixed specs pass twice in a row and pass in isolation. |
| T7 | Skips are explained individually. "Skipped" with no reason is a fail. |

Dispatch `qa-impl-specs-checker` on the changed specs — its S2/S3 rules exist precisely to
catch a test weakened during triage.

## Output

1. Failure table: case id · class · one-line cause · owner · action taken.
2. Product defects found, with reproduction steps and evidence — ready to file.
3. Script fixes made, each naming the root cause.
4. Flakes fixed, each naming the race removed.
5. Environment issues, with what needs to happen.
6. Re-run output, both runs.
7. Anything still red, and why.

## Repo-specific extensions

Some repos have their own triage tooling that goes further than this skill — longbien has
`fix-test-fail` (8 root-cause categories from past sessions) and `check-e2e-report` (hosted
report triage, Slack posting). When you are in a repo whose profile lists one of those in
`conventions[]` or whose `.claude/skills/` provides it, prefer the repo-local skill and use
this one only for the parts it does not cover.
