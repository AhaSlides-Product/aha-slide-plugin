# Agent output schema

Every coverage-lens agent returns **exactly one JSON object** in this shape and nothing
else (no prose before or after). The orchestrator parses these and merges them.

```json
{
  "lens": "positive | negative-boundary | permission-state | crosscut-regression",
  "summary": "1-2 sentence read of what this lens found worth covering",
  "cases": [
    {
      "box": "golden | negative | boundary | permission | state | cross-cutting | regression",
      "type": "Positive | Negative | Boundary | Regression",
      "title": "[Type] - <Action> - <Expected>",
      "priority": "P1 | P2 | P3",
      "precondition": ["state the system must be in before the steps run"],
      "run_for": ["optional parameter variation", "..."],
      "steps": ["single user-visible action", "..."],
      "expected": ["observable outcome", "..."],
      "source": "Phase-1 risk Rn | Phase-2 strategy row | acceptance criterion"
    }
  ],
  "skipped": [
    { "box": "the box you did not cover", "reason": "one-line reason it does not apply" }
  ]
}
```

## Rules for agents

- Only produce cases for the boxes your lens owns (stated in your assignment). Cover a box
  only when it genuinely applies; otherwise add it to `skipped` with a reason.
- `box` and `type` are different axes. A permission case usually has `box: "permission"` and
  `type: "Negative"`. A loading-state case has `box: "state"` and `type: "Positive"` or
  `"Negative"`. Set both honestly.
- `title` must use the shape `[Type] - <Action> - <Expected>` with single-space-dash-
  single-space separators — Phase 4 automation parses it.
- `run_for` is optional. Omit it (or use `[]`) unless the same steps run across roles,
  viewports, or locales — then write one case and list the variations here.
- Every case must trace to a `source` (a Phase-1 risk row, a Phase-2 strategy row marked
  "Yes", or an acceptance criterion). A case with no source is padding — drop it.
- `expected` must be observable. Never "no errors"; write a concrete observable instead.
- An empty `cases` array is valid — return `[]` if your lens found nothing worth covering,
  and explain via `skipped`. Do not invent filler cases.
- No emoji. Plain text inside JSON strings. No placeholders (`<...>`) in a real case — the
  angle brackets above are only the template.

## Verifier verdict schema

The `testcase-verifier` agent runs after the draft `3-test-cases.md` is written and returns
**exactly one JSON object** in this shape (not the designer schema above). The orchestrator
applies the `auto_fixable` fixes (including generating a missing case for a C5 coverage gap)
and records `unresolvable` items in the `## Verification` footer.

```json
{
  "verdict": "pass | fail",
  "checks": [
    {
      "id": "C1",
      "item": "the checklist rule being judged (see references/verify-checklist.md)",
      "status": "pass | fail",
      "offending": ["exact quote — TC-NN heading + offending line — empty when pass"],
      "suggested_fix": "a concrete edit, or for C5 the case to add (title + intent)",
      "auto_fixable": true
    }
  ],
  "unresolvable": ["a finding that needs a human (QA lead/PM) decision, not auto-fixable"]
}
```

- `verdict` is `pass` only when no `checks` entry has `status: "fail"`.
- Every `fail` must carry a non-empty `offending` quote; the orchestrator edits only that text.
- No emoji. Plain text inside JSON strings.
