# Test Cases — <feature-key>

> Phase 3 of common_QA_workflow. Generated from Phase 1 analysis and Phase 2 test plan.
> One case per heading. Numbered TC-01..TC-NN end-to-end. Do not rename headings — Phase 4
> automation and Phase 5 execution locate cases by the `TC-NN` prefix.

Found previous phase output: <path-to-1-analysis.md>. Reusing context.
Found previous phase output: <path-to-2-test-plan.md>. Reusing context.

Reused: <n risk rows from Phase 1, n strategy rows marked Yes from Phase 2, cross-cutting flags>

---

## Golden path

<!-- positive cases, P1 first -->

## TC-01: [Positive] - <Action> - <Expected>

**Priority:** P1
**Type:** Positive
**Source:** <acceptance criterion / strategy row>

### Precondition
- <state>

### Steps
1. <action>

### Expected result
- <observable outcome>

---

## Negative path

<!-- negative cases -->

---

## Boundary / edge

<!-- boundary cases -->

---

## Permission / role

<!-- permission cases -->

---

## Intermediate states

<!-- loading / timeout / partial-failure / rollback cases -->

---

## Cross-cutting

<!-- mobile / i18n / a11y / performance / compatibility cases -->

---

## Regression

<!-- regression cases on touched areas -->

---

## Skipped coverage items

- <coverage box> — <one-line reason it was deliberately not covered, and where the reason came from (Phase 1 / Phase 2 / existing regression)>

## Verification

Independent adversarial check by `testcase-verifier` against `references/verify-checklist.md`
(includes coverage of every Phase-2 "Yes" row and Phase-1 high/high risk).

**Rounds:** <n> | **Checks:** <p> pass / <f> fail (final) | **Verifier:** testcase-verifier

**Unresolved (needs a human):**
- <finding — who to ask>
<!-- write "- none" when every check passed and nothing was left for a human -->
