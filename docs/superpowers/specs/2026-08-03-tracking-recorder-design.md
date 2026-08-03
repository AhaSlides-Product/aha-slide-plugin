# Tracking Recorder — Design

**Status**: Draft for review
**Date**: 2026-08-03
**Author**: Huong Nguyen (with Claude)

## Problem

Checking whether a UI element fires an analytics event is, today, entirely manual.
A QA opens DevTools, clicks a button, reads the console, and decides whether an
`[analytics]` line appeared. Repeat for every element on the screen. Four failure
modes:

1. **It does not scale.** An editor screen carries dozens of interactive
   elements. Nobody clicks all of them, so coverage is whatever the tester
   remembered.
2. **It is unverifiable.** "I checked the editor" leaves no artefact showing
   which elements were exercised and which were not.
3. **It only works where the console talks.** `aha-survey` logs `[analytics]`
   only when `import.meta.env.DEV` or `VITE_MIXPANEL_DEBUG === 'true'`
   (`frontend/src/analytics/track.ts`). Production is silent, so the method
   reports *everything* as missing — confidently and uniformly wrong.
4. **It does not work for slide plugins at all.** A slide plugin never calls
   Mixpanel; it calls `window.xprops.trackGA4AndMixpanel(...)` across a zoid
   postMessage bridge (`packages/ui/src/tracking.ts`). Nothing reaches the
   plugin iframe's console.

Multi-screen features are worse still: an event that should fire *between*
screens (a funnel step, a page view) has no button to click, so the manual method
rarely checks them at all.

## Goal

A cross-repo tool that produces a complete, evidenced answer to one question:

> For this feature, which interactive elements and which screen transitions fire
> a tracking event, which do not, and which could not be checked?

Two priorities, in order:

- **A — the script does the mechanical work.** Element inventory, clicking,
  payload capture, action↔event pairing, and machine-detectable defects are all
  deterministic code.
- **B — the LLM does only the final judgement.** Given a paired timeline, decide
  whether each event *name* matches the action, whether *props* look sane, and
  write the report.

### Division of labour

The tester supplies **intent**; the tool supplies **thoroughness**.

The tool cannot know what "the feature" is. Given a dashboard URL it cannot infer
that the flow under test is *create survey → add three questions → publish →
view results*, nor that Results is only meaningful after a response exists, nor
what to type into a title field. Those are decisions, not clicks.

So the tester walks the feature once and presses `s` at each screen. The tool
does everything else — including clicking the elements the tester would never
have thought to try. Autopilot (§ Roadmap) later removes even the walking, but
sits on top of this engine rather than replacing it.

## Non-goals (explicit)

- **No spec comparison in v1.** The tool does not read Jira tickets, the `EVENTS`
  catalog, or the Mixpanel Lexicon. It judges an event against the action that
  produced it. A spec source can be added later as an extra input.
- **No replay or regression mode.** A session is not re-runnable. Turning
  sessions into a CI suite is a future project.
- **No verification that Mixpanel received the event.** The tool proves the app
  *sent* it. Delivery, ingestion, and Lexicon registration are separate concerns.
- **No naming-convention judgement** beyond the two mechanical cases below.
- **No Chrome extension.** A terminal command is the delivery mechanism.
- **No app-specific hardcoding.** The tool runs against `aha-survey`, the
  presenter app, and slide plugins. Anything that only holds for one of them
  belongs in an app profile, not in the engine.

## Architecture

### Distribution

Shipped as a Claude Code plugin in this repo, so a teammate installs once and
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
                │   ├── classify.mjs        # element → safe | last | external | unreachable
                │   ├── profiles/           # per-app signal overrides (JSON)
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
`aha-survey` and the presenter app too. The two coexist — repo-scoped skills for
authoring inside a repo, a plugin for cross-repo QA tooling.

### Capture: three hook layers

The recorder hooks the **send path inside the page** — not the network, not the
console. Injected via Playwright `addInitScript`, which applies to every frame
and survives every navigation.

| Layer | Hook | Catches |
|---|---|---|
| Transport | `navigator.sendBeacon`, `window.fetch`, `XMLHttpRequest.prototype.send` | `aha-survey` (`api_transport: 'sendBeacon'`), presenter app |
| SDK | `window.mixpanel.track` | any app embedding mixpanel-browser directly |
| Bridge | `window.xprops.trackGA4AndMixpanel` | **slide plugins inside a zoid iframe** |

A payload counts as tracking when its URL path contains `/track` or `/engage`,
or its body carries a `data=` parameter, or it decodes to `{ event, properties }`.
`decode.mjs` normalises base64, URL-encoded, raw JSON, and batched-array forms
to `{ name, props }`.

Frame identity is recorded on every record: layer 3 only ever fires inside an
iframe, and a report that cannot separate host from plugin frame is unreadable.

**Open risk (resolve in phase 2).** `xprops` is injected by zoid, and it is not
yet verified whether it exists when `addInitScript` runs or is assigned later. If
later, the hook must install a `defineProperty` trap that fires on assignment.

### Run model: a feature is many screens

Recording runs continuously from launch to `Ctrl+C` and spans any number of
screens — hooks are re-injected on every navigation. The *sweep* is what is
scoped to a screen, and it runs on demand:

```
$ node record.mjs https://dev01.example/dashboard

  Chrome opens on a dedicated profile. Walk the feature.
  Press [s] on any screen to sweep it. Ctrl+C when done.

  [s] at /dashboard
      inventory → auto-click safe elements → recover → live results
  … tester creates a survey, adds questions …
  [s] at /surveys/123/edit
  … tester publishes …
  [s] at /surveys/123/share
  ^C  → session.json
```

Each `s` keys its inventory to the URL at that moment. The session holds a
`screens[]` array plus one continuous timeline across all of them.

### Navigation is a first-class action

Events that fire on entering a screen — page views, funnel steps — have no click
to attribute to. They are recorded as `kind: "action", type: "navigate"` so
events following a transition attribute to that transition instead of becoming
orphans. This is what lets the report answer *"the four-step flow — which step is
missing its event?"*, a question the manual method almost never reaches.

### Element classification (`classify.mjs`)

Deterministic, app-agnostic, and layered so it degrades gracefully on an app the
engine knows nothing about. Signals in descending reliability:

| # | Signal | Why it is language-independent |
|---|---|---|
| 1 | Framework danger markers — `.ant-btn-dangerous` and equivalents | Emitted by AntD from `<Button danger>`; present in both React (aha-survey) and Vue (slide plugins) |
| 2 | `data-testid` keyword match | Test ids are authored in English and are not translated |
| 3 | Structure — `type=submit`, cross-origin `href`, `disabled`, `aria-hidden`, inside `[aria-expanded=false]` | Markup, not copy |
| 4 | App profile (`profiles/<app>.json`) | Explicit selectors/testids the team declares per app |
| 5 | Visible text keyword match (en + vi) | **Last resort, explicitly unreliable** |

Signal 5 is weak because `aha-survey` ships 37 locales (`frontend/src/i18n/`).
A Delete button rendered in Japanese matches no English keyword. Mitigation:
force the app locale to `en` before sweeping where the app allows it. Whether
locale can be forced externally is unresolved — see phase 4.

Classes and handling:

| Class | Handling |
|---|---|
| **safe** | Auto-clicked during the sweep |
| **last** | Auto-clicked, but queued to the end — clicking Delete first would destroy the screen and strand the remaining elements. Ordering, not prohibition |
| **external** | Consequences outside the test account: send email, invite, pay, upgrade, subscribe. Skipped by default; auto-clicked with `--allow-external` |
| **unreachable** | Not visible, zero-size, `disabled`, or in a collapsed subtree that could not be expanded |

Collapsed subtrees are expanded rather than skipped: click the trigger,
re-enumerate, sweep the revealed elements, `Escape`. Bounded recursion depth,
default 3.

Native dialogs are **not** a barrier. Playwright's `page.on('dialog')` dismisses
them. (The prohibition in the older extension-based `aha-check-tracking` skill
came from a browser extension, where a dialog freezes every subsequent command.
It does not apply here.)

### Session JSON — the contract between script and LLM

```jsonc
{
  "meta": {
    "startedAt": "2026-08-03T12:04:01Z",
    "endedAt": "2026-08-03T12:19:44Z",
    "recorderVersion": "1.0.0",
    "hooksArmed": ["sendBeacon", "fetch", "xhr", "mixpanel", "xprops"],
    "allowExternal": false,
    "signalDetected": true
  },
  "screens": [
    { "screenId": 1, "url": "https://dev01.example/dashboard",
      "sweptAt": "2026-08-03T12:05:12Z",
      "inventory": [
        { "id": 7, "class": "safe", "tag": "button", "text": "Preview",
          "testId": "preview-btn", "section": "Top bar",
          "path": "main>header>button:nth-of-type(2)", "frame": "top" },
        { "id": 12, "class": "external", "tag": "button", "text": "Send invitations",
          "reason": "testid-keyword:send", "frame": "top" }
      ] }
  ],
  "timeline": [
    { "seq": 2, "t": 1203, "kind": "action", "type": "click",
      "screenId": 1, "elementId": 7, "origin": "auto" },
    { "seq": 3, "t": 1290, "kind": "event", "name": "survey.dashboard.preview_clicked",
      "props": { "survey_id": 42 }, "via": "sendBeacon", "frame": "top" },
    { "seq": 4, "t": 8100, "kind": "action", "type": "navigate",
      "from": "https://dev01.example/dashboard",
      "to": "https://dev01.example/surveys/123/edit" }
  ]
}
```

`origin` separates script clicks from human clicks: an auto-click that produced
nothing is stronger evidence than a manual click that may have missed.

### Pairing and mechanical flags (`pair.mjs`)

A pure function: `(session) → { pairs, orphans, transitions, checks }`. Each
event attributes to the nearest preceding action — click or navigate — within
1500 ms. Then:

| Flag | Meaning | Detection |
|---|---|---|
| `no-event` | Action produced zero events | count |
| `anonymous-name` | Name contains `_anonymous` | `tracking.ts` falls back to `ANONYMOUS_ELEMENT` when the element has no `name` — a real slide-plugin defect class |
| `undefined-action` | Name contains `undefined_action` | the `EVENT_ACTIONS` fallback in `tracking.ts` |
| `duplicate` | Same event name ≥2× in one window | string compare |
| `empty-props` | A prop value is `undefined`, `null`, or `""` | object walk |
| `orphan-event` | Event with no preceding action in window | timers, retries — reported separately, **not** a defect |

`anonymous-name` and `undefined-action` are exact-string defects derived from
this repo's own directive. Found by `String.includes`, never by the LLM.

### What the LLM does

Given the paired session, exactly three things:

1. **Name ↔ action semantics.** Clicking *Delete* and observing
   `click_publish_button` is a defect no string comparison can find.
2. **Prop plausibility.** Missing `survey_id`; a user email in a payload; a value
   contradicting the action.
3. **Verdict and report.** Per element and per transition: ✅ / ❌ / ⚠️, plus a
   summary and recommended follow-up.

### Report

Written to the existing QA outputs convention, beside the analysis, test cases,
and bug reports for the same ticket:

```
<outputs-root>/<task-id>/7-tracking-check.md
<outputs-root>/unscoped-tracking/<feature>-<YYYY-MM-DD>.md   # no task id
```

`<outputs-root>` is `$QA_WORKFLOW_OUTPUTS_DIR`, else
`$HOME/Documents/QA Workflow/AhaSlides/outputs`. Never write outside it.

Shape — a per-screen breakdown plus a transitions section:

```
Feature: <name> — N screens

  ① /dashboard            <count> elements · ✅ … ❌ … ⚠️ …
  ② /surveys/:id/edit     <count> elements · ✅ … ❌ … ⚠️ …

  Transitions
  ① → ②   ✅ survey.editor_opened
  ② → ③   ❌ no event
```

Per screen, the three buckets always sum to the inventory total. An element is
⚠️ only when nobody exercised it, and every ⚠️ line names its reason and the
action needed — never a bare "check manually".

## Safety rules

1. **`signalDetected === false` blocks the report.** Zero tracking payloads in a
   whole session means the hooks did not match this app — not that everything is
   missing. The run exits `signal-not-detected` and the skill refuses to produce
   findings. This is the most dangerous failure mode: uniformly wrong output that
   reads as authoritative.
2. **Dedicated Chrome profile** (`~/.aha-track-profile`). Never the tester's
   daily browser.
3. **Data mutation is explicit.** The sweep clicks real buttons on real data. The
   target must be a disposable account, confirmed before the first sweep.
   `--allow-external` requires a second, separate confirmation.
4. **⚠️ is never downgraded to ❌.** An element not successfully interacted with
   is unknown, not failing.
5. **Partial runs say so.** A run that ends early names what it never reached
   rather than presenting partial coverage as complete.

## Rejected alternatives

**Console scraping (`[analytics]` lines).** What the manual process and the
existing `aha-check-tracking` skill use. Rejected: silent on production, absent
in slide-plugin iframes, gated behind `VITE_MIXPANEL_DEBUG`.

**Network interception by host (`api.mixpanel.com`).** Rejected: `aha-survey`
sets `api_host` from `VITE_MIXPANEL_API_HOST`, which on dev01 is the first-party
proxy `mt.dev.ahaslide.com`. A host filter captures nothing.

**Network interception at the CDP layer.** Closer, but `sendBeacon` bodies are
unreliable to read across CDP versions, and it misses the zoid bridge entirely —
a slide plugin's tracking never becomes a network request in its own frame.

**Hand-rolled CDP client to avoid `playwright-core`.** Node 18 has no global
`WebSocket`, so a raw client needs ~120 vendored lines. Cheaper in dependencies,
more expensive where it matters: the bridge hook must run inside every iframe,
which means managing `Target.setAutoAttach` per frame by hand. Playwright's
`addInitScript` does this correctly for free. Precedent exists —
`aha-ui-audit/scripts/` already ships `playwright-core` under a skill.

**Refusing to click destructive elements at all.** Rejected in favour of ordering
them last. On a disposable account the objection is not data loss but sequencing:
clicking Delete first strands every remaining element on that screen.

**Comparing against a spec (Jira / `EVENTS` / Mixpanel Lexicon).** Deferred, not
rejected. Requires either a per-ticket tracking table that does not reliably
exist, or a per-app catalog that does not exist for the presenter app. The
action-relative judgement works everywhere with zero setup.

## Trade-offs and edge cases

- **Coverage equals the screens the tester visited, in the states they created.**
  The report is explicit about which URLs and states it describes, and claims
  nothing beyond them.
- **The 1500 ms pairing window is a heuristic.** An event debounced beyond it is
  misattributed or becomes an orphan. Mitigated by reporting orphans separately
  and never counting them as failures.
- **Text-keyword classification is the weakest signal and 37 locales make it
  weaker.** Signals 1–4 carry the load; signal 5 is a backstop.
- **An icon-only button with no accessible name and no test id cannot be
  classified.** It falls to `unreachable` rather than `safe` — conservative by
  design. It is also a genuine a11y defect worth reporting on its own.
- **A "safe" click still changes state.** One that opens a modal costs a recovery
  cycle; one that silently saves a draft is invisible. Runs need disposable data.
- **`origin: "auto"` and `origin: "manual"` carry different confidence.** Stated
  in the report rather than smoothed over.

## Testing

| File | Covers |
|---|---|
| `test/decode.test.mjs` | base64, URL-encoded, raw JSON, batched array, `xprops` bridge payload shapes |
| `test/classify.test.mjs` | each signal in isolation and in precedence order; disabled/hidden/collapsed; icon-only unnamed elements; profile overrides |
| `test/pair.test.mjs` | attribution inside/outside the window, navigate-attributed events, orphans, every flag, empty timeline |
| `test/smoke.test.mjs` | a static local page calling `sendBeacon` and a stub `xprops` — asserts end-to-end capture of both |

The smoke test is what `aha-ui-audit` lacks, and its absence is why that skill's
`capture.mjs` can be missing from the repo without anyone noticing.

## Build order

Phases 1–2 come first because they prove the riskiest assumption — that the
payload can be captured at all. If the bridge hook does not work, everything
above it is void.

| # | Phase | Done when |
|---|---|---|
| 1 | Runner + transport hooks + smoke test | Clicking in `aha-survey` prints a real event in the terminal |
| 2 | `decode.mjs` + SDK hook + bridge hook | **A slide-plugin event is captured through zoid** |
| 3 | Action + navigation recording, `session.json`, `signalDetected` | A manual walk produces a schema-valid session |
| 4 | Inventory, `classify.mjs`, profiles, `[s]` sweep, recovery, `--allow-external` | A screen sweeps completely with no data loss |
| 5 | `pair.mjs`, `SKILL.md`, report template | `/aha-check-tracking session.json` produces the markdown report |
| 6 | `marketplace.json`, `plugin.json`, dependency bootstrap | A teammate installs with two commands and runs it |

Unresolved, to be settled during the phase named:

1. Whether `xprops` exists at `addInitScript` time or needs a `defineProperty`
   trap *(phase 2)*.
2. Whether app locale can be forced to `en` externally, and if not, how to
   classify destructive elements in the other 36 locales *(phase 4)*.
3. Which signals each app profile needs beyond the generic set *(phase 4)*.

## Roadmap — phase 7: autopilot

The tester's remaining job is supplying intent: walking the feature and pressing
`s`. An optional mode removes it:

```
$ node record.mjs <url> --auto "create a survey, add 3 questions, publish, view results"
```

An LLM driver reads each screen and decides the next step, pausing at each screen
for the normal sweep. Everything below the driver — capture, inventory, sweep,
pairing, report — is unchanged. Autopilot is a steering wheel on this engine, not
a different vehicle.

Deliberately deferred, and deliberately opt-in when it lands:

- **Non-deterministic coverage.** Two runs of the same command may walk different
  paths. For a QA evidence tool that is a serious property, and it argues for
  recording the driver's chosen steps so a run can be repeated exactly.
- **Cost and latency.** One LLM call per navigation step versus one per session.
- **Failure mode.** A stuck or misrouted driver can report a completed run that
  never reached the feature. The manual mode has no such failure.

Building it after phases 1–6 means the engine is proven first, and the tester has
a working tool while the driver is developed.
