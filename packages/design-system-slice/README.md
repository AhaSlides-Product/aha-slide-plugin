# @aha/design-system-slice

**Phase-1 spike.** A working, reviewable proof of the AhaSlides agent-facing design-system
pipeline for **one** component — Button. Depth on Button, not breadth.

The thesis it demonstrates: **change the contract once, and both framework wrappers and the docs
are kept honest automatically. Drift is a failing test, not silent divergence.**

React and Vue cannot share component source (two different Ant Design major lines), so the single
source of truth is a shared **contract + tokens**, and each framework's Button is a thin
**projection** of that contract — an Ant Design wrapper themed by `@aha/design` tokens and validated
back against the same contract.

## 2a: primitives are Lit web components

The permanent architecture (Brian's pick, **2a**) is that a shared design-system **primitive**
is one framework-agnostic **Web Component**, not a pair of per-framework wrappers. antd is
React-only, so an antd primitive forces a second, separately-maintained Vue wrapper — and two
wrappers of one primitive can always drift. Instead the primitive is a single compiled element,
themed by `@aha/design` tokens, that **every** repo imports unchanged whatever its framework.

Button proves it. `src/web-components/aha-button.ts` is a Lit `LitElement` registered as
`<aha-button>`. It honours the *same* `button.contract.json` vocabulary (`variant`/`size`/`state`/
`danger`/`block`, an `icon` slot, a default label slot, a click event), reflected to attributes and
styled entirely from `@aha/design` token **values** — no hardcoded hex or px for a themable value,
so one `@aha/design` change re-themes it. The `state` enum reuses the contract's own
`disabled`/`loading` expansion, so the element cannot drift from the source of truth.

The identical element is imported by both frameworks — no wrapper per framework:

- `src/web-components/react-consumer.tsx` — registers the element and uses
  `<aha-button variant="primary">…</aha-button>` in JSX (with the intrinsic-element typing React
  needs).
- `src/web-components/vue-consumer.vue` — the same `<aha-button variant="primary">…` in a Vue SFC.

`test/webcomponent.conformance.test.ts` reads `button.contract.json` and asserts `<aha-button>`
honours every attribute, the state expansion, the slots, the click behaviour, and that the
`@aha/design` token values are actually applied.

The **antd** React and Vue wrappers (`src/react/Button.tsx`, `src/vue/Button.vue`) remain as the
**composite / legacy** path for cases still built on Ant Design; the contract stays the single
source of truth for both paths. The generated agent feed (`generated/`) now advertises
`<aha-button>` as the primitive tier.

## The pipeline

```
                       contract/button.contract.json   ← single source of truth
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                             ▼
  src/react/Button.tsx        src/vue/Button.vue          scripts/generate-docs.mjs
  (antd v6, React 18/19)     (ant-design-vue v4)                  │
        │                            │                             ▼
        ▼                            ▼                    generated/  Button.md
  test/react.conformance     test/vue.conformance          button.llms.txt
        └──────────── both read the SAME contract ────────  button.agent.json
```

All three wrappers/docs consume design tokens **live** from `@aha/design` — nothing is restated,
so the palette cannot drift from source.

## File map

| Path | Role |
| --- | --- |
| `contract/button.contract.json` | **The contract** — Button's props, allowed values, state→prop projection, and the `@aha/design` tokens each prop binds to. |
| `src/tokens.ts` | Bridges `@aha/design` tokens into the antd theme object both tiers use. |
| `src/contract.ts` | Typed loader for the contract + the `state`→`{disabled,loading}` expansion. |
| `src/react/Button.tsx` | **React tier** — wraps `antd` v6 Button, themed via `ConfigProvider`. |
| `src/vue/Button.vue` | **Vue tier** — wraps `ant-design-vue` v4 Button, same tokens. |
| `test/react.conformance.test.tsx` | Reads the contract, asserts the React wrapper honours every prop/variant/size/state. |
| `test/vue.conformance.test.ts` | Same, for the Vue wrapper. |
| `test/generator.test.ts` | Asserts the generator runs and carries live `@aha/design` tokens. |
| `scripts/generate-docs.mjs` | **The generator** — reads the contract, emits the docs/agent feed. |
| `generated/` | Generator output (checked in as proof). Never hand-edit. |

## One command

```bash
npm run check -w @aha/design-system-slice   # regenerate docs + run all conformance tests
```

Or individually:

```bash
npm run generate -w @aha/design-system-slice   # rebuild generated/ from the contract
npm run test     -w @aha/design-system-slice   # React + Vue conformance + generator tests
```

To see drift become a red test: add a value to `variant` in the contract that the wrappers do not
support, and the conformance tests fail.

## Scope (deliberately open)

This is a spike for review, **not for merge or publish**. It does **not** settle the permanent repo
home, the package name, the versioning scheme, or hosting — those remain open product decisions.
It does not modify the public API of any existing package; it only reads `@aha/design` tokens.
