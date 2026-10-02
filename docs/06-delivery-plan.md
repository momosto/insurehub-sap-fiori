# Delivery plan

**Version:** 0.1.0 · **Date:** 2026-10-02

| Step | Outcome | Status |
|---|---|---|
| 1. Leave Requests | freestyle app, mock service, formatter unit tests | ✅ (Sep 30) |
| 2. Loan Applications | Fiori elements List Report + Object Page, annotations, mock with credit rules | ✅ (Sep 30) |
| 3. Repository and tooling | git, npm, ESLint, static checker, headless test runner | ✅ (Oct 2) |
| 4. OPA5 journeys | leave (8), loans in the launchpad (4) | ✅; found 3 defects (see traceability) |
| 5. Claims Insights | analytical app, aggregator, 13 unit tests, 5 journeys | ✅ |
| 6. Launchpad sandbox | one group, three tiles, intent navigation | ✅ |
| 7. CI/CD | lint, checks, tests, GitHub Pages deploy | ✅ |
| 8. Documentation | concept, requirements, architecture, security, tests, operations, ADRs, test cases | ✅ |
| Next | UI5 Tooling build (`ui5.yaml`, Component-preload), OPA for leave creation on phone layout, visual regression, OData V4 / RAP variant of Loan Applications | backlog |

## Definition of done

Code in git; lint and static checks clean; unit and OPA5 tests green in CI; screenshots and docs updated; traceability row for every requirement.
