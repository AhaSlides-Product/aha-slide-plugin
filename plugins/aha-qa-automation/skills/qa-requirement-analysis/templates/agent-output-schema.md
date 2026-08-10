# Agent output schema

Every specialist agent returns **exactly one JSON object** in this shape and nothing
else (no prose before or after). The orchestrator parses these and merges them.

```json
{
  "lens": "clarity | completeness | logic | quality",
  "summary": "1-2 sentence read of the requirement from this lens",
  "clarification_questions": [
    "Concrete, answerable question for BA/PM/Dev. Reference the section/field it comes from."
  ],
  "test_conditions": [
    "Preliminary test condition — a thing that must be verified. Not a full test case."
  ],
  "risks": [
    {
      "risk": "What could go wrong, stated concretely",
      "likelihood": "H | M | L",
      "impact": "H | M | L",
      "mitigation": "A concrete action, never 'test thoroughly'",
      "owner": "Team or role responsible"
    }
  ],
  "gaps": [
    "Something missing from the doc — an undocumented case, rule, threshold, or state."
  ],
  "cross_cutting": {
    "mobile": "yes | no | unknown",
    "eu": "yes | no | unknown",
    "i18n": "yes | no | unknown",
    "a11y": "yes | no | unknown",
    "performance": "yes | no | unknown",
    "l10n": "yes | no | unknown"
  }
}
```

## Rules for agents

- Only report cross-cutting flags your lens can actually judge; otherwise use `"unknown"`.
- An empty array is valid — return `[]` if your lens found nothing, do not invent filler.
- Every `unknown` flag and every `gap` should have a paired `clarification_question`
  where it makes sense.
- Quote or paraphrase the source when justifying a risk; do not analyse from intuition alone.
- No emoji. Plain text inside JSON strings.

## Verifier verdict schema

The `qa-requirement-verifier` agent runs after the draft `1-analysis.md` is written and
returns **exactly one JSON object** in this shape (not the analyst schema above). The
orchestrator applies the `auto_fixable` fixes and records `unresolvable` items in the
`## Verification` footer.

```json
{
  "verdict": "pass | fail",
  "checks": [
    {
      "id": "R1",
      "item": "the checklist rule being judged (see references/verify-checklist.md)",
      "status": "pass | fail",
      "offending": ["exact quote of the offending text from the draft, empty when pass"],
      "suggested_fix": "a concrete edit the orchestrator can apply",
      "auto_fixable": true
    }
  ],
  "unresolvable": ["a finding that needs a human (PM/BA/Dev) decision, not auto-fixable"]
}
```

- `verdict` is `pass` only when no `checks` entry has `status: "fail"`.
- Every `fail` must carry a non-empty `offending` quote; the orchestrator edits only that text.
- No emoji. Plain text inside JSON strings.
