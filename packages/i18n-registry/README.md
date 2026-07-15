# `@aha/i18n-registry`

> Published as `@ahaslides-product/plugins-i18n-registry`

The canonical registry of **which languages AhaSlides has** and **what each
locale code means**.

This package is **data**. It has no runtime dependencies, no i18n library, and
no translated strings. It does not load, format, or render anything. It answers
exactly two questions:

1. Which languages exist?
2. Given a locale code from any AhaSlides app, which language is that — and what
   does every other app call it?

## Why it exists

AhaSlides has no central translation mechanism. Five apps each ship their own
locale files in their own format and **hand-mirror the presenter's language
list**:

| App                   | Where its list lives                              |
| --------------------- | ------------------------------------------------- |
| `stpancras-presenter-app` | `src/utils/language/index.js` (`messages`)     |
| `stpancras-audience-app`  | `src/utils/language/index.js` (`messages`)     |
| `aha-report`              | `src/utils/language.ts` (`loaders`)            |
| `aha-survey`              | `frontend/src/i18n/localeMapping.ts` (`SUPPORTED`) |
| `aha-team-management`     | `packages/frontend/src/i18n/index.ts` (`supportedLngs`) |

A hand-mirrored list drifts, and it already has. As of 2026-07-15:

- **Azerbaijani (`az`)** was added to the presenter and audience apps. `aha-report`,
  `aha-survey` and `aha-team-management` never got it — they silently render
  English for an Azerbaijani session.
- **Swedish** is missing from `aha-survey` entirely.
- `aha-team-management`'s comment says it "mirrors the presenter's locale set
  verbatim" — it does not: it lacks `az` and carries a `bs` (Bosnian) that no
  other app has.
- `aha-report` carries a `zh-tw` that no other app has.

Nothing catches any of this, because there is no shared declaration to check
against. This package is that declaration.

## The rule

> **Adding a language starts here.**
>
> A new language is added to this registry **first**, in the same PR or ahead of
> the app work. An app must never gain a language that the registry does not
> know about. If you are editing an app's locale list and this package does not
> already have that language, stop and add it here.

The same goes for changing what a code means, adding an alias, or discovering
that an app uses a code nobody documented.

## Usage

```ts
import { resolveCode, codeForApp, canonicalCodes, LANGUAGES } from '@aha/i18n-registry';

resolveCode('kr');              // 'ko'   — the presenter's non-ISO code for Korean
resolveCode('si');              // 'sl'   — a legacy Slovenian alias
resolveCode('sr-latn');         // 'sr-Latn' — case-insensitive
resolveCode('xx');              // undefined — never a silent 'en'

codeForApp('ko', 'presenter');  // 'kr'   — what the presenter expects
codeForApp('kr', 'survey');     // 'ko'   — translate straight between two apps
codeForApp('az', 'survey');     // null   — the survey has no Azerbaijani

canonicalCodes().length;        // 33
```

`resolveCode` returns `undefined` — not `'en'` — for an unknown code, so
"unknown language" stays distinguishable from "actually English". Apply your own
fallback: `resolveCode(x) ?? 'en'`.

## What canonical means, and why these codes

The canonical code is **ISO 639-1, with a BCP-47 script subtag where a script
distinction exists**. It is deliberately *not* "whatever the presenter uses".

Four of the presenter's codes are not merely unconventional — they are the codes
of **different, real languages**:

| Language  | Canonical | Apps use  | The problem with the app code            |
| --------- | --------- | --------- | ---------------------------------------- |
| Korean    | `ko`      | `kr`      | `kr` is the ISO **country** code for South Korea, not a language |
| Swedish   | `sv`      | `se`      | `se` is ISO 639-1 for **Northern Sami**  |
| Slovenian | `sl`      | `si`      | `si` is ISO 639-1 for **Sinhala**        |
| Portuguese| `pt`      | `br`      | `br` is ISO 639-1 for **Breton**         |

This is not pedantry. `Intl.PluralRules`, `Intl.DateTimeFormat` and i18next all
resolve these codes against the real language — so `kr` silently gets the wrong
plural rules, and `br` gets Breton's. `aha-survey` already migrated to `ko` and
`pt-BR` for exactly this reason, documented in its `localeMapping.ts`.

Choosing correct canonicals costs nothing today: **every code any app currently
uses is recorded as an alias and round-trips**. Nothing has to migrate. The
`apps` field always tells you what each app actually expects, so a consumer
translating registry → app never has to know or care that the app's code is
wrong.

Case is not an alias. `sr-latn` (presenter/audience/report/team) and `sr-Latn`
(survey) are one code; resolution is case-insensitive.

## Known divergences — recorded, not fixed

The registry's job is to make these **visible data** rather than silent bugs. Do
not "clean them up" here.

### `zh` means a different language in two apps

| App       | `zh` loads                            |
| --------- | ------------------------------------- |
| presenter | `AhaSlides_Simplified_Chinese.json`   |
| audience  | `AhaSlides_Traditional_Chinese.json`  |

The audience app ships **no Simplified Chinese file at all**, so this cannot be
corrected by a registry edit. It is a real suspected bug and is **filed
separately**. The registry records each app's actual filename in `files`, so the
divergence is inspectable.

### `pt` is European in one app and Brazilian in another

The presenter serves `AhaSlides_Portuguese.json` (its switcher says
Português/Portugal) and `aha-report` pairs it with antd `pt_PT`. The audience
serves `AhaSlides_Portuguese_BR.json`, and `aha-survey` canonicalises to `pt-BR`
with antd `pt_BR`. Unresolved; see the entry's `notes`.

### Deliberate gaps — leave them alone

- **Albanian** has no antd pack; both consumers fall back to `en_US` built-ins on
  purpose. `antd: 'en_US'` records that intent.
- **Serbian Cyrillic** borrows the Latin-script `sr_RS` pack — the only Serbian
  pack antd has.
- **`sk`** ships as `AhaSlides_Slovakia.json` (presenter) vs
  `AhaSlides_Slovak.json` (audience). Same language, cosmetic filename drift —
  and the reason `files` is per-app.

## `null` means "nobody has chosen one", not "none exists"

`dayjs` and `antd` are `null` for:

- **`az`** — no app has Azerbaijani in `aha-report`/`aha-survey`/`aha-team-management`.
- **`sv`** (`dayjs` only) — `aha-survey` is the sole source of dayjs codes and has
  no Swedish entry.

These were **not guessed**. A wrong locale code here propagates to five apps, so
an unsourced value stays `null` until someone picks it deliberately and records
it. A test enforces that every `null` carries an explanatory `notes`.

## Codes that are not registry languages

`zh-tw` (`aha-report` only) and `bs` (`aha-team-management` only) exist in one
consumer each and in no other app — including the presenter, which is the
authority for the language set. They are therefore not registry languages, and
`resolveCode` returns `undefined` for both. Making them real languages is a
product decision, not a registry edit.

## Adding a language

1. **Read the sources from `origin/staging`**, never a local checkout — the
   clones drift badly (the presenter clone was 381 commits behind when this
   package was written). Do not infer a language from a filename either; read the
   mapping code. `zh` is the cautionary tale.
2. Add the entry to `src/languages.ts` with every field sourced from real app
   code. If a value cannot be sourced, use `null` and add a `notes` explaining —
   do not invent it.
3. Run `npm test -w @aha/i18n-registry`. The self-consistency suite checks for
   duplicate canonical codes, colliding aliases, aliases that no app uses,
   round-tripping of every app code, and undocumented `null`s.
4. **Bump `version` in `package.json`.** CI enforces this — see below.
5. Publish via the **Publish Packages** workflow (`workflow_dispatch`).

## The version gate

`.github/workflows/i18n-registry-version-gate.yaml` fails a PR that changes
`packages/i18n-registry/**` without bumping `version`.

It exists because **Publish Packages** swallows a `409 already published` as a
warning and continues. That is correct for its 7-package batch publish — most
packages are unchanged on any given run — but it means a forgotten version bump
publishes **nothing while reporting success**, and five repos' CI would then pass
against a stale language set. The gate closes that hole for this package only; it
does not change the batch-publish behaviour.

## Scripts

```bash
npm run build -w @aha/i18n-registry   # dual CJS + ESM + .d.ts, via tsc
npm test      -w @aha/i18n-registry   # vitest
```
