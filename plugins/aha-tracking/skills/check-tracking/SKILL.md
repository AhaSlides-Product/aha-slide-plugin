---
name: check-tracking
description: Use when checking whether an AhaSlides feature fires its analytics events — triggers on "check tracking", "kiểm tra tracking", "which buttons are missing events", "verify analytics for <feature>", or when a tracking session.json is mentioned. Reads a session recorded by the tracking recorder and reports which elements and screen transitions fire events, which do not, and which could not be checked.
---

# AhaSlides — check event tracking

## Purpose

Turn a recorded session into a verdict. The recorder has already captured every
analytics payload the app sent, swept each screen, and paired actions to events.
This skill does the part scripts cannot: decide whether each event *name* fits
the action that produced it, whether its *props* are plausible, and write the
report.

## Inputs

1. **A `session.json`** produced by `recorder/record.mjs` (required).
2. **A task ID** (optional) — a Jira key matching `/AHA-\d+/`. Determines the
   output folder. Reject keys containing spaces, `..`, leading dots, or path
   separators, and re-prompt — never build a path from a malformed key.

## Recording a session first

If the user has no session yet, tell them to run:

```bash
cd <plugin>/skills/check-tracking/recorder
npm install                 # first run on each machine only
node record.mjs <url>       # add --allow-external only on a disposable account
```

Then: walk the feature, press `s` on each screen to sweep it, `Ctrl+C` to
finish. The session lands in `recorder/sessions/`.

**Requires a local display.** Do not attempt this under `claude.ai/code`, over
SSH, or from a background agent — Chrome is launched headed on the tester's own
machine.

**The sweep clicks real buttons on real data.** Confirm the target is a
disposable account before telling the user to press `s`. `--allow-external`
additionally clicks things with consequences outside that account (sending
email, upgrading a plan) — require a second, explicit confirmation for it.

## Process

### Step 0 — Bootstrap dependencies

Plugin updates replace the cached plugin directory, so `node_modules` may be
missing even on a machine that has run this before. Check and install without
asking:

```bash
cd <plugin>/skills/check-tracking/recorder
[ -d node_modules ] || npm install
```

If `npm install` fails (no network, no npm), say so plainly and stop — the
recorder cannot run without `playwright-core`.

### Step 1 — Pair the session, and respect the gate

```bash
node pair.mjs <session.json>
```

It prints `{ pairs, transitions, orphans, checks }` as JSON.

**If it exits 2 with `signal-not-detected`, STOP.** Report that the recorder
captured no analytics payload, so this session cannot be judged, and say which
hooks were armed (`meta.hooksArmed`). Do **not** produce a findings report.
Reporting every element as missing when the real cause is an unmatched hook is
the worst possible output: uniformly wrong and confidently phrased.

### Step 2 — Classify every element on every screen

For each screen's `inventory`, cross-reference the pairs by matching the pair's
`action.el.selector` and `action.el.nth` against the inventory entry:

| Verdict | Condition |
|---|---|
| ✅ | The element was clicked and at least one event followed within the window |
| ❌ | The element was clicked and no event followed (`no-event` flag) |
| ⚠️ | The element was never clicked — carry its `class` and `reason` through |

The three buckets must sum to the inventory total for that screen. State that
sum in the report so a reader can check it.

Every ⚠️ line names its reason and the action needed. Never write a bare "check
manually". Good: *"skipped: sends real email — re-run with `--allow-external`
on a disposable account"*. Bad: *"needs manual verification"*.

Distinguish `origin: "auto"` from `origin: "manual"` where it matters: an
auto-click that produced nothing is stronger evidence than a manual click that
may have missed its target.

### Step 3 — Judge names and props

For each ✅ pair, decide:

- **Name fit.** Does the event name describe what the element does? Quote the
  element label and the event name side by side when it does not.
- **Prop plausibility.** Flag a missing scope id, an email or other personal
  data, or a value contradicting the action.

Carry the mechanical flags through unchanged — `pair.mjs` already found
`no-event`, `duplicate`, `anonymous-name`, `undefined-action`, and
`empty-props`. Do not re-derive them; do not second-guess them.

See `references/event-naming.md` for what is and is not yours to judge.

### Step 4 — Transitions

Every entry in `transitions` carrying a `no-event` flag is a funnel gap: the
user moved between screens and nothing was recorded. Report these in their own
table — they are the findings the manual console method almost never reaches.

### Step 5 — Write the report

Resolve the output path, `mkdir -p` the folder, fill
`templates/report-template.md`, and give a short chat summary: per-screen
counts, the headline finding, and the absolute path.

```
<outputs-root>/<task-id>/7-tracking-check.md
<outputs-root>/unscoped-tracking/<feature>-<YYYY-MM-DD>.md   # no task id
```

`<outputs-root>` is `$QA_WORKFLOW_OUTPUTS_DIR`, else
`$HOME/Documents/QA Workflow/AhaSlides/outputs`. Never write outside this root.
If the file exists, ask — overwrite, rename with a timestamp, or abort — never
overwrite silently.

## Hard rules

1. **Never produce findings when the signal gate fails.**
2. **Never downgrade ⚠️ to ❌.** Unexercised is unknown, not failing.
3. **Never claim the event reached Mixpanel.** The recorder proves it was sent.
4. **Never report coverage that was not achieved.** Name the screens and
   elements the session never reached.
5. **Report only what the session contains.** Do not infer tracking from source
   code — runtime evidence is the whole point of the recorder.

## Known limits

- Coverage equals the screens the tester visited, in the states they created. A
  Results page with no responses is a different screen from one with fifty.
- The 1500 ms pairing window is a heuristic; a debounced event may land in
  `orphans`. Orphans are reported, never counted as failures.
- An icon-only element with no accessible name and no `data-testid` is
  `unreachable` by design — it cannot be judged safe to click. That is also a
  genuine accessibility defect worth raising separately.
- Element classification leans on framework danger markers and `data-testid`.
  On an app whose testids do not follow the destructive vocabulary, add a
  profile at `recorder/profiles/<app>.json` rather than trusting visible text —
  aha-survey alone ships 37 locales.
