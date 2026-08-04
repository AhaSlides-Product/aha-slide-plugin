# aha-tracking

Verifies that an AhaSlides feature fires the analytics events it should.

## Install

```
/plugin marketplace add AhaSlides-Product/aha-slide-plugin
/plugin install aha-tracking
```

## Use

```bash
cd <plugin-dir>/skills/check-tracking/recorder
npm install                 # first run on each machine
node record.mjs https://dev01.../dashboard
```

Chrome opens on a dedicated profile (`~/.aha-track-profile`) — log in once and
it persists. Walk the feature, press `s` on each screen to sweep it, `Ctrl+C`
to finish. The session lands in `recorder/sessions/`. Then in Claude Code:

```
/check-tracking recorder/sessions/session-<timestamp>.json
```

Add `--allow-external` **only on a disposable account**: it permits clicking
elements with consequences outside the test account (send email, upgrade).

## What you get

A markdown report listing, per screen, which interactive elements fire a
tracking event (✅), which do not (❌), and which could not be checked (⚠️,
always with a reason and the action needed) — plus a table of screen
transitions, so a funnel step that fires nothing shows up as its own finding.

The three buckets always sum to the screen's element count. A session that
captured no analytics payload at all produces **no findings report**: the tool
exits `signal-not-detected` rather than claiming everything is missing.

## Requirements

- Node ≥ 18, Chrome installed, and a **local display**. Not usable under
  `claude.ai/code`, over SSH, or from a background agent.
- Per machine, not per account: the Chrome profile login, `node_modules`, and
  the written sessions.

## How it works

The recorder injects one script into every frame that wraps
`navigator.sendBeacon`, `fetch`, `XMLHttpRequest.send`, `mixpanel.track`, and
`xprops.trackGA4AndMixpanel`. Hooking the send path rather than the console
means it works on production, where debug logging is off, and inside
slide-plugin iframes, where tracking crosses a zoid postMessage bridge and
never becomes a network request in its own frame.

Everything except the final naming and props judgement is deterministic code:
enumeration, classification, clicking, state recovery, action↔event pairing,
and the mechanical defect checks (`no-event`, `duplicate`, `anonymous-name`,
`undefined-action`, `empty-props`).

### Safety

Destructive elements are clicked **last**, never skipped — on a disposable
account the risk is sequencing, not data loss: clicking Delete first would
strand every remaining element on the screen. Elements with consequences
outside the account are skipped unless you opt in. Native `confirm()` dialogs
are dismissed and logged, so they neither block the run nor pass silently.

## Per-app profiles

Classification uses framework danger markers (`.ant-btn-dangerous`) and
`data-testid` keywords before it looks at visible text — aha-survey alone ships
37 locales, so a Delete button rendered in Japanese matches no English keyword.
If an app's test ids do not follow that vocabulary, add
`recorder/profiles/<app>.json` and run with `AHA_TRACK_PROFILE=<app>`:

```json
{
  "name": "myapp",
  "external": { "testIds": ["notify-"], "selectors": [] },
  "destructive": { "testIds": ["wipe-"], "selectors": [".danger-zone"] }
}
```

## Tests

```bash
cd skills/check-tracking/recorder && node --test test/
```

The browser tests need Chrome; they skip when it is absent.
