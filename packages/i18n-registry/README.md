# `@aha/i18n-registry`

> Published as `@ahaslides-product/i18n-registry`

The canonical registry of **which languages AhaSlides has** and **what the one
correct code for each is**.

This package is **data**. It has no runtime dependencies, no i18n library, and
no translated strings. It does not load, format, or render anything. It answers
exactly two questions:

1. Which languages exist, and what is the correct code for each?
2. Where does each app currently violate that, and what must it change?

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

- **Azerbaijani (`az`)** reached the presenter and audience apps and stopped.
  `aha-report`, `aha-survey` and `aha-team-management` never got it — they
  silently render English for an Azerbaijani session.
- **Swedish** is missing from `aha-survey` entirely, so a Swedish presenter
  session renders an English survey.
- `aha-team-management`'s comment says it "mirrors the presenter's locale set
  verbatim" — it does not: it lacks `az` and carries a `bs` (Bosnian) that no
  other app has.
- Four languages are coded with **another language's ISO code** (below).
- Two languages — `zh` and `pt` — serve **different content in different apps
  under the same code**.

Nothing catches any of this, because there is no shared declaration to check
against. This package is that declaration.

## Where the 33 languages come from

The set is the presenter's **`messages` map** (`src/utils/language/index.js`) —
the languages it can actually load — **not** its switcher list. The two are not
the same, and the difference is deliberate:

- The `messages` map has **34 keys for 33 languages**: `sl` and `si` both load
  `AhaSlides_Slovenia.json`. `si` is not a 34th language, it is a defect
  (recorded as a `legacy-alias`).
- **Indonesian (`id`), Turkish (`tr`) and Danish (`da`)** are *not* offered in
  the presenter's switcher (`languageOptions` in `src/constant/index.js`), but
  they load fine via `messages` and are allowlisted in `src/constant/locale.js`.
  They are real languages, reachable by a host locale — just not user-selectable
  in that one UI. Deriving the set from the switcher would silently drop all
  three.

## The rule

> **The registry declares ONE standard. The API speaks canonical codes only.**
>
> `resolveCode('kr')` is `undefined`, not `'ko'`. `isKnownCode('kr')` is
> `false`. There is no `codeForApp()`, and a `LanguageEntry` has no `apps`,
> `aliases`, or `files` field. If your code has a locale string that this
> package rejects, the app that produced it is non-compliant — and that is
> recorded, with the fix, in [`NON_COMPLIANCE`](#the-migration-checklist).

> **Adding a language starts here.**
>
> A new language is added to this registry **first**, in the same PR or ahead of
> the app work. An app must never gain a language the registry does not know
> about. If you are editing an app's locale list and this package does not
> already have that language, stop and add it here.

## Why the API is canonical-only

The obvious design is to let the registry speak every app's dialect —
`codeForApp('ko', 'presenter') → 'kr'` — so nothing has to migrate. That was the
first draft of this package, and it is a trap.

A supported canonical↔app mapping **entrenches the drift permanently**. It makes
`kr` a first-class, blessed, forever-supported way to say Korean. Nobody would
ever migrate, because nothing would ever break — and the package sold as the fix
for the divergence would become the thing that guarantees it. A standard that
speaks every dialect is not a standard; it is a dictionary of the problem.

So the API is strict, and the strictness is the mechanism: an integrating app
that passes `kr` gets `undefined` and finds out it has work to do. **That
rejection is the feature.**

### But what about the migration path?

The one real objection to strictness: an app receiving a locale from a
non-migrated host still has to translate `kr` → `ko` somewhere. If the registry
won't, does every app hand-roll its own map — recreating the duplication this
package exists to kill?

No — because the deviation record is **machine-readable data**. Build the shim
from it:

```ts
import { NON_COMPLIANCE, resolveCode } from '@aha/i18n-registry';

// legacy host code -> canonical. Shrinks to {} as apps migrate.
const HOST_SHIM = new Map(
  NON_COMPLIANCE.filter((d) => d.kind === 'wrong-code' || d.kind === 'legacy-alias')
    .filter((d) => d.actual !== null && d.language !== null)
    .map((d) => [(d.actual as string).toLowerCase(), d.language as string]),
);

const canonical = resolveCode(hostCode) ?? HOST_SHIM.get(hostCode.toLowerCase());
// 'kr' -> 'ko',  'se' -> 'sv',  'si' -> 'sl',  'br' -> 'pt',  'ko' -> 'ko'
```

This recipe is **executed by the package's own test suite**, so it cannot rot as
the record changes.

Still one source of truth, still no hand-rolled map — but it is typed as
*temporary*, it shrinks as apps migrate, and nobody writing new code reaches for
it by accident. Keep it at the boundary where untrusted input arrives, never in
shared code.

`aha-survey` already does exactly this, in the one module that reads
`xprops.locale`. Its `si`/`br`/`kr` entries are recorded here as `compat-shim`
deviations — the cleanup that will prove the migration finished.

## What canonical means, and why these codes

The canonical code is **ISO 639-1, with a BCP-47 script subtag where a script
distinction exists**. It is deliberately *not* "whatever the presenter uses".

Four of the apps' codes are not merely unconventional. **All four are the same
mistake** — the ISO 3166-1 **country** code used where an ISO 639-1 **language**
code belongs — and each one is a valid code for a *real, different language*:

| Language  | Canonical | Apps use  | …which is the ISO 639-1 code for |
| --------- | --------- | --------- | -------------------------------- |
| Korean    | `ko`      | `kr`      | **Kanuri** (Nilo-Saharan, Lake Chad basin) |
| Swedish   | `sv`      | `se`      | **Northern Sami** — spoken in northern Sweden, which makes this the most plausible and most wrong |
| Slovenian | `sl`      | `si`      | **Sinhala** (Sri Lanka)          |
| Portuguese| `pt`      | `br`      | **Breton** (Celtic, Brittany)    |

*(Verified against ICU via `Intl.DisplayNames`, not from memory.)*

This is not pedantry. `Intl.PluralRules`, `Intl.DateTimeFormat` and i18next all
resolve these codes against the **real** language — so `kr` silently gets
Kanuri's plural rules and `br` gets Breton's. Nothing throws; it just quietly
misbehaves. `aha-survey` already migrated to `ko` for exactly this reason, and
says so in its `localeMapping.ts`.

### Case is not a dialect

`sr-latn` and `sr-Latn` are the **same tag** — RFC 5646 §2.1.1 makes language-tag
case insignificant. So `resolveCode('sr-latn')` returns `'sr-Latn'`, and that is
not a softening of the rule: rejecting a correctly-spelled tag over casing would
be a bug, not strictness. A *different string* (`kr` vs `ko`) is a different tag
and is rejected. The record files casing as `style` — cosmetic, fix it in
passing.

## The migration checklist

`NON_COMPLIANCE` is the **deliverable**: every way an app violates the standard
today, with the file to edit and what it must become. It is a record of
**defects**, framed as deviations-to-be-fixed — not a supported mapping — and it
should shrink to `[]`.

```ts
import { deviationsForApp, deviationsByKind, NON_COMPLIANCE } from '@aha/i18n-registry';

deviationsForApp('report');        // everything aha-report must fix
deviationsByKind('wrong-code');    // everything mis-rendering in production now
```

Each entry carries `app`, `kind`, `language`, `actual`, `required`, `source`
(repo + file), `detail`, and an optional `blockedBy`. Kinds, in rough triage
order:

| Kind | Meaning |
| ---- | ------- |
| `wrong-code` | The app codes a registry language non-canonically and must migrate. Usually a *different* language's valid ISO code (`kr`, `se`) — silently mis-renders today. Sometimes just a code we don't use (`pt-BR`). |
| `legacy-alias` | The app *additionally* accepts a non-canonical code. Drop it. |
| `compat-shim` | Code that exists only to absorb another app's non-compliance. Delete once `blockedBy` clears. |
| `casing` | Right tag, non-canonical BCP-47 casing. Cosmetic. |
| `missing-language` | No entry for a registry language — silently renders English. |
| `unregistered-language` | Ships a language the registry does not declare. Needs a decision. |
| `filename` | The two CDN apps ship one language under different filenames. |

## Content divergences — the expensive findings

`CONTENT_DIVERGENCES` is kept **separate** from the checklist, because these are
not code-style problems: the same code serves *different material* in different
apps. No registry edit can fix either, and there is no single app at fault —
each needs a product decision first. Filing them as per-app code deviations
would imply someone can just rename a file.

### `zh` serves a different language in different apps

| App       | `zh` serves                                        |
| --------- | -------------------------------------------------- |
| presenter | Simplified (`AhaSlides_Simplified_Chinese.json`)    |
| audience  | **Traditional** (`AhaSlides_Traditional_Chinese.json`) |
| report    | Simplified (`zh.json`) — plus Traditional under a separate `zh-tw` |

A Simplified-Chinese presenter session shows **Traditional Chinese to the
audience**. The audience app ships no Simplified file at all, so this needs a
content fix, not a code change.

The clue to the history: the presenter *has*
`public/languages/AhaSlides_Traditional_Chinese.json`, and it is **orphaned** —
verified on `origin/staging`, the string appears nowhere in the presenter's
`src/`, its `messages` map has no `zh-tw`/`tw` key, and its 34 keys resolve to 33
distinct files. So Traditional Chinese exists in three places and is reachable by
a canonical code **zero** times. Adopting `zh-TW` as a 34th language would give
all three a home — but that is a product call, and it is why the registry
declares 33 rather than quietly picking one.

### `pt` — the code is settled, the dialect is not

Two separate questions hide behind "the Portuguese problem". Keep them apart.

**The code: decided (2026-07).** AhaSlides ships **one** Portuguese, and its code
is **`pt`**. Both of the presenter's language pickers agree, and they are
independent hardcoded lists:

| Picker | Entry | File |
|---|---|---|
| UI language | `{ name: 'Português', language: 'pt', country: 'Portugal' }` | `src/constant/index.js` |
| Presentation language | `{ id: 'pt', title: 'Português' }` | `src/components-v2/presentation-editor/settings-modal/SettingsPresentationLanguageTab.vue` |

Neither offers a Brazilian option, so `pt-BR` never named a second language.
`aha-survey` must rename `pt-BR` → `pt`; that entry is **actionable now**, not
`blockedBy`.

**The dialect: still open.** *Which* Portuguese the content should be is a
product call, and it is a real user-visible bug today — a Portuguese session
renders one thing on the slide and another in the audience view.

The tempting tiebreak, "follow the presenter, it's the source of truth", **does
not work**: the presenter has no single dialect to follow. Measured on
`origin/staging` by counting BR/PT lexical markers in the JSON *values*:

| App | Dialect |
|---|---|
| presenter `AhaSlides_Portuguese.json` | **blend** — `ficheiro` ×34 *and* `arquivo` ×19 (the same word, "file", both ways in one file); `ecrã` ×32 beside `tela` ×10 |
| audience `AhaSlides_Portuguese_BR.json` | Brazilian (zero European markers) |
| `aha-survey` `pt-BR` | Brazilian (zero European markers) |
| `aha-report` `pt.json` | **unclassifiable** — 169 keys, zero markers either way |

So the presenter points European by *label* and both ways by *content*. The two
highest-volume participant-facing surfaces are unambiguously Brazilian — but
that is an inference about where the users are, not a decision about who we
serve.

> **Measuring this yourself:** parse the JSON and scan **values only** — the
> presenter's *keys* are English sentences, so scanning raw file text counts
> English and gives a wrong answer. Never use a marker that is also an English
> word (`time`, Brazilian for "team", collides and poisons the count). `você` is
> weak — European Portuguese uses it too. Reliable pairs: `arquivo`/`ficheiro`,
> `tela`/`ecrã`, `usuário`/`utilizador`, `gerenciar`/`gerir`.

This is also why the `pt` entry carries an apparently inconsistent antd `pt_PT`
with dayjs `pt-br`: those are the only values any app has actually chosen.
**Do not harmonise them** — picking one would silently decide the dialect. They
resolve when the content question does.

### Deliberate gaps — leave them alone

Three entries carry a `dayjs`/`antd` value that looks like a bug and is not. They
are the values the apps actually chose; "fixing" them changes real behaviour.
Each is pinned by a test, so a helpful correction fails the suite rather than
shipping.

- **Albanian (`sq`)** — `antd: 'en_US'`. antd ships **no Albanian pack**, so both
  `aha-report` and `aha-survey` fall back to `en_US` for built-ins (pagination,
  pickers, empty states); strings and dates are still Albanian. The value records
  that intentional fallback — it is not a stray copy-paste.
- **Serbian Cyrillic (`sr-Cyrl`)** — `antd: 'sr_RS'`, the same pack as `sr-Latn`.
  antd has no Cyrillic Serbian pack, so both consumers borrow the **Latin-script**
  one: built-ins render in Latin script while strings and dates are Cyrillic. That
  is the existing, intentional behaviour.
- **Norwegian (`no`)** — `dayjs: 'nb'`, `antd: 'nb_NO'`. `no` is a valid ISO 639-1
  **macrolanguage** code so it stays canonical, but dayjs and antd have no bare
  `no` — both use Bokmål, the standard written form. The pairing is correct.

## `null` means "nobody has chosen one", not "none exists"

`dayjs` and `antd` are `null` for:

- **`az`** — no app has Azerbaijani beyond presenter/audience, so neither a dayjs
  nor an antd code has ever been chosen.
- **`sv`** (`dayjs` only) — `aha-survey` is the sole source of dayjs codes and has
  no Swedish entry.

These were **not guessed**. A wrong locale code here propagates to five apps, so
an unsourced value stays `null` until someone picks it deliberately and records
it.

`null` is never unexplained, and the explanation is **derivable, not prose**: a
value is unsourced exactly when the app the registry sources it *from* does not
have the language — so every `null` is accounted for by a `missing-language`
entry in the checklist naming that app. `aha-survey` is the sole source of
`dayjs` codes; `aha-report` and `aha-survey` are the sources of `antd` packs.
A test enforces that link in both directions, so a `null` can never appear
without the checklist entry that explains it, and adding the language to the app
is what unblocks the value.

## Adding a language

1. **Read the sources from `origin/staging`**, never a local checkout — the
   clones drift badly (the presenter clone was 381 commits behind when this
   package was written). Do not infer a language from a filename either; read the
   mapping code. `zh` is the cautionary tale.
2. Add the entry to `src/languages.ts` with every field sourced from real app
   code. If a value cannot be sourced, use `null` — do not invent it.
   `src/languages.ts` is **data only**: it takes a code, a name, and two pack
   values, and it has no field to write prose in. That is deliberate (see below).
3. If any app is behind on it, add the `missing-language` entries to
   `src/non-compliance.ts` in the same PR. A language nobody has recorded as
   missing is a language nobody will add. This is also what explains any `null`
   you just added — the tests require the two to agree.
4. Run `npm test -w @aha/i18n-registry`. The suite checks duplicate codes, that
   no canonical code collides with another language's ISO code, that every
   checklist entry is complete and points at a real language and a real file,
   and that no `null` is undocumented.
5. **Bump `version` in `package.json`.** CI enforces this — see below.
6. Publish via the **Publish Packages** workflow (`workflow_dispatch`).

## Where prose goes — and why `languages.ts` has none

`LanguageEntry` is `code`, `name`, `dayjs`, `antd`. **There is no `notes` field,
and adding one back is a regression.**

There used to be. It was introduced for a good reason — to stop a reader
"helpfully fixing" a deliberate value — and it did what an open-ended prose field
on a data type always does: it became the path of least resistance for every
finding anyone made. It grew to cover 13 of 33 entries and roughly a quarter of
the file, including a ~20-line essay on the Portuguese dialect question. Every
word of it was a **second or third copy** of something this README or the
checklist already said, and the copies had begun to drift apart. `languages.ts`
is the file every consumer imports; it should read as the data it is.

So each kind of knowledge has exactly one home:

| Knowledge | Home |
| --------- | ---- |
| Which languages exist, and their canonical codes and packs | `src/languages.ts` — data, no prose |
| An app deviates from the standard and must change | `NON_COMPLIANCE` — typed, findable by `app`/`kind`/`language` |
| The same code serves different content in different apps | `CONTENT_DIVERGENCES` — typed, one entry per language |
| Narrative that belongs to no single entry | this README |
| "Do not "fix" this value" | **a test that fails**, plus this README's *Deliberate gaps* |

That last row is the important one, and the reason the field is not needed. A
comment never stopped anybody: a note saying `DO NOT "FIX"` is invisible to the
person who edits the value and runs the suite. A **failing test with the reason
in it** is not. Every deliberate value and every `null` is pinned by an assertion
in `languages.test.ts`, so a helpful correction fails loudly with an explanation
instead of shipping to five apps.

If you have something to say about a language and none of the rows above fit, the
thing you are describing is probably a defect — write it in the checklist.

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
