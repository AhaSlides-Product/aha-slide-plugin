# tests — Playwright API + E2E suite

Scaffolded by `aha-qa-automation:qa-scaffold`. The binding ruleset is
[`CONVENTIONS.md`](./CONVENTIONS.md); the machine-readable version the QA skills read is
[`.qa-profile.json`](./.qa-profile.json).

## Setup

```bash
cd tests
npm install
npm run install:browsers
cp .env.example .env      # then fill it in
```

## Run

```bash
npm test                      # everything
npm run test:api              # API layer only — fast, safe on every PR
npm run test:e2e              # browser layer
npm run test:smoke            # @smoke tagged subset
npx playwright test specs/e2e/foo.spec.ts --grep "XX-TC01" --workers=1   # one case
TEST_ENV=canary npm test      # against another environment
```

## Layout

| Directory | Holds | Never holds |
|---|---|---|
| `specs/api`, `specs/e2e` | tests | locators |
| `pages/` | UI Page Objects — locators + actions | assertions |
| `objects/api/` | API request wrappers | assertions |
| `fixtures/` | the composed `test`, factories, payloads | product logic |
| `helpers/` | reusable business logic | locators |
| `config/` | environments, constants | |
| `docs/test-design/` | committed test-case designs | |

Dependency direction is one-way: `spec → fixture/helper → page object / api object → playwright`.
