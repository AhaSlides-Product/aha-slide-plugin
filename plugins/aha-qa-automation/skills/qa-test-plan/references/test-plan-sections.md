# Test Plan — the 11 sections (standard)

The single source of truth for Phase 2. The orchestrator skill and the three specialist
agents read this file. A Test Plan is a **strategy** document — it defines who does what,
how, when, with what, and where to stop. It is not a list of test cases (that is Phase 3).

Senior mindset, applied throughout:

| Junior writes a plan that... | Senior writes a plan that... |
|---|---|
| lists what will be tested | defines **why** those things are tested |
| copies a template | is customized to this project's context |
| omits risk | puts risk at the center |
| has no exit criteria | has explicit exit criteria aligned with PM |
| is written and filed | drives a conversation the whole team uses |

The best plan is one the team reads, agrees to, and actually uses — not a pretty doc
sitting in Confluence.

---

## §1 Overview & Objectives  `[orchestrator header + test-strategy-architect]`

Not "test until done." Answer:
- What are we verifying?
- What is the definition of quality for this release?
- Which risks must be reduced before go-live?

Objectives must be concrete and checkable, e.g.:
- All acceptance criteria for the sprint pass.
- No Critical/High bug open at release.
- The core user journey (onboarding -> first value) is stable.

## §2 Scope — In / Out  `[test-strategy-architect]`

A clear boundary. Without it, stakeholder expectation is infinite and QA is overloaded.

| In scope | Out of scope |
|---|---|
| Feature A, B, C | Feature D (defer to v2) |
| Web browser | Mobile app |
| Functional testing | Performance testing |
| Regression of core flows | Full regression |

A senior QA dares to write Out of Scope and aligns it with the PM **before** starting.

## §3 Test Strategy  `[test-strategy-architect]`

The most important section. For each test type, justify **when it applies and why it is
chosen for this project** — do not copy a template.

| Test type | Applies when |
|---|---|
| Smoke | After each new build is deployed |
| Functional | Verify each feature against its AC |
| Integration | Check flows that link modules |
| Regression | Before release; after a hotfix |
| Exploratory | After functional test, to find bugs outside the spec |
| UAT | Business/stakeholder verification |
| Performance | Only if there is an NFR on load/speed |

## §4 Entry & Exit Criteria  `[quality-gates-designer]`

**Entry — conditions to START testing:**
- Build deployed to the test environment.
- Smoke test pass > 90%.
- Test data prepared.
- Requirements/AC signed off.
- Test cases reviewed.

**Exit — conditions to STOP testing / approve release:**
- Test execution >= 95%.
- Pass rate >= 90%.
- No Critical/High bug open.
- Medium bugs accepted by PM or with a workaround.
- Regression of core flows passes 100%.

Without exit criteria, no one knows when it is "good enough to ship" — which causes
conflict with Dev/PM. Tune thresholds to the project and state them explicitly.

## §5 Test Schedule & Milestones  `[risk-resource-planner]` *(release mode; optional in sprint)*

Example shape:
- Test design: 2 days
- Test execution: 5 days
- Bug fix & retest: 2 days
- Release sign-off: 1 day

## §6 Resource Plan — People, Tools, Environment  `[risk-resource-planner]` *(release mode)*

- **People:** QA Lead (plan/review/reporting), QA engineers per feature, Dev support with
  a fix SLA.
- **Environment:** staging clone of production; seeded DB; mock/sandbox third-party.
- **Tools:** e.g. Jira, TestRail, Postman, BrowserStack.

## §7 Risk & Mitigation  `[risk-resource-planner]`

This is **delivery/process risk** — distinct from Phase 1 product risk. Pull Phase 1's
product risk register forward to decide where to focus testing (risk-based testing).

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Requirement changes late | High | High | Freeze requirement after sprint planning |
| Unstable environment | Medium | High | Backup env, alert monitoring |
| Missing test data | Medium | Medium | Prepare seed-data script early |
| Timeline cut | High | High | Prioritize test cases risk-based |
| Dev delay | Medium | High | Define buffer, adjust scope |

Risk-based testing — focusing resources where risk is highest — is the mark of a senior QA.

## §8 Defect Management  `[quality-gates-designer]`

Flow: find bug -> log in Jira (title, steps, actual, expected, severity) -> assign to Dev
-> Dev fixes, notifies QA -> QA retests -> pass closes / fail reopens.

Define explicitly:
- **Severity vs Priority** — and who decides each.
- **SLA** to fix per severity level.
- **Blocker policy** — which bugs block the release.

## §9 Communication & Reporting  `[orchestrator from project profile]` *(release mode)*

| Report | Frequency | Audience | Content |
|---|---|---|---|
| Daily status | Daily | Dev, PM | Executed/Pass/Fail/Blocked today |
| Bug summary | Daily | Dev Lead | New bugs, urgent fixes |
| Test progress | End of sprint | Stakeholders | Coverage %, remaining risk |
| Release sign-off | Before release | PM, Lead Dev | Go/No-go decision |

## §10 Assumptions & Dependencies  `[orchestrator from Phase 1 + interview]`

- **Assumptions:** what the plan assumes is true (requirement frozen after date X, dev done
  by date Y, env stable through the cycle).
- **Dependencies:** what the plan waits on (backend API ready by date Z, design assets
  confirmed by UX, feature flag configured correctly).

Pull dependencies from Phase 1's dependency list; add delivery assumptions from the interview.

## §11 Approvals (sign-off)  `[orchestrator]` *(release mode)*

Who signs off the plan: QA Lead, PM, Dev Lead. A row per approver with name and date.

---

## Mode matrix — which sections are mandatory

| Section | sprint-lite | release-full |
|---|---|---|
| 1 Objectives | yes | yes |
| 2 Scope | yes | yes |
| 3 Strategy | yes | yes |
| 4 Entry/Exit | yes | yes |
| 5 Schedule | optional | yes |
| 6 Resource | optional | yes |
| 7 Risk | top risks | full |
| 8 Defect Mgmt | SLA only | full |
| 9 Communication | no | yes |
| 10 Assumptions | brief | yes |
| 11 Approvals | no | yes |

In sprint mode, sections marked "no" are still printed with a one-line "N/A for this
cycle" so the structure stays stable for downstream phases.
