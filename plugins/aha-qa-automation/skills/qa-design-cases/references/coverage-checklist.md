# Test Case Coverage — the 7 boxes

The single source of truth for Phase 3. The orchestrator skill and all four coverage-lens
agents read this file. Each agent owns a subset of boxes (noted in `[owner: ...]`); the
orchestrator uses the whole list to cross-check coverage before writing the output.

A box produces **zero to N cases**. Generate a case for a box only when it genuinely applies
to the feature under test. A box that does not apply is **skipped with a one-line reason**
in the output footer — never silently dropped, never padded with a look-alike case.

For every case you write, you must be able to answer three questions (if you cannot, the
requirement detail is missing — push it back to Phase 1 as a clarification and skip the case
rather than committing a half-formed one):

1. **Precondition** — the smallest piece of state the system must be in before the steps run.
2. **Action** — the single action whose outcome the case is about (the last step).
3. **Expected** — what the user sees, hears, or reads after that action (observable).

---

## 1. Golden path  `[owner: tc-positive-designer]`

- The primary persona completes the core flow end-to-end and succeeds.
- Each acceptance criterion from Phase 1/2 has at least one positive case proving it.
- First-run / empty-then-populated happy states ("create the first item", "see it appear").
- Sensible-default and most-common-input paths, not just the minimal one.

## 2. Negative path  `[owner: tc-negative-boundary-designer]`

- Invalid input: wrong type, malformed, disallowed characters, out-of-range value.
- Required-field-missing, submit-with-empty-form, cancel-midway.
- Error handling: the action is rejected and the user sees a specific, recoverable message.
- Conflict / duplicate-submit / stale-data rejection where the rule applies.

## 3. Boundary / edge  `[owner: tc-negative-boundary-designer]`

- `null`, empty, zero, one, the documented min and max, min-1 and max+1.
- Very-large input (long string, large list, large file) against the Phase-2 limit.
- Duplicate entries, special characters / emoji / RTL text in a text field.
- The label must match: a "boundary" case tests an edge, not the middle of a range.

## 4. Permission / role  `[owner: tc-permission-state-designer]`

- Each role in the matrix: who can do the action, who is blocked, who sees it hidden.
- Authorization on the paid / privileged path — a blocked role gets a permission error, not
  a silent success.
- Cross-tenant / ownership boundary: a user cannot act on another's resource.

## 5. Intermediate states  `[owner: tc-permission-state-designer]`

- Loading / pending / disabled-while-submitting states.
- Timeout, slow network, and the retry path.
- Partial failure: some succeed, some fail — what does the user see and what is the final
  state?
- Optimistic update then rollback on server rejection.

## 6. Cross-cutting  `[owner: tc-crosscut-regression-designer]`

Drive these directly off the Phase-1 cross-cutting flags and the Phase-2 strategy rows
marked "Yes". A flag marked `yes` MUST produce at least one case here.

| Flag | Case to consider |
|---|---|
| mobile | The flow on a mobile / small viewport; touch target and layout. |
| i18n / l10n | Non-English locale, date/number/currency format, RTL, long-translation overflow. |
| a11y | Keyboard-only navigation, screen-reader label, focus order, contrast. |
| performance | The flow under the Phase-2 load / payload / latency budget. |
| compatibility | The documented browser / device / OS matrix. |

## 7. Regression  `[owner: tc-crosscut-regression-designer]`

- Currently-working behaviour adjacent to the change that could break (the Phase-1
  regression-risk rows).
- Shared components / endpoints the feature reuses — verify they still behave for the old
  callers.
- Every Phase-1 high-likelihood / high-impact risk row should have at least one negative or
  regression case attached.

---

## Output section order

The orchestrator orders the written file by box, not by case type:

Golden -> Negative -> Boundary -> Permission -> State -> Cross-cutting -> Regression

Cases are numbered `TC-01 .. TC-NN` end-to-end across the whole file (not restarting per
section). Within a section, P1 cases come first.

## Priority and type

- **Priority** (`P1` / `P2` / `P3`) = how much it matters to ship: P1 blocker / critical
  path, P2 major scenario, P3 minor or cosmetic.
- **Type** (`Positive` / `Negative` / `Boundary` / `Regression`) = the nature of the case.
- They are **independent**. A negative permission case can be P1; a positive cosmetic case
  can be P3. Set both fields on their own merits.

## Parameterised cases

Where the same steps run across roles, viewports, or locales, write the case **once** and
add a `Run for:` line under the precondition listing the variations. Phase 4 expands them
into individual runs. This keeps the file readable without losing coverage.
