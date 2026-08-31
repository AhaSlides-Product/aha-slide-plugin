# Preference Grouping Backend

NestJS service for the Preference-based Grouping slide type, auto-mounted by
`@aha/backend-main` under `/api/plugins/preferenceGrouping/*`.

- `POST /` — per-submission handler: returns a unique-submitter count plus a live
  tally ping (sender id only, never the picks).
- `POST /external/form-groups` — runs the server-side grouping algorithm
  (`src/grouping.ts`) over every collected pick and returns balanced groups.

See the app-level `README.md` for the full flow. Run tests with `npm run test`.
