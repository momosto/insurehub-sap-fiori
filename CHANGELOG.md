# Changelog

## 0.1.0 (2026-10-02)

### Added
- **Claims Insights** app: KPI tiles, three charts, branch drill-down, period/product line/branch filters; pure `aggregator.js` with 13 unit tests; mock service `ZCLAIMS_INSIGHTS_SRV` with 180 fictional claims.
- **Fiori launchpad sandbox** with one InsureHub group and intent navigation to all three apps.
- OPA5 journeys: Leave Requests (8), Claims Insights (5), Loan Applications through the launchpad (4).
- Tooling: ESLint 10, static consistency checker, headless test runner, static site build, screenshot tool.
- CI: lint, checks, all tests; GitHub Pages deploy from `main`.
- Documentation: concept, requirements, architecture, security, test strategy, delivery plan, traceability, operations, test cases, four ADRs.

### Fixed
- Leave Requests deep links did not open the detail column (route layout now set in the Component).
- Loan Applications rendered blank: action names now namespace-qualified; annotation alias renamed so UI5 does not rewrite them.
- Loan Applications: credit policy errors now reach the user (Gateway error format with `transition`).
- Mock servers restart cleanly between test journeys.

### Changed
- Mock data: realistic phone numbers, national IDs and real employer names replaced with fictional values.

## 0.0.1 (2026-10-01)
- Leave Requests (freestyle) and Loan Applications (Fiori elements) with mock services.
