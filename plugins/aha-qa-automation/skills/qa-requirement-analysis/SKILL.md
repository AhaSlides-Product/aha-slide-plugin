---
name: qa-requirement-analysis
description: Use when analyzing a requirement, ticket, or spec in Phase 1 of the QA workflow — orchestrates 4 specialist sub-agents to produce clarification questions, a test-condition list, a risk register, and a gap checklist. Triggers on "analyze requirement", "requirement analysis", "risk assessment for [ticket]", "analyze risk", "Phase 1 QA".
---

# QA Phase 1 — Requirement Analysis (orchestrator)

## Purpose

Phase 1 of the product-agnostic `common_QA_workflow`. This skill is the **orchestrator**
(the capability / "how"): it reads a requirement, fans the same spec out to four specialist
**agents** (isolated workers / "who") each running in its own context on a different lens,
then dedups and synthesizes their findings into one analysis file with four deliverables:

1. Clarification questions for BA/PM/Dev
2. Test condition list (preliminary)
3. Risk register
4. Gap / missing-info checklist

The goal is to surface risk, ambiguity, and missing scope **before** any test case is
written. A good output is one a PM, BA, and engineer can read in five minutes and walk
away knowing what could break, what is still ambiguous, and what is out of scope.

This phase produces analysis and risk — **not** test cases. Test-case design is Phase 2.

## When to use

- `analyze requirement <ticket>`
- `requirement analysis for <feature>` / `Phase 1 QA for <ticket>`
- `risk assessment for <KEY>` / `analyze risk` / `find risks for this ticket`
- `what could break if we ship <feature>` / `edge cases for <feature>`

Do not use for test-case writing, bug triage, or release sign-off — those are later phases.

## The four specialist agents

This skill dispatches these sub-agents (installed via `install.sh` as real
`subagent_type`s). Each owns a cluster of the 8 dimensions in
`references/analysis-dimensions.md`:

| subagent_type | Lenses |
|---|---|
| `qa-clarity-analyst` | Clarity & Ambiguity + Consistency |
| `qa-completeness-analyst` | Completeness — unhappy paths, null/empty/boundary, intermediate states, roles |
| `qa-logic-analyst` | Business Rules + Dependencies & Integration |
| `qa-quality-analyst` | Testability + NFR + Risk & Impact |

If a `subagent_type` is not installed, fall back to dispatching a `general-purpose` agent
with the same prompt (the agent files are in `../../agents/`). Do not block on installation.

## The verifier agent

After the draft is written, one more sub-agent runs an independent adversarial check:

| subagent_type | Job |
|---|---|
| `qa-requirement-verifier` | Reads the finished `1-analysis.md` + `references/verify-checklist.md`, tries to break it, returns a pass/fail verdict with the offending text quoted. |

It is separate from the four analysts on purpose — a fresh context that never saw the writing
is harder to fool than self-review. Same fallback rule: if not installed, dispatch
`general-purpose` with the agent prompt.

## Inputs

At least one of these must be provided. If none are, ask before continuing — do not guess.

1. **Jira/issue key** (e.g. `AHA-1234`, `PROJ-99`). Preferred — also serves as the feature key.
2. **Confluence URL** to a spec page.
3. **Pasted spec text** — fallback for unticketed work or specs in Slack/Figma/email.

### Feature key resolution

- If the user gave an issue key, use it verbatim as the feature key.
- Otherwise ask: "What short kebab-case name should I use? (e.g. `idea-board-export`)".
- If the user offers none, derive from the title: lowercase, spaces→`-`, strip
  punctuation, cap at 40 chars.
- **Validation:** reject any key with spaces, `..`, leading dots, or path separators.
  Re-prompt if invalid — never write a file with a malformed key.

## Output

A single markdown file:

```
<outputs-root>/<feature-key>/1-analysis.md
```

`<outputs-root>` resolves as:

1. If `$QA_WORKFLOW_OUTPUTS_DIR` is set, use it.
2. Else use the `outputs/` folder next to this workflow
   (`<common_QA_workflow>/outputs`). Create the feature folder with `mkdir -p`.
3. Never write outside the resolved root; never use absolute paths outside it.

Structure follows `templates/analysis-output.md` exactly (six sections, fixed order).

## Process

1. **Resolve feature key** (Inputs rules). Re-prompt on invalid key.
2. **Resolve output path.** Compute `<outputs-root>/<feature-key>/`, `mkdir -p`. If
   `1-analysis.md` already exists, ask: overwrite, rename to `1-analysis.<timestamp>.md`,
   or abort. Never overwrite silently.
3. **Fetch the requirement ONCE.**
   - Jira key → Atlassian MCP `getJiraIssue` (or plugin variant): summary, description,
     acceptance criteria, linked issues.
   - Confluence URL → `getConfluencePage` with the page ID parsed from the URL.
   - Neither / MCP not authenticated → ask the user to paste the spec. Do not block on
     auth and do not run an interactive auth flow from this skill.
   - Capture the full spec text into a single variable — this exact text goes to all
     four agents, so they reason over an identical source.
4. **Fan out to the four agents in parallel.** Dispatch all four in one batch (see
   `superpowers:dispatching-parallel-agents` for the pattern). Give each agent:
   - the full spec text from step 3,
   - the contents of `references/analysis-dimensions.md` (or tell it to read that file),
   - the JSON contract from `templates/agent-output-schema.md`,
   - its lens assignment.
   Each agent returns **one JSON object** in the schema shape.
5. **Dedup + synthesize.** Merge the four JSON results:
   - Collapse duplicate clarification questions, test conditions, risks, and gaps
     (two agents flagging the same ambiguity → one entry). Tag each surviving item with
     the lens that raised it.
   - Resolve cross-cutting flags: if any agent says `yes`, the flag is `yes`; if all are
     silent/`unknown`, it is `unknown` and needs a paired question.
   - Build the risk register table; aim for 5–10 rows. Group when more than ~12.
   - Pair every `gap` and every `unknown` flag with a clarification question.
6. **Write `1-analysis.md`** from `templates/analysis-output.md`. Fill every section.
   Never leave a section blank — write `unknown` and add the matching question. The file
   must be valid markdown with no leftover `<...>` placeholders and no emoji. Leave the
   `## 7. Verification` footer as-is; step 7 fills it.
7. **Verify loop (max 2 fix rounds).** Run an independent adversarial check before declaring
   the phase done. `round = 1`:
   a. Dispatch `qa-requirement-verifier` (fall back to `general-purpose` if not installed).
      Give it the full draft content and `references/verify-checklist.md` (or its path). It
      returns ONE JSON verdict per the verifier schema in `templates/agent-output-schema.md`.
   b. If `verdict` is `pass` (no `fail` checks) → stop the loop.
   c. Otherwise apply every `fail` check with `auto_fixable: true`: use its `suggested_fix`,
      editing ONLY the exact `offending` text it quotes — never rewrite whole sections. Save.
   d. Move every `unresolvable` item and every `fail` with `auto_fixable: false` to the
      `## 7. Verification` footer as an unresolved item. Do NOT loop on these.
   e. Re-dispatch the verifier on the updated draft. Stop when it passes, after 2 fix rounds,
      or when a round changes nothing — whichever comes first.
   f. If the verifier returns malformed JSON, retry once; if it still fails, skip verify and
      write "verify skipped (verifier error)" in the footer. Never block the deliverable.
   Fill the `## 7. Verification` footer: rounds run, final pass/fail counts, unresolved list
   ("- none" when clean).
8. **Print to the user:**
   ```
   Phase 1 done. Output: <absolute-path-to-1-analysis.md>
   Clarification questions: <n> | Test conditions: <n> | Risks: <n> | Gaps: <n>
   Verify: <pass | fixed in n round(s) | m unresolved>
   Next: Phase 2 — Test Plan.
   ```

## Notes

- **Atlassian MCP is optional.** If `getJiraIssue` / `getConfluencePage` is not
  authenticated, fall back to pasted text. Never block on auth.
- **Agents do not call MCP.** The orchestrator fetches once; agents are pure reasoning
  over the provided text. This keeps the four analyses consistent and cheaper.
- **One spec, four lenses.** Do not paraphrase or trim the spec differently per agent —
  pass the identical text so findings are comparable.
- **Risk sizing.** 5–10 rows is the target. Fewer than 3 is usually too shallow.
- **No placeholders, no emoji, plain markdown only.**
- **Personal data stays out** of `1-analysis.md` — specific PM names, channel IDs, sprint
  cadence go in a gitignored `NOTES.md` if needed, never the shared output.
- **Verify is a gate, not a rewrite.** The verifier only flags and quotes; the orchestrator
  applies the small fix. Do not let the verify loop rewrite the whole analysis, and do not
  loop past 2 fix rounds — leftovers belong in the `## 7. Verification` footer for a human.
- **Next phase.** The output is the canonical input to Phase 2. Keep headings stable and
  do not rename the file.

## Common failure modes to avoid

- Treating Phase 1 as test-case design. Conditions here are preliminary seeds, not cases.
- Writing risks from intuition without consulting the source. Quote or paraphrase the spec.
- Mitigations like "test thoroughly" / "be careful". Use concrete actions.
- Marking every flag `unknown` to be safe. If the spec clearly says "web-only, US-only",
  record `no` and move on; only `unknown` when genuinely silent.
- Skipping clarification questions because the spec "looks complete". Surprises live in
  out-of-scope and edge-case corners — always ask.
- Letting two agents' duplicate findings both survive into the output. Dedup in step 5.
