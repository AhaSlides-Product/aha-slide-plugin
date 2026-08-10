# Single test-case format

Every case in `3-test-cases.md` follows this exact skeleton, repeated once per case and
separated by a horizontal rule (`---`). The orchestrator and the agents both use this shape.

```markdown
## TC-<NN>: [<Type>] - <Action> - <Expected>

**Priority:** P1 / P2 / P3
**Type:** Positive / Negative / Boundary / Regression
**Source:** <Phase-1 risk Rn | Phase-2 strategy row | acceptance criterion>

### Precondition
- <state the system must be in before the steps run>
Run for: <variation A>, <variation B>   <!-- optional; omit the line if not parameterised -->

### Steps
1. <single user-visible action>
2. <single user-visible action>

### Expected result
- <observable outcome — what the user sees / what state changed / what message appeared>
```

## Field rules

- **Title** — shape `[<Type>] - <Action> - <Expected>` with single-space-dash-single-space
  separators. The action starts with a verb; the expected part is observable from the user's
  point of view, not an implementation detail. Phase 4 automation parses this title, so do
  not change the separator shape.
- **Priority** — `P1` blocker / critical path, `P2` major scenario, `P3` minor or cosmetic.
- **Type** — one of `Positive` / `Negative` / `Boundary` / `Regression`. The label must
  match the content (a boundary case tests an edge, not the middle).
- **Source** — the Phase-1 risk row, Phase-2 strategy row, or acceptance criterion this case
  traces to. This is the audit trail that proves the case earned its place.
- **Precondition** — a bulleted list of state: role, feature flag, data seeded, viewport.
  Pull preconditions from Phase 1/2 rather than re-deriving them. Optional `Run for:` line
  lists parameter variations (roles, viewports, locales).
- **Steps** — numbered; each step is one user-visible action. Do not collapse two clicks
  into one step. The last step is the action whose outcome the expected result describes.
- **Expected result** — a bulleted list of observable outcomes. No database rows, internal
  endpoints, or log lines unless the case is explicitly an API test. Never "no errors" —
  write a concrete observable instead.

## Worked example (excerpt)

For a feature `idea-board-export` with Phase 1 and Phase 2 complete:

```markdown
## TC-01: [Positive] - Export 10-row board as CSV - File downloads and opens

**Priority:** P1
**Type:** Positive
**Source:** Acceptance criterion AC-1; Phase-2 strategy row "Functional: Yes"

### Precondition
- Logged in as Owner of a board with 10 ideas
- Feature flag `idea_board_csv_export` enabled
- Desktop viewport 1440x900

### Steps
1. Open the board
2. Click the Export menu
3. Select "CSV"
4. Confirm the export

### Expected result
- A CSV file downloads within the Phase-2 latency budget
- The file opens in a spreadsheet app with one header row and 10 data rows

---

## TC-02: [Negative] - Export as Viewer role - Action blocked with permission error

**Priority:** P1
**Type:** Negative
**Source:** Phase-1 risk R3 (permission bypass)

### Precondition
- Logged in as Viewer of a board with 10 ideas
- Feature flag `idea_board_csv_export` enabled

### Steps
1. Open the board
2. Click the Export menu

### Expected result
- The CSV option is hidden, or shown disabled with a tooltip explaining the permission
- No file downloads

---

## TC-03: [Boundary] - Export a 10000-row board - Streamed download succeeds

**Priority:** P2
**Type:** Boundary
**Source:** Phase-2 exit criterion (max board size)

### Precondition
- Logged in as Owner of a board seeded with 10000 ideas
- Feature flag `idea_board_csv_export` enabled

### Steps
1. Open the board
2. Click the Export menu
3. Select "CSV"
4. Confirm the export

### Expected result
- The file downloads within the Phase-2 budget
- The file contains exactly 10001 lines (one header + 10000 data rows)
```

The pattern to copy: the precondition lists every piece of state needed (role, flag,
viewport), the steps are user-visible only, and the expected result is observable without
inspecting the database or the network tab.
