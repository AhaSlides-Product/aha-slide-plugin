# Tracking Recorder — Design

**Status**: Draft for review
**Date**: 2026-08-03
**Author**: Huong Nguyen (with Claude)

## Problem

Checking whether a UI element fires an analytics event is, today, entirely manual.
A QA opens DevTools, clicks a button, reads the console, and decides whether a
`[analytics]` line appeared. Repeat for every element on the screen. The process
has four failure modes:

1. **It does not scale.** An editor screen has 30–40 interactive elements. Nobody
   clicks all of them, so coverage is whatever the tester remembered.
2. **It is unverifiable.** "I checked the editor" carries no evidence. There is no
   artefact showing which elements were exercised and which were not.
3. **It only works where the console talks.** `aha-survey` logs `[analytics]` only
   when `import.meta.env.DEV` or `VITE_MIXPANEL_DEBUG === 'true'`
   (`frontend/src/analytics/track.ts`). Production is silent, so the method
   reports *everything* as missing — confidently and uniformly wrong.
4. **It does not work for slide plugins at all.** A slide plugin never calls
   Mixpanel; it calls `window.xprops.trackGA4AndMixpanel(...)` across a zoid
   postMessage bridge (`packages/ui/src/tracking.ts`). Nothing appears in the
   plugin iframe's console.

## Goal

A per-screen tool that produces a complete, evidenced answer to one question:

> For this screen, which interactive elements fire a tracking event, which do
> not, and which could not be checked?

Two priorities, in order:

- **A — script does the mechanical work.** Element inventory, clicking safe
  elements, capturing payloads, pairing action to event, and flagging
  machine-detectable defects are all deterministic code. No LLM.
- **B — LLM does only the final judgement.** Given a paired timeline, decide
  whether each event *name* matches the action, whether *props* look sane, and
  write the report.

## Non-goals (explicit)

- **No whole-app crawl.** One run covers one screen in one state. Reaching a
  different state (a modal, a populated Results page) is the tester's job.
- **No spec comparison in v1.** The tool does not read Jira tickets, the
  `EVENTS` catalog, or the Mixpanel Lexicon. It judges an event against the
  action that produced it, nothing more. Adding a spec source later is a new
  input to the same evaluator.
- **No replay or regression mode.** A session is not re-runnable. Turning
  recorded sessions into a CI suite is a future project.
- **No verification that Mixpanel received the event.** The tool proves the app
  *sent* it. Delivery, ingestion, and Lexicon registration are separate.
- **No judgement of naming conventions against the 2024 guideline.** The tool
  reports the name observed; whether `click_submit_button` conforms is a human
  call, except for the mechanical `_anonymous` / `undefined_action` cases below.
- **No Chrome extension.** A terminal command is the delivery mechanism.

## Architecture

### Distribution

Shipped as a Claude Code plugin in this repo, so a teammate installs it once and
uses it in any repo:

```
aha-slide-plugin/
├── .claude-plugin/
│   └── marketplace.json                    ← new, repo root
└── plugins/
    └── aha-tracking/
        ├── .claude-plugin/plugin.json
        ├── README.md
        └── skills/
            └── check-tracking/
                ├── SKILL.md                # LLM instructions (final step only)
                ├── recorder/
                │   ├── package.json        # playwright-core, pinned
                │   ├── .gitignore          # node_modules/
                │   ├── record.mjs          # entry: launch, inject, sweep, write
                │   ├── inpage.js           # hooks + action listener + inventory
                │   ├── decode.mjs          # payload → { name, props }
                │   ├── classify.mjs        # element → safe | risky | unreachable
                │   ├── pair.mjs            # timeline → pairs + flags (pure)
                │   ├── chrome.mjs          # Chrome path: macOS / Windows / Linux
                │   └── test/               # node:test + fixtures
                ├── references/
                │   └── event-naming.md
                └── templates/
                    └── report-template.md
```

Install:

```
/plugin marketplace add AhaSlides-Product/aha-slide-plugin
/plugin install aha-tracking
```

This repo already carries a repo-scoped skill
(`slide-plugin-built-by-ahasliders/.claude/skills/creating-slide-type-plugins/`).
That mechanism is deliberately **not** reused: a repo-scoped skill is only
available while working inside that repo, and this tool must run against
`aha-survey` and the presenter app too. The two mechanisms coexist —
repo-scoped skills for authoring inside a repo, a plugin for cross-repo QA tooling.

### Capture: three hook layers

The recorder hooks the **send path in the page**, not the network, and not the
console. Injected via Playwright `addInitScript`, which applies to every frame
and survives every navigation.

| Layer | Hook | Catches |
|---|---|---|
| Transport | `navigator.sendBeacon`, `window.fetch`, `XMLHttpRequest.prototype.send` | `aha-survey` (`api_transport: 'sendBeacon'`), presenter app |
| SDK | `window.mixpanel.track` | any app embedding mixpanel-browser directly |
| Bridge | `window.xprops.trackGA4AndMixpanel` | **slide plugins inside a zoid iframe** |

Rationale for each rejected alternative is in *Rejected alternatives*.

A payload counts as tracking when its URL path contains `/track` or `/engage`,
or its body carries a `data=` parameter, or it decodes to `{ event, properties }`.
`decode.mjs` normalises base64, URL-encoded, raw JSON, and batched-array forms
to `{ name, props }`.

The bridge layer is why frame identity is recorded on every record: layer 3 only
ever fires inside an iframe, and a report that cannot distinguish host from
plugin frame is unreadable.

### Run model: one screen, three passes

```
$ node record.mjs https://dev01.example/surveys/123/edit

  Pass 0 — you steer
    Chrome opens on a dedicated profile. Put the screen into the state you
    want tested (log in, open the tab, seed data). Press Enter.

  Pass 1 — script inventories
    Every interactive element on the screen is enumerated and classified:
      button, a[href], input, textarea, select,
      [role=button|switch|tab|menuitem|checkbox], [contenteditable]

      34 found → 26 safe · 5 risky · 3 unreachable

  Pass 2 — script sweeps the safe ones
    For each: mark console/event high-water, click, wait 1500ms, re-read,
    then recover state (see below). Live output per element.

  Pass 3 — you do the rest
    Terminal prints the 8 remaining elements and keeps recording. You click
    Delete, Publish, open the dropdown. Ctrl+C writes session.json.
```

Screen scope is defined by URL. If a click navigates away, the recorder
navigates back to the target URL and re-enumerates — indices from pass 1 are
stale after any DOM change.

### Element classification (`classify.mjs`)

Deterministic, and deliberately conservative — a misclassification that clicks
Delete costs real data.

| Class | Rule | Handling |
|---|---|---|
| **risky** | Accessible name matches destructive vocabulary (`delete`, `remove`, `xoá`, `publish`, `send`, `close`, `archive`, `reset`, `pay`, `upgrade`), or `type=submit` inside a form, or `href` leaving the screen origin | Never auto-clicked. Listed for the manual pass |
| **unreachable** | Not visible, zero-size, `disabled`, `aria-hidden`, or inside a collapsed `[aria-expanded=false]` subtree | Not auto-clicked. Reported as ⚠️ with the reason |
| **safe** | Everything else | Auto-clicked in pass 2 |

Native dialogs are a hard stop: a `confirm()` freezes the automation and kills
the session. Playwright's `dialog` event is registered to auto-dismiss and to
mark the triggering element ⚠️ `native-dialog`, but destructive vocabulary is
the primary defence — the dialog handler is the backstop, not the plan.

### State recovery after each auto-click

Bounded because scope is one screen:

- URL changed → `page.goto(targetUrl)`, wait for load, re-enumerate.
- Modal or drawer opened → `Escape`, verify closed; if not, re-navigate.
- DOM materially changed (element count differs) → re-enumerate before continuing.
- Element vanished → mark ⚠️ `element-gone`; never guess.

### Session JSON — the contract between script and LLM

```jsonc
{
  "meta": {
    "url": "https://dev01.example/surveys/123/edit",
    "startedAt": "2026-08-03T12:04:01Z",
    "endedAt": "2026-08-03T12:19:44Z",
    "recorderVersion": "1.0.0",
    "hooksArmed": ["sendBeacon", "fetch", "xhr", "mixpanel", "xprops"],
    "signalDetected": true
  },
  "inventory": [
    { "id": 7, "class": "safe", "tag": "button", "text": "Preview",
      "testId": "preview-btn", "name": null, "section": "Editor top bar",
      "path": "main>header>button:nth-of-type(2)", "frame": "top" },
    { "id": 12, "class": "risky", "tag": "button", "text": "Delete",
      "reason": "destructive-vocabulary", "frame": "top" }
  ],
  "timeline": [
    { "seq": 2, "t": 1203, "kind": "action", "type": "click",
      "elementId": 7, "origin": "auto" },
    { "seq": 3, "t": 1290, "kind": "event",
      "name": "survey.editor_preview_clicked",
      "props": { "survey_id": 42, "variant": "classic" },
      "via": "sendBeacon", "frame": "top" },
    { "seq": 4, "t": 8100, "kind": "action", "type": "click",
      "elementId": 12, "origin": "manual" }
  ]
}
```

`origin` separates what the script clicked from what the human clicked. The
report distinguishes them because their reliability differs — an auto-click that
produced nothing is stronger evidence than a manual click that may have missed.

### Pairing and mechanical flags (`pair.mjs`)

A pure function: `(timeline) → { pairs, orphans, checks }`. Each event is
attributed to the nearest preceding action within 1500 ms. Then:

| Flag | Meaning | Detection |
|---|---|---|
| `no-event` | Action produced zero events | count |
| `anonymous-name` | Name contains `_anonymous` | `tracking.ts` falls back to `ANONYMOUS_ELEMENT` when the element has no `name` — a real slide-plugin defect class |
| `undefined-action` | Name contains `undefined_action` | the `EVENT_ACTIONS` fallback in `tracking.ts` |
| `duplicate` | Same event name ≥2× in one action window | string compare |
| `empty-props` | A prop value is `undefined`, `null`, or `""` | object walk |
| `orphan-event` | Event with no preceding action in window | page views, timers — **reported separately, not a defect** |

`anonymous-name` and `undefined-action` are exact-string defects derived from
this repo's own directive. They are found by `String.includes`, never by the LLM.

### What the LLM does

Given the paired session, exactly three things:

1. **Name ↔ action semantics.** Clicking *Delete* and observing
   `click_publish_button` is a defect no string comparison can find.
2. **Prop plausibility.** Missing `survey_id`; a user email in a payload; a prop
   whose value contradicts the action.
3. **Verdict and report.** Per element: ✅ / ❌ / ⚠️, plus a summary and the
   recommended follow-up.

### Report

Written to the existing QA outputs convention, so it sits beside the analysis,
test cases, and bug reports for the same ticket:

```
<outputs-root>/<task-id>/7-tracking-check.md
<outputs-root>/unscoped-tracking/<host>-<screen>-<YYYY-MM-DD>.md   # no task id
```

`<outputs-root>` is `$QA_WORKFLOW_OUTPUTS_DIR`, else
`$HOME/Documents/QA Workflow/AhaSlides/outputs`. Never write outside it.

The headline is a coverage statement, not a count of failures:

```
Screen /surveys/123/edit — 34 interactive elements
  ✅ fires an event         24    (20 auto-clicked, 4 manual)
  ❌ no event                7    ( 6 auto-clicked, 1 manual)
  ⚠️ could not check         3    ( 3 unreachable)
```

The three buckets always sum to the inventory total. An element is ⚠️ only when
nobody exercised it — the five `risky` elements above moved to ✅/❌ once the
tester clicked them in pass 3. If the tester skips some, they stay ⚠️ with
`reason: "risky, not manually exercised"`.

## Safety rules

1. **`signalDetected === false` blocks the report.** If the whole session
   captured zero tracking payloads, the hooks did not match this app — that is
   not "everything is missing". The run exits `signal-not-detected` and the skill
   refuses to produce a findings report. This is the single most dangerous
   failure mode: uniformly wrong output that reads as authoritative.
2. **Dedicated Chrome profile** (`~/.aha-track-profile`). The tool never drives
   the tester's daily browser.
3. **Data mutation is explicit.** Pass 2 clicks real buttons on real data. The
   tool states this and requires confirmation before pass 2, and the target must
   be a disposable survey.
4. **⚠️ is never downgraded to ❌.** An element that was not successfully
   interacted with is unknown, not failing.
5. **Partial runs say so.** If a run ends early, the report names the elements
   never reached rather than presenting partial coverage as complete.

## Rejected alternatives

**Console scraping (`[analytics]` lines).** What the current manual process and
the existing `aha-check-tracking` skill use. Rejected: silent on production,
absent in slide-plugin iframes, and gated behind `VITE_MIXPANEL_DEBUG`.

**Network interception by host (`api.mixpanel.com`).** Rejected: `aha-survey`
sets `api_host` from `VITE_MIXPANEL_API_HOST`, which on dev01 is the first-party
proxy `mt.dev.ahaslide.com`. A host filter silently captures nothing.

**Network interception by request, at the CDP layer.** Closer, but `sendBeacon`
bodies are unreliable to read across CDP versions, and it still misses the zoid
bridge entirely — a slide plugin's tracking never becomes a network request in
its own frame.

**Hand-rolled CDP client to avoid the `playwright-core` dependency.** Node 18
has no global `WebSocket`, so a raw CDP client needs ~120 vendored lines. Cheaper
in dependencies, more expensive where it matters: the bridge hook must run inside
every iframe, which means managing `Target.setAutoAttach` per frame by hand.
Playwright's `addInitScript` does this correctly for free. Precedent also exists
— `aha-ui-audit/scripts/` already ships `playwright-core` under a skill.

**Full automatic crawl.** Rejected: it clicks Delete and Publish, and even then
cannot reach state-dependent elements. It buys little coverage over the sweep +
manual split and guarantees eventual data loss.

**Comparing against a spec (Jira / `EVENTS` catalog / Mixpanel Lexicon).**
Deferred, not rejected. It requires either a per-ticket tracking table that does
not reliably exist today, or a per-app catalog that does not exist for the
presenter app. The action-relative judgement works everywhere with zero setup;
a spec source can be added later as an extra input.

## Trade-offs and edge cases

- **Coverage equals one screen in one state.** The tool cannot claim anything
  about states it was not driven into. The report is explicit about which URL
  and which state it describes.
- **The 1500 ms pairing window is a heuristic.** An event debounced beyond it is
  attributed to the wrong action or becomes an orphan. Mitigated by reporting
  orphans separately and never counting them as failures.
- **Destructive-vocabulary matching is English + Vietnamese.** A destructive
  button labelled only with an icon and no accessible name will classify as
  `safe`. This is a real risk, reduced but not eliminated by the dialog handler.
  It is also a genuine a11y defect worth reporting on its own.
- **Auto-clicking changes app state even when it is not destructive.** A "safe"
  click that opens a modal costs a recovery cycle; a safe click that silently
  saves a draft is invisible. Runs must use disposable data.
- **`origin: "auto"` and `origin: "manual"` carry different confidence.** Stated
  in the report rather than smoothed over.

## Testing

| File | Covers |
|---|---|
| `test/decode.test.mjs` | base64, URL-encoded, raw JSON, batched array, `xprops` bridge payload shapes |
| `test/classify.test.mjs` | destructive vocabulary (en + vi), disabled/hidden/collapsed, icon-only unnamed elements |
| `test/pair.test.mjs` | attribution inside/outside the 1500 ms window, orphans, every flag, empty timeline |
| `test/smoke.test.mjs` | a static local HTML page calling `sendBeacon` and a stub `xprops` — asserts the recorder captures both end to end |

The smoke test is the one `aha-ui-audit` lacks, and its absence is why that
skill's `capture.mjs` can be missing from the repo without anyone noticing.

## Total change set

New, all under `plugins/aha-tracking/` plus one repo-root file:

- `.claude-plugin/marketplace.json` (repo root)
- `plugins/aha-tracking/.claude-plugin/plugin.json`, `README.md`
- `skills/check-tracking/SKILL.md`, `references/event-naming.md`,
  `templates/report-template.md`
- `skills/check-tracking/recorder/`: `package.json`, `.gitignore`, `record.mjs`,
  `inpage.js`, `decode.mjs`, `classify.mjs`, `pair.mjs`, `chrome.mjs`
- `skills/check-tracking/recorder/test/`: four test files plus fixtures

No existing file in this repo is modified. Nothing in `apps/`, `packages/`, or
any submodule is touched.
