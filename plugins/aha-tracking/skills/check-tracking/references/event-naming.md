# Event naming — what the checker can and cannot judge

## Slide plugins derive names automatically

`packages/ui/src/tracking.ts` builds the name as
`<action>_<objectName>_<otherInfo>`, snake_cased, per the
[2024 naming guideline](https://ahaslides.atlassian.net/wiki/spaces/AT/pages/826834947/Event+Tracking+-+Naming+Guideline+2024).

Two fallbacks are outright defects, and the recorder flags both mechanically:

| Fallback | Constant | Means |
|---|---|---|
| `..._anonymous` | `ANONYMOUS_ELEMENT` | the element has no `name` attribute, no named descendant, and no component name |
| `undefined_action` | `EVENT_ACTIONS` miss | the DOM event is outside the supported set |

Neither needs judgement — `pair.mjs` finds them with `String.includes`.

Slide-plugin events never reach the network from the plugin's own frame: the
directive calls `window.xprops.trackGA4AndMixpanel(...)` across a zoid
postMessage bridge, and the host app sends them. The recorder hooks that bridge
directly, which is why such events appear with `via: "bridge"` and a `frame`
that is not `top`.

## aha-survey uses an explicit catalog

`frontend/src/analytics/events.ts` maps a symbol to a wire name, and
`mixpanelClient.ts` prepends `survey.`. So `dashboard.viewed` arrives as
`survey.dashboard.viewed`.

## What the LLM judges

Only what strings cannot:

1. **Does the name describe the action?** Clicking *Delete* and seeing
   `click_publish_button` is wrong in a way no comparison catches.
2. **Are the props plausible?** A missing `survey_id` on a survey-scoped event;
   a user email or other personal data in a payload; a value contradicting the
   action.

## What the LLM must NOT do

- Do not judge conformance to the naming guideline. Report the observed name.
- Do not infer that an unexercised element lacks tracking. ⚠️ is not ❌.
- Do not claim the event reached Mixpanel. The recorder proves it was *sent*.
- Do not re-derive the mechanical flags. `pair.mjs` already found them.
