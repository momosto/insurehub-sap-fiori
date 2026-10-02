# Test strategy

**Version:** 0.1.0 · **Date:** 2026-10-02

| Level | Tool | What | Where |
|---|---|---|---|
| Static | ESLint 10 (`npm run lint`) | JavaScript errors, strict mode, `===`, no stray globals | every `.js` in apps, launchpad, tools |
| Static | `tools/check-apps.mjs` (`npm run check`) | manifests parse; app IDs match index and launchpad; every i18n key used exists and none is unused; XML well-formed; annotation targets and actions point at real metadata; annotation alias cannot corrupt qualified names; mock data matches metadata | all apps |
| Unit | QUnit 2 | pure logic: working days, UTC dates, status mapping (leave); filtering, KPIs, grouping, monthly series, status mix, number formats and thresholds (claims) | `test/unit/` |
| Integration | OPA5 | user journeys through real views, routing, dialogs and the MockServer, including deep links and error paths. Loan Applications journeys drive the **real launchpad** in a frame, because Fiori elements V2 needs shell services | `test/integration/` |
| Visual | `tools/screenshot.cjs` | screenshots of each app in the launchpad for the README and review | `docs/img/` |

## Principles

- **Deterministic data.** Mock dates normally move with the calendar so the demo always looks current. Tests that check numbers (Claims Insights) start the mock without shifting and give the app a fixed "today" through `componentData`.
- **Business rules tested where users meet them.** The band D policy and "reject needs a reason" are checked through the UI, not only in the mock.
- **Each journey starts clean.** The startup arrangement tears down a component or frame left over by a failed journey, so one failure does not cascade.
- **Same command locally and in CI.** `npm test` serves the repo and runs every page in headless Chrome through ui5-test-runner. CI uploads the HTML report with screenshots of failures.

## Gates (CI)

`check` (lint + static checks) and `test` (all QUnit + OPA5 pages) must pass before `pages` deploys from `main`.

## Not covered yet

- Visual regression (pixel diffs). Screenshots are taken but not compared.
- Accessibility audit with a screen reader. The apps rely on standard controls; no manual audit has been done.
- Backend tests. There is no backend in this repo; [03-architecture.md](03-architecture.md) defines the contract a backend's tests would use.
