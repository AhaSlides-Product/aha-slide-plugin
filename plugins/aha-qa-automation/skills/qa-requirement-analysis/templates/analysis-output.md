# Output skeleton — 1-analysis.md

The orchestrator writes this file after synthesizing all agent results. Replace every
angle-bracket placeholder. No placeholder may remain. Section order is fixed — later
phases locate content by heading position, so do not reorder, rename, or merge sections.

```markdown
# Phase 1 — Requirement Analysis: <feature-key>

**Source:** <Jira key / Confluence URL / pasted spec>
**Date:** <YYYY-MM-DD>
**Analysts:** clarity, completeness, logic, quality

## 1. Feature summary

<3-6 sentence summary: what the feature does, who it is for, why it is built.>

## 2. Clarification questions (-> BA / PM / Dev)

Questions to resolve before test design. Each tagged with the lens that raised it and,
where known, who should answer.

1. [clarity] <question> — *ask: <BA/PM/Dev>*
2. [completeness] <question>
3. [logic] <question>
...

## 3. Test condition list (preliminary)

High-level conditions to verify. These seed Phase 2 test-case design; they are not yet
full test cases.

- [happy] <condition>
- [unhappy] <condition>
- [edge] <condition>
- [permission] <condition>
- [nfr] <condition>

## 4. Risk register

| # | Risk | Likelihood (H/M/L) | Impact (H/M/L) | Mitigation | Owner |
|---|------|--------------------|----------------|------------|-------|
| 1 | <risk> | <H/M/L> | <H/M/L> | <concrete action> | <team> |

## 5. Gap / missing-info checklist

What the document does not yet cover. Each gap pairs with a question in section 2 where
an answer is needed.

- [ ] <gap> (see Q<n>)
- [ ] <gap>

## 6. Cross-cutting flags

- Mobile: <yes / no / unknown>
- EU / data-residency: <yes / no / unknown>
- i18n: <yes / no / unknown>
- a11y: <yes / no / unknown>
- Performance budget: <value / "not specified">
- Localization (timezone/currency/RTL): <yes / no / unknown>

## 7. Verification

Independent adversarial check by `qa-requirement-verifier` against
`references/verify-checklist.md`.

**Rounds:** <n> | **Checks:** <p> pass / <f> fail (final) | **Verifier:** qa-requirement-verifier

**Unresolved (needs a human):**
- <finding — who to ask>
<!-- write "- none" when every check passed and nothing was left for a human -->

---
*Next: Phase 2 — Test Plan. This file is the canonical input; keep headings stable.*
```

When a value is unknown, write `unknown` and add a matching question in section 2 —
never leave a blank.
