---
name: qa-impl-objects
description: Sub-stage 2 of qa-implement — creates or extends the Page Objects, API Objects and fixtures the resolution map requires, at the paths and in the style the repo's own conventions declare. Dispatched by qa-implement; not usually invoked directly.
---

# Sub-stage 5.2 — Page Objects & API Objects

## Purpose

Make every element and endpoint from the resolution map reachable through the repo's object
layer, so the spec written in sub-stage 3 contains no locators at all.

## Inputs

- The resolution map from sub-stage 1
- `.qa-profile.json` — `paths.pages`, `paths.apiObjects`, `paths.fixtures`, `rules`
- The repo's `conventions[]` documents

## The rule that governs everything here

**Write in the style of the file you are editing.** Read an existing page object in this
repo before writing a new one, and match it: its import style, whether it uses classes or
factory functions, its language (JS vs TS), its method ordering, its comment density.

The canonical style from `qa-scaffold` applies to scaffolded repos only. In longbien you
write longbien's style; in aha-survey you write aha-survey's. The profile's `rules` tell
you which conventions are mechanically enforced here, and `conventions[]` tells you the
rest.

## Process

### 1. Extend before creating

For every `REUSE` entry in the map, do nothing — it already exists.

For every `NEW` entry, decide where it belongs:

- An existing Page Object owns this surface → **add the getter there**.
- A genuinely new surface → create a new Page Object, following the repo's naming rules
  (`rules.pageObjectFileSuffix`, `rules.pageObjectClassSuffix`).

Create a new Page Object only when the surface has its own route, **or** has more than
three locators and is used by at least two specs. A one-off dialog gets a getter on its
parent object. More small page objects than surfaces is its own maintenance problem.

### 2. Write getters

One getter per element, named per `rules.locatorGetterPrefix`. Templated getters take the
runtime value as a parameter:

```ts
getRowById(id: string): Locator {
  return this.page.getByTestId(`row-${id}`);
}
```

### 3. Write action methods

An action encapsulates a complete user-recognisable step, including its intermediate clicks
and waits, and **calls the getters** — never builds a locator inline.

No `expect()` in an action when `rules.noExpectInPageObjects` is set. `waitFor*` primitives
are the exception: there, waiting is the method's definition.

### 4. Write API Objects

One class per resource under `paths.apiObjects` (skip if the profile has it `null` — that
repo puts API calls in helpers instead; follow that).

API Objects return the response and parsed body. **They do not assert** — status-code
assertions belong in the spec, so one object serves both the happy path and the 4xx cases.

### 5. Wire fixtures

Register new Page Objects in the repo's fixture composition file (whatever the profile's
`paths.fixtures` says — `fixtures/test.ts`, `fixtures/customTest.js`, …) and in the barrel
export if the repo has one. A page object that specs cannot import is not finished.

### 6. Add seed helpers

Preconditions the design needs get a helper under `paths.helpers` that seeds them via API.
Helpers contain no locators and no assertions.

## Validation — `qa-impl-objects-checker`

Mechanical gate first:

```bash
node <plugin>/scripts/qa-conventions-lint.mjs <testRoot>/.qa-profile.json --only <changed files>
<commands.typecheck>
```

Then the checker's rules:

| # | Rule |
|---|---|
| O1 | Every NEW entry in the resolution map now exists; every REUSE entry was left alone. |
| O2 | **No duplicate getter** — no two methods in `paths.pages` resolve to the same selector, under any name. This is the highest-value check in this sub-stage. |
| O3 | Naming matches the repo's rules: getter prefix, file suffix, class suffix. |
| O4 | No action method builds a locator inline; every one calls a getter. |
| O5 | No `expect()` in a Page Object outside a `waitFor*` method, when the repo enforces it. |
| O6 | New objects match the style of the existing ones in this repo — same language, imports, structure. Quote an existing file to compare against. |
| O7 | Every new Page Object is registered in the fixture composition and the barrel export. |
| O8 | API Objects contain no assertions. |
| O9 | Helpers contain no locators. |
| O10 | Typecheck is clean, and the conventions linter passes on the changed files. |

Fix and re-run, up to 3 attempts. Then stop and report.
