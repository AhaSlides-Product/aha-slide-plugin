# aha-qa-automation

A portable QA test pipeline for any AhaSlides repo. Audit what a repo already has, scaffold
a canonical Playwright layer where there is none, design test cases with explicit layer
assignment, then implement API/E2E specs that conform to **that repo's own conventions**.

Start with `/qa-testkit` if you are not sure which stage you need.

## Why this exists

Four repos, four different test layouts, and every new repo started the prompting from
scratch:

| Repo | Layout | Language | Case ids |
|---|---|---|---|
| `longbien-automation-test` | standalone QA repo, `objects/pages` | JS | `AHA-T3015` |
| `aha-survey` | `tests/` package, `tests/pages` | TS | `AHA-43247-AC01` |
| `aha-slide-plugin` | `tests/` package, `tests/pages` | TS | none |
| `workspace-app` | no Playwright at all | TS | — |

Rather than migrate all four onto one layout, each repo gets a small
**`.qa-profile.json`** that declares its paths, commands, conventions and enforced rules.
Skill bodies contain zero hardcoded paths. **One skill body, N profiles.**

## The pipeline

Every stage is paired with a validator that can **fail it back** — not a validator that
prints an opinion. Max 3 rounds, then it stops and reports honestly.

| # | Skill | Produces | Validator |
|---|---|---|---|
| 0 | `qa-repo-audit` | `.qa-profile.json` + `qa-audit.md` | `qa-profile-validate.mjs` + `qa-audit-verifier` |
| 1 | `qa-scaffold` | canonical `tests/` tree (greenfield only) | 4 commands + `qa-scaffold-verifier` |
| 2 | `qa-requirement-analysis` | risks, test conditions, clarifications | `qa-requirement-verifier` |
| 3 | `qa-test-plan` | scope, strategy, entry/exit gates | `test-plan-verifier` |
| 4 | `qa-design-cases` | cases, each stamped with a layer | `testcase-verifier` |
| 5 | `qa-implement` | page objects → specs, green | 3 sub-stage checkers + 4 commands |
| 6 | `qa-triage` | classified failures + fixes | `qa-impl-specs-checker` |

Stages 2–4 are the design phase. Stage 5 refuses to run without a **committed** design
document — that is what makes the both-directions coverage check possible.

Stage 5 is decomposed further, because writing specs before the objects exist is what
produces inline locators:

```
qa-impl-research  -> selector/endpoint map    [qa-impl-research-checker]
qa-impl-objects   -> page objects, api objects [qa-impl-objects-checker]
qa-impl-specs     -> specs, run green          [qa-impl-specs-checker]
```

## Scope policy

- **New repos** get the canonical structure (`qa-scaffold`).
- **Existing repos are never migrated.** The pipeline reads their `conventions[]` and obeys
  them, even where they contradict this plugin's defaults.
- **Unit and integration tests are audited, never authored here.** The inventory exists so
  stage 4 can push a case *down* to a layer that already exists instead of proving it
  through a 40-second browser test.
- **API broad, E2E narrow.** Go wide at the HTTP boundary — those tests are fast and stable.
  Reserve E2E for journeys crossing ≥2 systems. Roughly one golden path per feature.
- **A missing lower layer is a gap, not a licence.** If a case belongs at `unit` and the
  repo owns no unit suite, it is recorded as a recommendation — never promoted to E2E to
  make a coverage report green.

## Validator scripts

Zero-dependency Node ESM; run them directly in CI.

```bash
node scripts/qa-profile-validate.mjs  <testRoot>/.qa-profile.json [--run-commands]
node scripts/qa-conventions-lint.mjs  <testRoot>/.qa-profile.json [--only <file> ...]
node scripts/qa-design-coverage.mjs   <testRoot>/.qa-profile.json <design-doc.md> [...]
```

- **`qa-profile-validate`** — shape, every declared path exists, every declared command
  executes, `caseIdPattern` compiles and is not `.*`.
- **`qa-conventions-lint`** — enforces the profile's `rules` block. Every rule is opt-in per
  repo; an absent or `false` rule is not checked. `waitFor*` methods are exempt from
  `noExpectInPageObjects`.
- **`qa-design-coverage`** — designed-vs-implemented in **both** directions: `missing`,
  `orphan`, `duplicate`. Cases designed for a lower layer are reported separately and are
  not expected in the Playwright suite.

## Install

```
/plugin marketplace add AhaSlides-Product/aha-slide-plugin
/plugin install aha-qa-automation@ahaslides
```

Then, per repo:

```bash
cp profiles/<repo>.qa-profile.json  <repo>/<testRoot>/.qa-profile.json
# then verify and correct it:
/qa-repo-audit
```

The seeds in `profiles/` are a point-in-time reading, not truth. The audit re-derives every
value — see `profiles/README.md` for why several rules ship as `false`.

## Layout

```
aha-qa-automation/
├── skills/
│   ├── qa-testkit/              router — picks the stage
│   ├── qa-repo-audit/           stage 0
│   ├── qa-scaffold/             stage 1 (+ templates/ = the canonical structure)
│   ├── qa-requirement-analysis/ stage 2
│   ├── qa-test-plan/            stage 3
│   ├── qa-design-cases/         stage 4 (+ references/layer-assignment.md)
│   ├── qa-implement/            stage 5 (+ 3 sub-skills)
│   └── qa-triage/               stage 6
├── agents/                      15 specialist/verifier + 5 checker agents
├── scripts/                     3 zero-dependency validators
├── schemas/qa-profile.schema.json
└── profiles/                    seed profiles for the 4 known repos
```

Stages 2–4 and their 15 agents were ported from `common_QA_workflow`, which lived only in
`~/.claude/skills` on one machine. Publishing them here is most of the point of this plugin.
