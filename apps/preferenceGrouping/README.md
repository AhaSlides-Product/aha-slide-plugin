# Preference-based Grouping

A slide type where everyone privately picks up to 3 peers they'd like to team up
with, and AhaSlides auto-forms balanced groups that maximise satisfied picks,
prioritising **mutual** choices. Individual picks stay private — only the final
groups are shown, and no match rate is ever displayed.

> Everyone chooses. AhaSlides does the grouping.

## How it works

1. **Audience** (`frontend/src/pages/Audience.vue`) — each participant multi-selects
   up to 3 peers from the live roster and submits via `sendLiveSubmission` with
   `attributes: { pickedPeerIds }`. Abstaining (zero picks) is allowed.
2. **Backend tally** (`backend/src/app.service.ts`) — each submission returns a
   `count_unique` of submitters plus a live ping carrying **only** the sender id
   (never the picks), so the canvas tally updates without leaking who picked whom.
3. **Presenter canvas** (`frontend/src/pages/Canvas.vue`) — shows a live
   "X of Y submitted" tally and a "Form groups" control-bar action. On invoke it
   collects every pick (presenter-authorised read), POSTs them to this plugin's
   own backend, writes the computed groups to slide attributes, and reveals them.
4. **Grouping algorithm** (`backend/src/grouping.ts`) — runs **server-side**:
   models picks as a directed graph, seeds groups from mutual-pick clusters,
   greedily places everyone else to maximise satisfied connections, then runs
   local-search swaps and an "at least one satisfied pick" pass. Deterministic
   given a seed. Thoroughly unit-tested in `backend/src/grouping.spec.ts`.
5. **Reveal** — each audience reads its own group from slide attributes and sees
   "You're in Group N with X, Y, Z".

## Privacy

The presenter never sees who picked whom; the audience only ever sees the roster
and, after the reveal, its own group. Picks are read only by the presenter's
authorised backend call — they never travel over the shared live topics.

## Settings

`frontend/src/pages/Settings.vue` exposes a single **Group size** setting
(default 4); the number of groups is derived from the headcount. Minimum group
size is 3 (guards the group-of-2 mutual-pick leak).

## Develop

```bash
npm run dev  -w @aha/preference-grouping-frontend
npm run test -w @aha/preference-grouping-backend
```
