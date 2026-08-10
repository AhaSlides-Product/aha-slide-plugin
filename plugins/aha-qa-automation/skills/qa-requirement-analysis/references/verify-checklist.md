# Verify checklist — Phase 1 (requirement analysis)

The `qa-requirement-verifier` agent judges the finished `1-analysis.md` against these rules.
Each rule has an id. For every rule, decide `pass` or `fail`; when `fail`, quote the exact
offending text from the draft and give a concrete `suggested_fix`. Rules that need a human
decision (a PM/BA answer that no edit can supply) go to `unresolvable`, not the loop.

This checklist is the KIM standard — the criteria that judge the output. It is deliberately
separate from `analysis-dimensions.md`, which is the standard the designers WRITE against.

| id | Rule | How to judge a fail |
|---|---|---|
| R1 | Every risk in §4 has a basis in the source spec. | A risk that asserts a fact not present in the spec, or that reads as generic ("the feature may be slow") with no tie to the requirement. |
| R2 | Every gap in §5 and every `unknown` cross-cutting flag in §6 is paired with a clarification question in §2. | A gap or `unknown` flag with no matching question. |
| R3 | At least 3 risks, and every mitigation is a concrete action. | Fewer than 3 rows, or a mitigation like "test thoroughly" / "be careful" / "handle it". |
| R4 | Test conditions in §3 are conditions, not full test cases. | An item with numbered steps, exact input data, and expected output — that is a Phase 3 case, not a condition. |
| R5 | No leftover `<...>` placeholder, no emoji, valid markdown. | Any `<...>` angle-bracket placeholder, any emoji, or a broken table. |
| R6 | No duplicate findings survived the merge. | Two clarification questions, risks, or gaps that state the same thing in different words. |
| R7 | Cross-cutting flags are decided, not defaulted to `unknown` to be safe. | A flag marked `unknown` when the spec clearly states the answer (e.g. spec says "web only" but Mobile = unknown). |

## Auto-fixable vs unresolvable

- **Auto-fixable** (orchestrator edits the draft): R2 (add the paired question), R4 (rewrite
  the condition to be high-level), R5 (remove placeholder/emoji, fix table), R6 (collapse the
  duplicate), R7 (set the flag the spec supports).
- **Usually unresolvable** (needs a human): R1 when the risk is real but the spec is silent on
  the fact — flag it as "risk needs spec confirmation from PM/BA", do not delete blindly.
  R3 when the requirement is genuinely tiny and 3 real risks do not exist — note it rather
  than padding with filler.
