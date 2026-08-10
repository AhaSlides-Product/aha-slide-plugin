---
name: qa-design-cases
description: Use when designing structured test cases for a feature in Phase 3 of the QA workflow — orchestrates 4 coverage-lens sub-agents (positive, negative/boundary, permission/state, cross-cutting/regression) into one executable test-case file built from the Phase 1 analysis and Phase 2 test plan. Triggers on "design test cases", "write test cases", "test case design for [feature]", "Phase 3 QA", "cases for [KEY]".
---

# QA Phase 3 — Test Case Design (orchestrator)

## Purpose

Phase 3 of the product-agnostic `common_QA_workflow`. This skill is the **orchestrator**
(the capability / "how"): it reads the Phase 1 analysis and Phase 2 test plan once, fans
the same context out to four specialist **agents** (isolated workers / "who") each designing
cases for one coverage lens, then dedups, numbers, orders, and writes one executable
test-case file.

This is the first phase that produces **test cases**. A good output is one a manual tester
can execute end-to-end in a single session, and one a Phase 4 automation author can convert
into scripts without re-asking what each case meant. The skill is opinionated about format
(fixed title shape, P1/P2/P3 priority, four case types) and conservative about volume — it
walks the coverage checklist and writes a case only when an item genuinely applies, rather
than padding the count with look-alike cases.

This phase produces cases — **not** analysis (Phase 1), strategy (Phase 2), automation
(Phase 4), or execution/bug reports (Phase 5+).

## When to use

- `design test cases for <feature>` / `write test cases for <KEY>`
- `test case design for <feature>` / `Phase 3 QA for <KEY>`
- `cases for <KEY>` (after Phase 2 is complete)

Do not use for requirement analysis (Phase 1, `qa-requirement-analysis`), test planning
(Phase 2, `qa-test-plan`), or execution/bug filing (Phase 5+). If the user wants Playwright
automation, this skill produces the cases automation reads — it is not the automation
itself.

## The four coverage-lens agents

This skill dispatches these sub-agents (installed via `install.sh` as real
`subagent_type`s). Each owns a cluster of the 7 boxes in
`references/coverage-checklist.md`:

| subagent_type | Boxes owned |
|---|---|
| `tc-positive-designer` | Golden / happy path |
| `tc-negative-boundary-designer` | Negative path + Boundary / edge |
| `tc-permission-state-designer` | Permission / role + Intermediate states |
| `tc-crosscut-regression-designer` | Cross-cutting + Regression |

If a `subagent_type` is not installed, fall back to dispatching a `general-purpose` agent
with the same prompt (the agent files are in `../../agents/`). Do not block on installation.

## The verifier agent

After the draft is written, one more sub-agent runs an independent adversarial check:

| subagent_type | Job |
|---|---|
| `testcase-verifier` | Reads the finished `3-test-cases.md` + `references/verify-checklist.md` (plus the Phase-1 risks and Phase-2 "Yes" rows for coverage), tries to break it, returns a pass/fail verdict with the offending case quoted. |

It is separate from the four designers on purpose — a fresh context that never saw the writing
is harder to fool than self-review, and it re-checks the coverage cross-check independently.
Same fallback rule: if not installed, dispatch `general-purpose` with the agent prompt.

## Inputs

1. **feature-key** (required) — locates the feature folder shared with earlier phases.
   - If the user gave a Jira/issue key or the prior phases' folder name, use it verbatim.
   - Otherwise ask: "What short kebab-case name should I use? (e.g. `idea-board-export`)".
   - **Validation:** reject any key with spaces, `..`, leading dots, or path separators.
     Re-prompt if invalid — never write a file with a malformed key.
2. **Phase 1 analysis** (`1-analysis.md`) — required. Read for the risk register,
   dependencies, cross-cutting flags, and preliminary test conditions. If missing, stop and
   offer to run `qa-requirement-analysis` first; do not fabricate the analysis.
3. **Phase 2 test plan** (`2-test-plan.md`) — recommended. Read for in/out scope, strategy
   rows marked "Yes", and exit criteria. If missing, proceed with a short interview (primary
   persona, scope, the two or three highest risks) and a printed warning.
4. **qa-project.yml** (optional) — only for primary-persona and cross-cutting defaults.

### Output path

`<outputs-root>/<feature-key>/3-test-cases.md`, where `<outputs-root>` resolves as:
1. `$QA_WORKFLOW_OUTPUTS_DIR` if set.
2. Else the `outputs/` folder next to this workflow.
Create the feature folder with `mkdir -p`. Never write outside the resolved root. If
`3-test-cases.md` exists, ask: overwrite, rename to `3-test-cases.<timestamp>.md`, or abort.
Never overwrite silently.

## Process

1. **Resolve feature key and output path.** Validate the key. Compute
   `<outputs-root>/<feature-key>/3-test-cases.md`, `mkdir -p` the folder, handle an existing
   file per the rules above.
2. **Auto-read prior phases ONCE.** Before asking any question, read
   `<outputs-root>/<feature-key>/1-analysis.md` (required) and `2-test-plan.md`
   (recommended). Extract:
   - From Phase 1: feature summary, risk register rows, dependencies, cross-cutting flags,
     preliminary test conditions.
   - From Phase 2: in-scope / out-of-scope, strategy matrix rows marked "Yes", exit
     criteria.
   Print one line per file found: `Found previous phase output: <path>. Reusing context.`
   followed by a short bullet list of what was reused (e.g. "Reusing 6 risk rows from Phase
   1, 4 strategy rows marked Yes from Phase 2, mobile=yes, i18n=yes"). If `1-analysis.md` is
   absent, stop and offer Phase 1. If only `2-test-plan.md` is absent, warn and run the
   short interview.
3. **Fan out to the four agents in parallel.** Dispatch all four in one batch (see
   `superpowers:dispatching-parallel-agents`). Give each agent:
   - the extracted Phase 1 + Phase 2 context (summary, scope, the relevant risk and
     strategy rows, cross-cutting flags, exit criteria),
   - the contents of `references/coverage-checklist.md` (or its path to Read),
   - the JSON contract from `templates/agent-output-schema.md`,
   - the format rules from `templates/testcase-format.md`,
   - its box assignment.
   Each agent returns **one JSON object** in the schema shape: a list of cases plus a list
   of skipped boxes.
4. **Merge, dedup, number, order.** Combine the four JSON results:
   - **Dedup** cases that two lenses both produced (same precondition + action +
     expected) — keep one, note the origin lens.
   - **Number** sequentially `TC-01 .. TC-NN` end-to-end (do not restart per section).
   - **Order** the file: Golden -> Negative -> Boundary -> Permission -> State ->
     Cross-cutting -> Regression. Within a section, P1 first.
   - **Coverage cross-check**: every Phase-2 strategy row marked "Yes" and every Phase-1
     high-likelihood / high-impact risk row must have at least one case. A missing one is a
     gap — generate a case before writing, do not silently skip.
   - **Volume guard**: aim for signal, not count (~12–25 for a normal feature). Collapse
     near-duplicate cases across roles/viewports/locales into one case with a `Run for:`
     line. Fewer than ~8 usually means negative/boundary were skipped without reason; more
     than ~30 usually means a scenario was duplicated.
4b. **Assign a layer to every case.** (Added by `aha-qa-automation`. Read
   `references/layer-assignment.md` for the full rules.) Stamp each case with exactly one of
   `unit` · `integration` · `api` · `e2e`, and put it in the case's metadata line so
   `qa-design-coverage` can read it later.

   Read `<testRoot>/.qa-profile.json` if the repo has one. Its `lowerLayers` array tells you
   which lower suites actually exist here. Two rules decide the assignment:

   - **Lowest layer that can prove it wins.** Pure logic → `unit`. A module against a real
     dependency → `integration`. Anything observable at the HTTP boundary → `api` (go broad
     here; these are fast and stable). Reserve `e2e` for journeys crossing ≥2 systems or
     behaviour that genuinely cannot be seen below the UI. Aim for roughly one golden-path
     `e2e` per feature.
   - **A missing lower layer is a gap, not a licence.** If a case belongs at `unit` but the
     repo's `lowerLayers` is empty, still assign `unit` and list it under
     `Lower-layer recommendations`. Do **not** re-assign it to `e2e` so that it gets
     automated. Promoting cases to the browser to make a coverage report green is what turns
     a test pyramid into an ice-cream cone.

   Print the resulting split (`unit n / integration n / api n / e2e n`) before writing.

5. **Write `3-test-cases.md`** from `templates/testcases-output.md`. One case per heading in
   the format from `templates/testcase-format.md`. Collect every agent's skipped boxes (with
   reasons) into the `Skipped coverage items` footer. Replace every angle-bracket
   placeholder. Validate before writing: no leftover `<...>`, no blank precondition/steps/
   expected, no duplicate `TC-NN`, no emoji. Leave the `## Verification` footer as-is; step 6
   fills it.
6. **Verify loop (max 2 fix rounds).** Run an independent adversarial check before declaring
   the phase done. `round = 1`:
   a. Dispatch `testcase-verifier` (fall back to `general-purpose` if not installed). Give it
      the full draft content, the Phase-1 risk register and Phase-2 strategy rows marked
      "Yes" (needed for the C5 coverage rule), and `references/verify-checklist.md` (or its
      path). It returns ONE JSON verdict per the verifier schema in
      `templates/agent-output-schema.md`.
   b. If `verdict` is `pass` (no `fail` checks) → stop the loop.
   c. Otherwise apply every `fail` check with `auto_fixable: true`: use its `suggested_fix`,
      editing ONLY the quoted `offending` case — never rewrite the whole file. For a C5
      coverage gap, generate the missing case and renumber `TC-NN` end-to-end. Save.
   d. Move every `unresolvable` item and every `fail` with `auto_fixable: false` to the
      `## Verification` footer as an unresolved item. Do NOT loop on these.
   e. Re-dispatch the verifier on the updated draft. Stop when it passes, after 2 fix rounds,
      or when a round changes nothing — whichever comes first.
   f. If the verifier returns malformed JSON, retry once; if it still fails, skip verify and
      write "verify skipped (verifier error)" in the footer. Never block the deliverable.
   Fill the `## Verification` footer: rounds run, final pass/fail counts, unresolved list
   ("- none" when clean).
7. **Print to the user:**
   ```
   Phase 3 done. Output: <absolute-path-to-3-test-cases.md>
   Cases: <n> (Golden <n> / Negative <n> / Boundary <n> / Permission <n> / State <n> / Cross-cutting <n> / Regression <n>)
   P1: <n> | P2: <n> | P3: <n> | Skipped boxes: <n>
   Layers: unit <n> / integration <n> / api <n> / e2e <n>   (lower-layer recommendations: <n>)
   Verify: <pass | fixed in n round(s) | m unresolved>
   Next: Phase 4 — Automation (`qa-implement`), or Phase 5 — Execution & Bug Report.
   ```

## Notes

- **Reuse Phase 1 and Phase 2, do not rewrite them.** Risk rows, scope, and strategy rows
  are the source of truth for what to cover. If a row needs to change, fix it upstream and
  re-run this skill.
- **Print the reuse banner early.** `Found previous phase output: <path>. Reusing context.`
  tells the reviewer whether this case set was bootstrapped from prior phases. Do not skip
  or paraphrase it.
- **Agents do not call MCP or read input files.** The orchestrator reads once and passes
  tailored bundles, so the four case sets are consistent and cheaper.
- **Coverage checklist is a prompt, not a target.** Skipping a box is normal — record WHY
  in the footer. A file that covers every box for a small feature is usually padded.
- **Title shape is fixed.** `[Type] - <Action> - <Expected>` with single-space-dash-
  single-space separators. Phase 4 automation parses the title, so deviating breaks the join.
- **Priority and type are independent axes.** A negative case can be P1 (protects a paid
  permission boundary); a positive case can be P3 (cosmetic admin-only path). Set both.
- **No placeholders, no emoji, plain markdown.** A precondition that says `<bulleted list>`
  is a hard error. Personal data (tester names, channels) stays out — reference roles and
  feature flags, not individuals.
- **One file per feature.** Output is always `3-test-cases.md` — singular. Multi-feature
  releases get one folder per feature.
- **Verify is a gate, not a rewrite.** The verifier only flags and quotes; the orchestrator
  applies the small fix (or generates one missing case for a coverage gap). Do not let the
  loop re-design the set, and do not loop past 2 fix rounds — leftovers go in the
  `## Verification` footer for the QA lead.
- **Next phase.** The output is the canonical input to Phase 4 (automation) and Phase 5
  (execution). Keep the heading shape stable and do not rename the file.

## Common failure modes to avoid

- Generating one case per checklist box regardless of fit. Skip boxes that do not apply and
  explain WHY in the footer; do not pad with look-alikes.
- Mis-labelling types. A "boundary" case testing the middle of a range is positive. A
  "regression" case with no link to a prior feature is a positive case in disguise.
- Steps that mix two actions ("click Export and confirm"). One step is one user-visible
  action; the step that triggers the expected result is on its own line.
- Expected results that name database tables, internal endpoints, or log lines. Keep them
  user-visible unless the case is explicitly an API test.
- Expected results that say "no errors". Replace with a concrete observable ("the list
  still loads", "no toast is shown").
- Letting two lenses' duplicate cases both survive. Dedup in step 4.
- Silently dropping a Phase-2 "Yes" strategy row or a Phase-1 high/high risk row. Every one
  needs at least one case.
- Letting the case count drive the design instead of the checklist plus the risk matrix.
