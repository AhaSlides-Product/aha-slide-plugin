---
name: qa-test-plan
description: Use when creating a test plan for a sprint, feature, or release in Phase 2 of the QA workflow — orchestrates 3 specialist sub-agents (strategy, quality gates, risk & resource) into a strategy document with scope, test strategy, entry/exit criteria, risk, and defect management. Triggers on "create test plan", "test plan for [sprint/feature]", "test strategy", "Phase 2 QA", "plan testing for [release]".
---

# QA Phase 2 — Test Plan (orchestrator)

## Purpose

Phase 2 of the product-agnostic `common_QA_workflow`. This skill is the **orchestrator**
(the capability / "how"): it reads the Phase 1 analysis plus a reusable project profile,
gathers a few per-run specifics, fans the work out to three specialist **agents** (isolated
workers / "who"), then assembles the lighter sections and writes one Test Plan.

A Test Plan is a **strategy** document — it defines who does what, how, when, with what, and
where to stop. It is not a list of test cases (that is Phase 3). The plan exists to drive a
conversation the whole team agrees to and actually uses, and to make "good enough to ship"
explicit and aligned with the PM.

## When to use

- `create test plan for <sprint/feature/release>`
- `test plan for <KEY>` / `Phase 2 QA for <feature>`
- `test strategy for <feature>` / `plan testing for <release>`

Do not use for test-case writing (Phase 3), bug triage (Phase 5), or release sign-off
(Phase 6).

## The three specialist agents

Installed via `install.sh` as real `subagent_type`s. Each owns the high-judgment sections;
see `references/test-plan-sections.md` for the full standard.

| subagent_type | Sections owned |
|---|---|
| `test-strategy-architect` | Objectives, Scope (In/Out), Test Strategy (test types + WHY) |
| `quality-gates-designer` | Entry/Exit Criteria, Defect Management (severity/priority, SLA, blocker) |
| `risk-resource-planner` | Delivery Risk & Mitigation, Schedule, Resource/env/data |

The orchestrator itself assembles the lighter sections from the project profile and agent
output: Overview header, Communication & Reporting, Assumptions & Dependencies, Approvals.

If a `subagent_type` is not installed, fall back to a `general-purpose` agent with the same
prompt (agent files are in `../../agents/`). Do not block on installation.

## The verifier agent

After the draft is written, one more sub-agent runs an independent adversarial check:

| subagent_type | Job |
|---|---|
| `test-plan-verifier` | Reads the finished `2-test-plan.md` + `references/verify-checklist.md`, tries to break it, returns a pass/fail verdict with the offending text quoted. |

It is separate from the three planners on purpose — a fresh context that never saw the writing
is harder to fool than self-review. Same fallback rule: if not installed, dispatch
`general-purpose` with the agent prompt.

## Inputs

1. **feature-key** (required) — locates `<outputs-root>/<feature-key>/1-analysis.md`.
   If Phase 1 has not been run, say so and offer to run `qa-requirement-analysis` first;
   do not fabricate the analysis.
2. **mode** — `sprint` (default) or `release`. `sprint` = lean plan; `release` = full 11
   sections with sign-off. See the mode matrix in `references/test-plan-sections.md`.
3. **qa-project.yml** — project profile, resolved first-match:
   `<outputs-root>/<feature-key>/qa-project.yml` -> `<outputs-root>/qa-project.yml` ->
   `$QA_PROJECT_PROFILE`. If none exists, offer to scaffold one from
   `templates/qa-project.example.yml` and ask the user for the values; or proceed and mark
   missing logistics as `TBD — <who to ask>`.

### Output path

`<outputs-root>/<feature-key>/2-test-plan.md`, where `<outputs-root>` resolves as:
1. `$QA_WORKFLOW_OUTPUTS_DIR` if set.
2. Else the `outputs/` folder next to this workflow.
Create the feature folder with `mkdir -p`. Never write outside the resolved root. If
`2-test-plan.md` exists, ask: overwrite, rename to `2-test-plan.<timestamp>.md`, or abort.

## Process

1. **Resolve feature key and mode.** Validate the key (no spaces, `..`, leading dots, or
   path separators). Default mode to `sprint` unless the user says release/go-live/sign-off.
2. **Read Phase 1 analysis.** Load `1-analysis.md` and extract: feature summary, risk
   register (product risk), test condition list, gap checklist, cross-cutting flags,
   dependencies. This is the backbone the plan builds on. If the file is missing, stop and
   offer Phase 1.
3. **Read the project profile.** Load `qa-project.yml` (team, tools, environments, defect
   SLAs, communication channels, approvers). Resolve per the rules above.
4. **Short per-run interview.** Ask only what is not already known — typically: confirm
   scope (in/out), timeline/milestones, and the build/sprint id. Skip anything Phase 1 or
   the profile already answers. Keep it to a few questions.
5. **Fan out to the three agents in parallel** (see `superpowers:dispatching-parallel-agents`).
   Give each agent a tailored context bundle (it does not read files or MCP itself):
   - **test-strategy-architect:** feature summary, scope answers, test conditions,
     cross-cutting flags, the relevant Phase 1 product risks, mode.
   - **quality-gates-designer:** defect SLAs and severity owner from the profile, Phase 1
     risk severity, mode.
   - **risk-resource-planner:** project profile (team/tools/env), timeline answers, Phase 1
     dependencies and product risk register (for risk-based focus), mode.
   Each returns one JSON object per `templates/agent-output-schema.md`.
6. **Assemble the lighter sections** from the profile + agent notes: Overview header,
   Communication & Reporting (from `communication:`), Assumptions & Dependencies (Phase 1
   dependencies + interview assumptions), Approvals (from `approvers:`). In `sprint` mode,
   mark Schedule/Resource/Communication/Approvals "N/A for this cycle" unless data exists.
7. **Write `2-test-plan.md`** from `templates/test-plan-output.md`. Fill every section
   (or mark "N/A for this cycle" / `TBD — <who>`). No leftover `<...>` placeholders, no
   emoji, valid markdown. Apply the mode matrix for which sections are mandatory. Leave the
   `## 12. Verification` footer as-is; step 8 fills it.
8. **Verify loop (max 2 fix rounds).** Run an independent adversarial check before declaring
   the phase done. `round = 1`:
   a. Dispatch `test-plan-verifier` (fall back to `general-purpose` if not installed). Give
      it the full draft content, the run `mode`, and `references/verify-checklist.md` (or its
      path). It returns ONE JSON verdict per the verifier schema in
      `templates/agent-output-schema.md`.
   b. If `verdict` is `pass` (no `fail` checks) → stop the loop.
   c. Otherwise apply every `fail` check with `auto_fixable: true`: use its `suggested_fix`,
      editing ONLY the exact `offending` text it quotes — never rewrite whole sections. Save.
   d. Move every `unresolvable` item and every `fail` with `auto_fixable: false` to the
      `## 12. Verification` footer as an unresolved item. Do NOT loop on these.
   e. Re-dispatch the verifier on the updated draft. Stop when it passes, after 2 fix rounds,
      or when a round changes nothing — whichever comes first.
   f. If the verifier returns malformed JSON, retry once; if it still fails, skip verify and
      write "verify skipped (verifier error)" in the footer. Never block the deliverable.
   Fill the `## 12. Verification` footer: rounds run, final pass/fail counts, unresolved list
   ("- none" when clean).
9. **Print to the user:**
   ```
   Phase 2 done (mode: <sprint|release>). Output: <absolute-path-to-2-test-plan.md>
   Objectives: <n> | In/Out scope: <n>/<n> | Exit criteria: <n> | Delivery risks: <n>
   Open TBDs: <n> (logistics still to confirm)
   Verify: <pass | fixed in n round(s) | m unresolved>
   Next: Phase 3 — Test Case Design.
   ```

## Notes

- **Strategy over checklist.** The plan answers WHY each test type is chosen, not just what
  will be tested. Reject generic, copied strategy text.
- **Dare to write Out of Scope.** An empty Out-of-Scope column is a red flag — align the
  boundary with the PM before testing starts.
- **Exit criteria are non-negotiable.** Every plan has measurable exit criteria aligned
  with the PM, so "good enough to ship" is explicit.
- **Two kinds of risk.** Phase 2 §7 is delivery/process risk (requirement churn, env
  instability, timeline cut). Phase 1 product risk is pulled forward to drive risk-based
  test prioritization — do not duplicate it verbatim.
- **Profile, not re-typing.** Team/tools/SLAs live in `qa-project.yml`; only per-sprint
  specifics are asked each run.
- **No placeholders, no emoji, plain markdown.** Personal data (specific names, channels)
  comes from the profile, which the team controls; do not invent names.
- **Verify is a gate, not a rewrite.** The verifier only flags and quotes; the orchestrator
  applies the small fix. Respect the mode — a "N/A for this cycle" section in sprint mode is
  not a defect. Leftovers after 2 rounds go in the `## 12. Verification` footer for a human.
- **Next phase.** The output is the canonical input to Phase 3 — keep headings stable and
  do not rename the file.

## Common failure modes to avoid

- Producing a list of test cases instead of a strategy. Conditions stay high-level here.
- Copying a strategy template without tying each test type to a project-specific reason.
- Omitting exit criteria, or writing un-measurable ones ("test thoroughly").
- Inventing team members, dates, or SLAs when the profile is missing — mark `TBD — <who>`.
- Re-listing Phase 1 product risks as if they were delivery risks. Keep the two distinct.
- Running a full 11-section release plan for a routine sprint — default to `sprint` mode.
