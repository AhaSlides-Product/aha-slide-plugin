# Verify checklist — Phase 3 (test cases)

The `testcase-verifier` agent judges the finished `3-test-cases.md` against these rules.
For every rule, decide `pass` or `fail`; when `fail`, quote the exact offending case (by its
`TC-NN` heading and the offending line) and give a concrete `suggested_fix`. Findings that
need a human decision go to `unresolvable`.

This checklist is the KIM standard (what judges the cases). It is separate from
`coverage-checklist.md` (the coverage lenses the designers WRITE against) and
`testcase-format.md` (the single-case format). To judge R-coverage rules it needs the Phase 1
risk register and the Phase 2 strategy rows — the orchestrator passes those alongside the draft.

| id | Rule | How to judge a fail |
|---|---|---|
| C1 | Every case is reproducible. | A case whose precondition, steps, or expected result is vague, missing, or not observable ("works correctly", "no errors"). |
| C2 | Title shape `[Type] - <Action> - <Expected>` with single-space-dash-single-space. | A title missing the type prefix, the dashes, or one of the three parts. |
| C3 | Every case has a P1/P2/P3 priority and a type, set as independent axes. | A missing priority/type, or a priority that ignores the rubric (a paid-permission boundary marked P3). |
| C4 | No duplicate cases. | Two cases with the same precondition + action + expected under different numbers. |
| C5 | Every Phase-2 strategy row marked "Yes" and every Phase-1 high/high risk has >=1 case. | A "Yes" strategy row or a high-likelihood/high-impact risk with no case tracing to it. |
| C6 | Every Skipped coverage item carries a reason. | A skipped box listed with no reason, or a box skipped that should have been covered. |
| C7 | No leftover `<...>` placeholder, no emoji, no `TC-NN` gap or duplicate number. | A stray placeholder, an emoji, or a broken/duplicated TC number sequence. |

## Auto-fixable vs unresolvable

- **Auto-fixable** (orchestrator edits the draft): C2 (fix the title shape), C3 (set the
  missing priority/type), C4 (collapse the duplicate, keep one, renumber), C6 (add the reason
  or move the box back into coverage), C7 (remove placeholder/emoji, renumber TC sequence).
- **Needs a new case, generate then re-verify** (still inside the loop): C5 — when a "Yes"
  row or high/high risk has no case, generate one before writing. C1 — when a case is
  salvageable, rewrite the vague field to be observable.
- **Usually unresolvable** (needs a human): C1/C5 when the missing coverage depends on a
  product decision or data not in Phase 1/2 — raise it for the QA lead rather than inventing
  a case from nothing.
