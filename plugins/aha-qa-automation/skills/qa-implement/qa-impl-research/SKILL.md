---
name: qa-impl-research
description: Sub-stage 1 of qa-implement — resolves every selector and API endpoint a designed test case needs, by searching the product source rather than guessing. Dispatched by qa-implement; not usually invoked directly.
---

# Sub-stage 5.1 — Research

## Purpose

Produce a **resolution map**: for every designed case in scope, the concrete selector for
each UI element and the concrete endpoint + payload shape for each API call.

Nothing is written to a spec until this map is complete. A guessed selector produces a test
that fails for a reason unrelated to the behaviour under test, and that failure costs more
to diagnose than the research costs to do.

## Inputs

- `.qa-profile.json` (paths, conventions)
- The design document, filtered to in-scope cases
- The **product** repository — the app under test. For a standalone QA repo this is a
  different checkout; find its path in the repo's own config (longbien keeps
  `PRESENTER_APP_PATH`, `AUDIENCE_APP_PATH`, `API_REPO_PATH` in `configs/env/.env`).

## Process

### 1. Inventory what already exists — before searching the product

Grep the profile's `paths.pages` and `paths.apiObjects` for each element and endpoint the
design needs.

**Reuse beats creation.** A getter that already exists under a different name still counts
as existing — read the page object files, do not trust filenames. Record for each need:
`reuse <Class>.<method>` or `new`.

This step is what prevents the most common defect in generated test code: a second getter
for a testid that already had one.

### 2. Resolve each UI selector — three strategies, in order

1. **Grep the product source** for the visible label, the component name, or a nearby
   testid. Prefer a stable `data-testid` over role/text.
2. **Read the component** to confirm the testid is unconditional. A testid rendered only in
   one branch, or composed at runtime (`` `row-${id}` ``), must be recorded as a templated
   getter, not a literal.
3. **Inspect the running app** on the default environment if the source is ambiguous.

Record for each: element name · selector · strategy that found it · file:line of the source.

**If all three fail:** emit `HALT_LOCATOR_MISSING` with the element, the case id, and what
was tried. Stop. Do not substitute a text or nth-child selector to keep moving — an
order-dependent selector is a future flake with no owner.

### 3. Resolve each API endpoint

From the backend source or the existing API objects, record: method · path · required
headers · request shape · success status · error statuses the design exercises.

Where the design needs a precondition (an existing survey, a published presentation),
identify the **API** route to create it. Preconditions are seeded via API, never by
clicking through the UI.

### 4. Identify the test data

For each case: what data must exist beforehand, what the test creates, and what must be
cleaned up. Note any data that cannot be created via API — that is a constraint the spec
author needs before writing, not after.

## Output — the resolution map

Write it to the pipeline's working notes and return it. Structure:

```
## <CASE-ID> — <title>   [layer: e2e]
Elements:
  publish button    | getByTestId('editor-publish-btn') | grep src/Editor/Header.tsx:42 | NEW    -> EditorPage.getPublishBtn()
  status badge      | getByTestId('status-badge')       | grep src/Editor/Badge.tsx:15  | REUSE  -> EditorPage.getStatusBadge()
Endpoints:
  seed survey       | POST /api/v1/surveys        | 201 | body {title, status}
  publish           | POST /api/v1/surveys/{id}/publish | 200
Data:
  precondition: one draft survey owned by TEST_USER  (seed via API)
  cleanup: delete the survey
Unresolved: none
```

## Validation — `qa-impl-research-checker`

The checker fails this sub-stage when any of these hold:

| # | Rule |
|---|---|
| R1 | A case in scope has an element or endpoint with no resolution, and no `HALT_LOCATOR_MISSING` was raised. |
| R2 | A selector was recorded without the source evidence (file:line) that produced it. Unevidenced selectors are guesses. |
| R3 | A selector marked NEW already exists in `paths.pages` under any name. |
| R4 | A selector depends on element order (`nth`, `first()`) or on user-visible copy, where a testid exists. |
| R5 | A runtime-composed testid was recorded as a literal instead of a templated getter. |
| R6 | A precondition is described as UI steps where an API route exists. |
| R7 | A case's data requirements are missing, or cleanup is unspecified for data the test creates. |

Fix and re-run, up to 3 attempts. Then stop and report.
