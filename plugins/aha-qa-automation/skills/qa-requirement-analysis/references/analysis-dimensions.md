# Requirement Analysis — the 8 dimensions

The single source of truth for Phase 1. The orchestrator skill and all four specialist
agents read this file. Each agent owns a subset of dimensions (noted in `[owner: ...]`);
the orchestrator uses the whole list to sanity-check coverage before writing the output.

A finding under any dimension must turn into at least one concrete artefact:
a **clarification question**, a **test condition**, a **risk row**, or a **gap** entry.
A dimension that produces nothing should say so explicitly ("no ambiguity found"),
never be silently skipped.

---

## 1. Clarity & Ambiguity  `[owner: qa-clarity-analyst]`

- Vague, unquantified words: "fast", "easy to use", "frequently", "many", "some",
  "real-time", "soon". Each must be turned into a number or a definition.
- Who decides when documents conflict? Is the decision owner named?
- Are terms defined consistently? Is the same concept named two different ways,
  or two concepts named the same way?

## 2. Completeness  `[owner: qa-completeness-analyst]`

- Happy path is described — is the **unhappy path**? (errors, rejections, retries)
- Edge cases: `null`, empty, boundary, min/max, very-large input, duplicate, zero.
- Intermediate states: loading, timeout, partial failure, optimistic update rollback.
- Permission / role-based behaviour: is each role's behaviour separated clearly?
- Empty states, first-run states, "no data yet".

## 3. Consistency  `[owner: qa-clarity-analyst]`

- Do requirements contradict each other across sections / tickets / mockups?
- UI mockup ↔ described logic ↔ API spec — do they match (fields, states, copy)?
- Is the business rule stated the same way everywhere it appears?

## 4. Testability  `[owner: qa-quality-analyst]`

- Do the acceptance criteria carry enough detail to write a test case?
- Is the expected result measurable / observable?
- Do non-functional requirements have concrete thresholds (not "should be fast")?

## 5. Business Rules & domain logic  `[owner: qa-logic-analyst]`

- Trigger condition: what exactly activates this rule / feature?
- Exception and bypass cases: are they handled and documented?
- Calculations, formulas, rounding rules: documented precisely (precision, currency,
  tie-breaking, order of operations)?

## 6. Dependencies & Integration  `[owner: qa-logic-analyst]`

- Which other service / module / feature does this depend on?
- Third-party APIs: are error responses, rate limits, and timeouts defined?
- Data flow: where does input come from, where does output go, what format?

## 7. Non-Functional Requirements (NFR)  `[owner: qa-quality-analyst]`

| Type | Question to ask |
|---|---|
| Performance | Load time threshold? Concurrent users? Payload size? |
| Security | Auth, authorization, data masking, PII handling? |
| Accessibility | WCAG level? Screen reader, keyboard nav? |
| Compatibility | Which browser / device / OS matrix? |
| Localization | Timezone, currency, language, RTL, date format? |

## 8. Risk & Impact  `[owner: qa-quality-analyst]`

- How many users / business flows does this feature touch?
- Regression risk: what currently-working behaviour could this change break?
- Which testing area deserves the most focus (priority)?

---

## Likelihood vs Impact (for the risk register)

- **Likelihood** = probability the risk occurs in production (H/M/L).
- **Impact** = blast radius if it does (H/M/L).
- They are independent. A low-likelihood / high-impact row (data loss, security
  incident, public outage) still belongs in the register.
- Mitigations must be concrete actions ("add an idempotency key", "feature-flag the
  rollout", "cover with E2E on a 10k-row fixture") — never "test thoroughly" or
  "be careful".

## Cross-cutting flags

Every analysis records six flags, each `yes` / `no` / `unknown`. When `unknown`,
a matching clarification question must exist so nothing is silently dropped:
`mobile`, `eu` (data residency), `i18n`, `a11y`, `performance`, `l10n`.
