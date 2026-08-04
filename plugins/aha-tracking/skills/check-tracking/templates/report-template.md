# Tracking check — {{feature}}

**Session**: `{{sessionPath}}`
**Recorded**: {{startedAt}} → {{endedAt}}
**Hooks armed**: {{hooksArmed}}
**allow-external**: {{allowExternal}}

## Summary

| Screen | Elements | ✅ | ❌ | ⚠️ |
|---|---|---|---|---|
{{summaryRows}}

## Screens

{{screenSections}}

<!--
One section per screen, in this shape:

### ① /surveys/123/edit

| Element | Class | Verdict | Event | Notes |
|---|---|---|---|---|
| Preview `preview-btn` | safe | ✅ | `survey.editor.preview_clicked` | |
| Duplicate `duplicate-btn` | safe | ❌ | — | clicked automatically, no event fired |
| Send invitations | external | ⚠️ | — | skipped: sends real email. Re-run with --allow-external on a disposable account |

The three verdict buckets must sum to the element count for that screen.
-->

## Transitions

| From → To | Event | Verdict |
|---|---|---|
{{transitionRows}}

## Events with no originating action

These fired without a preceding action inside the pairing window — page views,
timers, retries. Listed for completeness; **not** defects.

{{orphanRows}}

## Notes

{{notes}}
