# Verify checklist — Phase 2 (test plan)

The `test-plan-verifier` agent judges the finished `2-test-plan.md` against these rules.
For every rule, decide `pass` or `fail`; when `fail`, quote the exact offending text and give
a concrete `suggested_fix`. Findings that need a PM/lead decision go to `unresolvable`.

This checklist is the KIM standard (what judges the plan). It is separate from
`test-plan-sections.md`, which is the standard the designers WRITE against. Respect the run
mode: in `sprint` mode a section marked "N/A for this cycle" is acceptable and is not a fail.

| id | Rule | How to judge a fail |
|---|---|---|
| P1 | §2 Out of Scope is non-empty. | The Out-of-scope column is blank, or only says "none" with no reason. |
| P2 | Every Exit criterion in §4 is measurable. | An exit criterion with no threshold/checkable condition ("quality is good", "testing done"). |
| P3 | Every test type in §3 has a rationale tied to a risk, NFR, or scope decision. | A "Why chosen here" cell that is generic ("standard practice") or empty. |
| P4 | §7 risk is delivery/process risk, not a verbatim re-list of Phase 1 product risk. | A §7 row that restates a Phase 1 product risk instead of a delivery/process risk (churn, env, timeline). |
| P5 | Mode respected; no mandatory section missing or left as a bare placeholder. | A release plan missing sign-off, or any section still holding `<...>` instead of content or an explicit "N/A for this cycle". |
| P6 | No invented people, dates, or SLAs. | A named approver, date, or SLA number that did not come from the project profile or the interview — should be `TBD - <who>`. |
| P7 | Objectives in §1 are concrete and checkable. | An objective like "ensure high quality" with nothing to check against. |

## Auto-fixable vs unresolvable

- **Auto-fixable** (orchestrator edits the draft): P2 (make the criterion measurable when the
  threshold exists elsewhere in the plan), P4 (rewrite the row as a delivery risk), P5
  (replace a stray placeholder with content or an explicit "N/A for this cycle"), P6 (replace
  an invented value with `TBD - <who>`), P7 (tighten a vague objective).
- **Usually unresolvable** (needs a human): P1 when the scope boundary is genuinely unknown —
  raise "Out of Scope needs PM alignment" rather than inventing one. P2 when no threshold
  exists anywhere — raise "exit criterion needs a PM-agreed threshold". P3 when the rationale
  depends on a product decision not yet made.
