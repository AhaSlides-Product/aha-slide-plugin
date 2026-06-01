# Host-renderable bottom actions (AHA-43142)

## Problem

The ideaBoard slide renders its presenter-flow buttons (**Summarise**, **Previous**,
**Show/Hide votes**, **Next: Vote**, **Next: Result**) inside its own canvas iframe, in
`frontend/src/components/canvas/ActionButtonGroup.vue`. The host presenter app has no
knowledge of these actions, so it cannot render them in a unified host toolbar or
surface them outside the iframe.

We want a generic, reusable contract by which any slide plugin can **declare** the
action buttons it currently offers, and the host can **invoke** one. ideaBoard is the
first consumer.

## Scope

- **In scope:** the slide side of the contract — the shared types/props in
  `@aha/ui` + `@aha/ui-vanilla`, and ideaBoard declaring its actions / receiving
  invocations.
- **Out of scope:** the host implementation that renders the toolbar and calls the
  new props. The host lives in a separate repo (`aha-app-all-in-one`,
  `stpancras-presenter-app`) and is not changed here.

## Approach

Progressive enhancement with a declarative action array. Mirrors the existing
`setSubmissionCount` (slide→host push) and `onKeyboard` (host→slide callback)
patterns already in the Zoid presenter contract.

The slide keeps rendering its in-canvas buttons. It additionally pushes a
`PluginAction[]` to the host whenever the set changes, and listens for the host to
invoke an action by id. Until a host wires the new props, the calls are no-ops and
behavior is unchanged.

**Avoiding duplicate buttons — the child decides, by capability alone.** When the
host supports the contract it renders these actions in its own bar (center while
presenting, a dedicated editor bar otherwise), so the slide must hide its in-canvas
copy. Rather than add a new host→slide signal, the slide keys off the mere presence
of the `setActionButtons` function in `xprops`: the hide rule is simply
`!!setActionButtons`. Against an older host without the contract the prop is absent
and the in-canvas buttons render as before.

For this to be correct, the host must only *provide* `setActionButtons` when it can
actually render the actions — i.e. when its new-control-bar feature flag
(`AHA-41850-presenting-control-and-status-panels`) is on. The host gates the prop's
provision on that flag, so its presence in `xprops` means exactly "the host will
render these." A flag-off (or older) host omits the prop, and the slide falls back to
its in-canvas buttons instead of hiding them with nowhere to go. No new contract
field is needed, and the rule holds in both editor and presenting modes.

## Contract

### `packages/ui-vanilla/src/zoid/presenter.ts`

New exported type:

```ts
export interface PluginAction {
  id: string;                    // "next-vote" | "previous" | "toggle-votes" | "summarise" | "next-result"
  label: string;                 // already-translated by the slide
  variant?: 'primary' | 'default';
  icon?: string;                 // host-known icon key (optional)
  disabled?: boolean;
  loading?: boolean;
  shortcut?: string;             // "Enter" | "Shift+Enter" | "M" | "V" — for the host's kbd hint
}
```

Two new optional members on `SlidePluginProps` and matching entries in
`presenterZoidProps` (`type: 'function', required: false`):

- `setActionButtons?: (actions: PluginAction[]) => void` — slide→host push.
- `onActionInvoke?: (callback: (actionId: string) => void) => void` — host→slide callback.

### `packages/ui/src/zoid/presenter.ts`

- Re-export `PluginAction`.
- Add `setActionButtons` and `onActionInvoke` to `PresenterPluginReturn`
  (both `| undefined`).
- Pass both straight through from `xprops` in `usePresenterPlugin()`. No logic.

### `apps/ideaBoard` — `frontend/src/components/canvas/ActionButtonGroup.vue`

- Pull `setActionButtons` and `onActionInvoke` from `usePresenterPlugin()`.
- Add a `handlers` map keyed by action id, reusing the existing click handlers
  (`setVoteStep`, `setVotesHidden`, `handleGenerateGroupsUsingAi`).
- Add a `computed<PluginAction[]>` built from the existing `shouldShow*` flags,
  `isVoteButtonDisabled`, and the loading refs. The array order matches the visual
  left→right order.
- `watch(actions, a => setActionButtons?.(a), { immediate: true })`.
- Register `onActionInvoke?.(id => handlers[id]?.())` once on setup.
- `onUnmounted(() => setActionButtons?.([]))` to clear the host toolbar when the
  slide unmounts.
- Add `hostHandlesActions = computed(() => !!setActionButtons)` and gate the
  in-canvas button container on `hasAnyActionButton && !hostHandlesActions`, so the
  slide hides its copy whenever the host supports (and therefore renders) the actions.

## Error handling / edge cases

- All new props are optional; every call site uses `?.` so a host without support
  is a silent no-op.
- An unknown `actionId` from the host resolves to `handlers[id] === undefined` and
  is ignored.
- Action ids are stable strings independent of label/i18n, so the host→slide
  invocation is locale-independent.

## Testing

- Type-check + build both packages and the ideaBoard frontend.
- If a co-located vitest setup exists near `ActionButtonGroup.vue`, add a unit test
  for the action-array builder (correct ids/flags per `voteStep`); otherwise rely on
  type-check + build as verification. Confirm what exists before claiming tests pass.

## Delivery

- Branch `AHA-43142-bottom-actions` off `staging` in both repos.
- PR #1 (parent `aha-slide-plugin`): the `packages/ui` + `packages/ui-vanilla` contract.
- PR #2 (submodule `slide-plugin-idea-board`): the `ActionButtonGroup.vue` wiring;
  PR body notes it depends on PR #1's published `@aha/ui`.
