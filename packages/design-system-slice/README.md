# @aha/design-system-slice

**Phase-1 spike.** A working, reviewable proof of the AhaSlides agent-facing design-system
pipeline for **one** component — Button. Depth on Button, not breadth.

The thesis it demonstrates: **change the contract once, and both framework wrappers and the docs
are kept honest automatically. Drift is a failing test, not silent divergence.**

React and Vue cannot share component source (two different Ant Design major lines), so the single
source of truth is a shared **contract + tokens**, and each framework's Button is a thin
**projection** of that contract — an Ant Design wrapper themed by `@aha/design` tokens and validated
back against the same contract.

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
