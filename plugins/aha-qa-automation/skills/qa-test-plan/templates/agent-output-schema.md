# Agent output schema (Phase 2)

Each specialist agent returns **exactly one JSON object** and nothing else (no prose
before/after). All three share an envelope; the payload differs by agent. The orchestrator
parses and merges these into `2-test-plan.md`.

## Shared envelope

```json
{
  "agent": "strategy | gates | risk-resource",
  "mode": "sprint | release",
  "notes_for_orchestrator": ["anything the merge step should know, e.g. an unresolved input"],
  "...payload (see per-agent below)..."
}
```

## test-strategy-architect payload

```json
{
  "objectives": ["concrete, checkable objective"],
  "scope_in": ["feature / area / test type IN scope"],
  "scope_out": ["feature / area / test type OUT of scope, with reason e.g. 'defer to v2'"],
  "strategy": [
    { "test_type": "Smoke | Functional | Integration | Regression | Exploratory | UAT | Performance",
      "applies": "when it runs in this project",
      "rationale": "WHY chosen here — tie to a Phase 1 risk, an NFR, or a scope decision" }
  ]
}
```

## quality-gates-designer payload

```json
{
  "entry_criteria": ["condition to START testing"],
  "exit_criteria": ["condition to STOP testing / approve release, with a threshold"],
  "defect_management": {
    "severity_vs_priority": "who decides each, and the distinction in this project",
    "sla": [ { "severity": "Critical | High | Medium | Low", "fix_within": "e.g. 24h" } ],
    "blocker_policy": "which bugs block the release"
  }
}
```

## risk-resource-planner payload

```json
{
  "delivery_risks": [
    { "risk": "...", "likelihood": "H | M | L", "impact": "H | M | L", "mitigation": "concrete action" }
  ],
  "risk_based_focus": ["test area to prioritize, justified by a Phase 1 product risk"],
  "schedule": [ { "phase": "Test design | Execution | Bug fix & retest | Sign-off", "duration": "e.g. 2 days" } ],
  "resource": {
    "people": [ { "role": "QA Lead | QA Engineer | Dev support", "responsibility": "..." } ],
    "environment": "staging clone / data / sandbox vs mock",
    "tools": ["Jira", "TestRail", "..."]
  }
}
```

## Rules for agents

- Customize to the provided context — never emit a generic template. Tie choices to the
  Phase 1 analysis (risks, test conditions, cross-cutting flags) and the project profile.
- In `sprint` mode, keep payloads lean: strategy = the few test types that matter,
  schedule/resource may be brief or omitted (state so in `notes_for_orchestrator`).
- Empty arrays are valid; do not invent filler. If an input is missing, say so in
  `notes_for_orchestrator` rather than guessing a team member or a date.
- Thresholds and SLAs must be concrete numbers, mitigations concrete actions.
- No emoji. Plain text inside JSON strings.

## Verifier verdict schema

The `test-plan-verifier` agent runs after the draft `2-test-plan.md` is written and returns
**exactly one JSON object** in this shape (not the designer schemas above). The orchestrator
applies the `auto_fixable` fixes and records `unresolvable` items in the `## Verification`
footer.

```json
{
  "verdict": "pass | fail",
  "checks": [
    {
      "id": "P1",
      "item": "the checklist rule being judged (see references/verify-checklist.md)",
      "status": "pass | fail",
      "offending": ["exact quote of the offending text from the draft, empty when pass"],
      "suggested_fix": "a concrete edit the orchestrator can apply",
      "auto_fixable": true
    }
  ],
  "unresolvable": ["a finding that needs a human (PM/lead) decision, not auto-fixable"]
}
```

- `verdict` is `pass` only when no `checks` entry has `status: "fail"`.
- Respect the run mode: a section marked "N/A for this cycle" in `sprint` mode is not a fail.
- Every `fail` must carry a non-empty `offending` quote; the orchestrator edits only that text.
- No emoji. Plain text inside JSON strings.
