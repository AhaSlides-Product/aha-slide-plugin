# Output skeleton — 2-test-plan.md

The orchestrator writes this after merging the three agents' JSON. Replace every
angle-bracket placeholder. No placeholder may remain. Section order is fixed — later
phases parse by heading position. In `sprint` mode, sections not used still appear with a
one-line "N/A for this cycle" note so the structure stays stable.

```markdown
# Phase 2 — Test Plan: <feature-key>

**Source analysis:** 1-analysis.md
**Mode:** <sprint | release>
**Build / Sprint:** <id>
**Date:** <YYYY-MM-DD>
**Author:** <QA Lead from project profile>

## 1. Overview & Objectives

<2-4 sentence overview: what this cycle covers and the definition of quality.>

Objectives:
- <concrete, checkable objective>
- <objective>

## 2. Scope

| In scope | Out of scope |
|---|---|
| <area> | <area> (<reason, e.g. defer to v2>) |

## 3. Test Strategy

| Test type | Applies when | Why chosen here |
|---|---|---|
| <type> | <when> | <rationale tied to a risk / NFR / scope> |

## 4. Entry & Exit Criteria

**Entry (to start testing):**
- [ ] <condition>

**Exit (to approve release):**
- [ ] <condition with threshold>

## 5. Test Schedule & Milestones

<release: table of phase -> duration -> dates. sprint: brief or "N/A for this cycle.">

| Phase | Duration | Target date |
|---|---|---|
| <phase> | <duration> | <date> |

## 6. Resource Plan

<release: people / environment / tools. sprint: "N/A for this cycle" unless provided.>

- People: <role -> responsibility>
- Environment: <staging clone / data / sandbox vs mock>
- Tools: <list>

## 7. Risk & Mitigation

Delivery risks for this cycle (product risks carried from Phase 1 inform the focus below).

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | <delivery risk> | <H/M/L> | <H/M/L> | <action> |

Risk-based focus (highest-priority test areas):
- <area> — <which Phase 1 product risk drives it>

## 8. Defect Management

- Severity vs Priority: <distinction and who decides>
- Fix SLA:

  | Severity | Fix within |
  |---|---|
  | Critical | <e.g. 4h / immediate> |
  | High | <e.g. 24h> |
  | Medium | <e.g. 48h> |

- Blocker policy: <which bugs block the release>
- Flow: log (title, steps, actual, expected, severity) -> assign Dev -> fix -> QA retest -> close/reopen.

## 9. Communication & Reporting

<release: table. sprint: "N/A for this cycle.">

| Report | Frequency | Audience | Content |
|---|---|---|---|
| <report> | <freq> | <audience> | <content> |

## 10. Assumptions & Dependencies

Assumptions:
- <assumption with a date where relevant>

Dependencies (from Phase 1 + this cycle):
- <dependency with owner and date>

## 11. Approvals

<release: sign-off table. sprint: "N/A for this cycle.">

| Approver | Role | Date | Decision |
|---|---|---|---|
| <name> | QA Lead | | |
| <name> | PM | | |
| <name> | Dev Lead | | |

## 12. Verification

Independent adversarial check by `test-plan-verifier` against `references/verify-checklist.md`.

**Rounds:** <n> | **Checks:** <p> pass / <f> fail (final) | **Verifier:** test-plan-verifier

**Unresolved (needs a human):**
- <finding — who to ask>
<!-- write "- none" when every check passed and nothing was left for a human -->

---
*Next: Phase 3 — Test Case Design. This file is the canonical input; keep headings stable.*
```

When a value is unknown, write `unknown` or `TBD — <who to ask>`; never leave a blank cell.
