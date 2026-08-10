---
name: qa-testkit
description: Entry point for the AhaSlides QA automation pipeline — routes to the right stage based on what the repo and the request already have. Triggers on "set up QA in this repo", "start the QA pipeline", "qa testkit", "add tests for this feature", "test this feature end to end", "làm QA cho repo này". Use when you know you want the QA pipeline but not which stage to start at.
---

# QA Testkit — router

## Purpose

Pick the right stage and run it. The pipeline has seven stages and most requests do not
start at stage 0 — this skill works out where you actually are so you neither redo an
audit that exists nor implement against a design that does not.

## The pipeline

```
0  qa-repo-audit          repo -> .qa-profile.json + qa-audit.md          [qa-audit-verifier]
1  qa-scaffold            greenfield repo -> canonical tests/ tree        [qa-scaffold-verifier]
2  qa-requirement-analysis requirement -> risks, conditions, questions    [qa-requirement-verifier]
3  qa-test-plan           -> scope, strategy, entry/exit gates            [test-plan-verifier]
4  qa-design-cases        -> cases, each stamped with a layer             [testcase-verifier]
5  qa-implement           design -> page objects -> specs, green          [3 sub-stage checkers]
6  qa-triage              red run -> classified failures, fixes           [qa-impl-specs-checker]
```

Stages 2–4 are the design phase; stage 5 implements what they designed. Stages 0–1 are
one-time per repo.

## Routing

Check in this order and start at the first stage whose precondition is unmet.

| Condition | Start at |
|---|---|
| No `.qa-profile.json` at the test root, and a `playwright.config.*` exists | **0** — audit |
| No `.qa-profile.json` and no playwright config | **1** — scaffold (audit will confirm greenfield first) |
| Profile exists; the request is a requirement/ticket that is not yet understood | **2** |
| Requirement understood; no test plan and the work is a sprint/release | **3** |
| Requirement understood; the request is one feature | **4** — design cases (a full plan is overkill for a single feature) |
| A committed design exists under `paths.designDocs` and the request is "automate it" | **5** |
| A run is red | **6** |

State which stage you picked and why, in one line, before starting. If the user named a
stage explicitly, use it — do not re-route.

## Rules that hold across every stage

1. **The profile is the only source of repo-specific knowledge.** Never hardcode a path, a
   command, or a naming rule in a skill body. If something is repo-specific and not in the
   profile, add it to the profile.
2. **The repo's own conventions win.** Existing repos are never migrated to the canonical
   structure. Read `conventions[]` and follow it, even where it contradicts this plugin's
   defaults.
3. **Every stage has a validator, and a failing validator sends the stage back.** Max 3
   rounds, then stop and report honestly. A validator that only prints an opinion is not a
   validator.
4. **Design before implementation, and the design is committed.** Stage 5 refuses to run
   from a conversational description. That is what makes the both-directions coverage check
   possible.
5. **Layer discipline.** Cases go to the lowest layer that can prove them. A missing lower
   layer is a gap recommendation, never a reason to promote a case to E2E.
6. **Never weaken a test to get green.** Applies to stages 5 and 6 equally. Report the
   product defect instead.

## Multi-repo sessions

The four AhaSlides repos have different layouts and different conventions:

| Repo | Archetype | Test root | Language | Conventions |
|---|---|---|---|---|
| `longbien-automation-test` | standalone-qa | `.` | js | `docs/guidance/QA_STANDARDS.md` |
| `aha-survey` | product-repo | `tests` | ts | `tests/TEST_SCRIPT_RULES.md` |
| `aha-slide-plugin` | product-repo | `tests` | ts | `tests/QA_GUIDE.md` |
| `workspace-app` | product-repo | `tests` | ts | scaffolded `tests/CONVENTIONS.md` |

Seed profiles for all four ship in `profiles/`. Copy the matching one to that repo's test
root as a starting point, then run stage 0 to verify and correct it — the seeds were written
from a point-in-time reading and the audit is what makes them trustworthy.

When a session spans several repos, re-read the profile every time you change repo. Carrying
one repo's conventions into another is the failure this whole design exists to prevent.
