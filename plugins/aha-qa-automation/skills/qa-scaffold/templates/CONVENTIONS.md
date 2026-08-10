# Test conventions — {{REPO_NAME}}

**Audience:** humans and AI agents writing tests under `tests/`.

This is a binding ruleset, and it is this repo's own contract. The `aha-qa-automation`
plugin reads it via `conventions[]` in `.qa-profile.json`; the mechanically checkable
subset is mirrored in that file's `rules` block and enforced by `qa-conventions-lint`.

If you change a rule here, change it in `.qa-profile.json` too, or the linter and the
document will disagree.

---

## 1. Which layer does a test belong to?

Decide this **before** writing anything. Wrong-layer tests are the main reason suites get
slow and flaky.

| Put it here | When |
|---|---|
| **unit** (product repo's own suite) | Pure logic: formatting, validation rules, reducers, calculations. No network. |
| **integration** (product repo's own suite) | A module against a real dependency — DB, queue, another service. |
| **api** (`specs/api`) | Any behaviour observable at the HTTP boundary: CRUD, status codes, auth/permission, payload contract, error shapes. **Go broad here** — these are fast and stable. |
| **e2e** (`specs/e2e`) | Only journeys that cross ≥2 systems, or behaviour that genuinely cannot be seen below the UI: rendering, navigation, cross-tab/session state, drag-and-drop, real file upload. **Keep this narrow.** |

Two rules that keep the pyramid the right way up:

1. **Anything provable at a lower layer stays at the lower layer.** If an API test can
   prove it, do not also prove it through the browser.
2. **A missing lower layer is a gap, not a licence.** If a rule has no unit coverage and
   this repo has no unit suite, record it as a gap recommendation. Do **not** compensate
   with a slow E2E test.

Target shape per feature: roughly one golden-path E2E, N API tests, edge cases pushed down.

---

## 2. Naming

| Item | Rule | Example |
|---|---|---|
| Page Object class | PascalCase + `Page` | `EditorPage`, `DashboardPage` |
| Page Object file | kebab-case + `.page.ts` | `editor.page.ts` |
| API Object class | PascalCase + `Api` | `SurveyApi` |
| Locator getter | **must** start with `get` | `getPublishBtn()`, `getRowById(id)` |
| Action method | verb-led, no `get` prefix | `publish()`, `deleteWithConfirm(id)` |
| Fixture key | camelCase | `homePage`, `api` |
| Test id (DOM) | kebab-case, scoped | `editor-publish-btn` |
| Case id in test title | `{{PREFIX}}-TC01` | matches `.qa-profile.json` `caseIdPattern` |

Every test title carries its case id. That is what lets `qa-design-coverage` check the
design and the code against each other in both directions.

---

## 3. Page Objects

### 3.1 Locators are getter methods, never fields

```ts
// BAD — field
readonly publishBtn: Locator = this.page.getByTestId('editor-publish-btn');

// GOOD — getter method
getPublishBtn(): Locator {
  return this.page.getByTestId('editor-publish-btn');
}
```

A getter can gain scoping or a parent context later without breaking any call site.

### 3.2 Action methods call the getter — never build a locator inline

```ts
// BAD
async clickPublish() { await this.page.getByTestId('editor-publish-btn').click(); }

// GOOD
async clickPublish() { await this.getPublishBtn().click(); }
```

When a testid changes, exactly one line changes.

### 3.3 No `expect()` in a Page Object

Actions do; specs assert. The only exception is a `waitFor*` primitive, where waiting is
the definition of the method (`waitForReady()` may `expect(...).toBeVisible()`).

### 3.4 An action is "what + how"

An action method encapsulates a complete user-recognisable step, including its
intermediate clicks and waits. The spec says *what*, never how.

```ts
async deleteBlockWithConfirm(id: string): Promise<void> {
  await this.getBlockCard(id).click();
  await this.getBlockDeleteBtn(id).click();
  await this.getConfirmDeleteBtn().click();
}
```

### 3.5 Reuse before creating

Before adding a getter or action: grep `pages/` for an equivalent and read the file. Two
names for the same testid is a defect — it doubles the cost of every future selector
change.

Create a new Page Object when the surface has its own route, **or** has >3 locators and is
used by ≥2 specs. A one-off dialog belongs on its parent Page Object.

---

## 4. Specs

### 4.1 No raw locators in a spec

Never write `page.getByTestId(...)`, `page.locator(...)`, `page.getByRole(...)`, or
`page.getByText(...)` in a `*.spec.ts`. Verify:

```bash
grep -nE 'page\.(getByTestId|locator|getByRole|getByText)' your-spec.ts   # must be empty
```

Chaining off a Page Object getter is fine:
`expect(results.getPanel().getByTestId(`card-${id}`))`. If that repeats twice, add a getter.

### 4.2 Shape

```ts
import { test, expect } from '@fixtures/test';
import { EditorPage } from '@pages';

test.describe('Editor — publishing ({{PREFIX}}-TC10..14)', () => {
  test('{{PREFIX}}-TC10: publishing a draft makes it visible to respondents', async ({
    api,
    editorPage,
  }) => {
    // 1. Seed preconditions via the API — never by clicking through the UI.
    const survey = await seedSurvey(api, { status: 'draft' });

    // 2. Drive the UI through Page Object actions only.
    await editorPage.goto(survey.id);
    await editorPage.publish();

    // 3. Assert in the spec.
    await expect(editorPage.getStatusBadge()).toHaveText('Published');
  });
});
```

### 4.3 Set up through the API, verify through the UI

UI setup steps are slow and they make an unrelated failure look like your test's failure.
Seed via `api`, assert via the Page Object.

### 4.4 Isolation

Each test creates its own data and cleans up after itself. No ordering dependencies, no
shared mutable state between tests. A test must pass when run alone with `--grep`.

### 4.5 Waiting

Never `waitForTimeout`. Wait on the condition you actually mean — a locator state, a
response, a URL. Arbitrary sleeps are the single largest source of flake.

### 4.6 Tags

`@smoke` for the minimal signal set, `@regression` for the full suite. Tag in the title:
`test('{{PREFIX}}-TC01: ... @smoke', ...)`.

---

## 5. Before claiming a spec is done

```bash
grep -nE 'page\.(getByTestId|locator|getByRole|getByText)' <spec>   # empty
npx tsc --noEmit                                                     # clean
npx playwright test <spec> --grep "<CASE-ID>" --workers=1            # passes
node <plugin>/scripts/qa-conventions-lint.mjs .qa-profile.json       # PASS
```

A test that has never been run against a real environment is not done, regardless of how
it reads.
