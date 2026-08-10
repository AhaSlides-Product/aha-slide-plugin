# Layer assignment

Added by `aha-qa-automation` (step 4b of `qa-design-cases`). Every designed case gets
exactly one layer before it is written. `qa-implement` reads the layer to decide what it
automates; `qa-design-coverage.mjs` reads it to decide what it expects to find in the
Playwright suite.

## The four layers

| Layer | Proves | Runs in |
|---|---|---|
| `unit` | Pure logic — formatting, validation rules, reducers, calculations, state transitions. No network. | The product repo's own unit suite |
| `integration` | One module against a real dependency — DB, queue, cache, another service. | The product repo's own integration suite |
| `api` | Anything observable at the HTTP boundary: CRUD, status codes, auth and permission matrices, payload contract, error shapes, idempotency. | `paths.specs.api` |
| `e2e` | Journeys crossing ≥2 systems, or behaviour that cannot be seen below the UI: rendering, navigation, cross-tab/session state, drag-and-drop, real file upload, respondent↔editor round-trips. | `paths.specs.e2e` |

## Rule 1 — the lowest layer that can prove it wins

Ask: *what is the cheapest layer at which this case would fail if the behaviour broke?*
Assign that layer.

A rule enforced by a pure function is a `unit` case even when the user meets it in a form.
A permission boundary is an `api` case even when the user meets it as a hidden button — and
then **one** `e2e` case may additionally cover that the button is hidden, because
"hidden in the UI" is a distinct claim from "rejected by the server". Both are worth having;
they are not duplicates.

Go **broad** at `api`: those tests are fast and stable, so breadth is cheap. Keep `e2e`
**narrow**: roughly one golden path per feature, plus genuinely UI-only behaviour.

## Rule 2 — a missing lower layer is a gap, not a licence

Read `lowerLayers` in the repo's `.qa-profile.json`.

If a case belongs at `unit` but this repo owns no unit suite, **still assign `unit`** and
list it under `Lower-layer recommendations` in the output. Do not re-assign it to `e2e`
so that something automates it.

This is the rule that matters most. Promoting cases up the pyramid to make a coverage report
green is exactly how a suite becomes slow, flaky, and eventually ignored — and the report
still says green while the real coverage gets worse.

The recommendation is the deliverable. Someone owns the product repo and can act on it.

## Rule 3 — never split one behaviour across layers to inflate the count

If `api` proves it, do not write the same assertion again at `e2e` "for confidence". A case
appears once, at one layer. Two cases are justified only when they prove **different
claims** (server rejects · UI hides), not the same claim twice.

## Recording it

Put the layer in the case's metadata line so it survives into the file and can be parsed:

```
### TC-07 - [Negative] - Submitting a survey past its close date - Rejected with 409
Layer: api | Priority: P1 | Source: Phase-1 risk R3
```

`qa-design-coverage.mjs` reads the first layer token it finds on the same line as the case
id. A case with no layer marker is assumed `e2e` and reported as a warning — assign the
layer explicitly rather than relying on that default.

## Output section

End the case file with:

```
## Lower-layer recommendations

These cases were designed for a layer this repo does not currently own. They are NOT
automated by qa-implement and must NOT be promoted to E2E.

| Case | Layer | Recommended home | Why it belongs there |
|---|---|---|---|
| TC-03 | unit | frontend/src/utils/__tests__ | Pure date-boundary maths; no network involved |
```
