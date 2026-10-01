# InsureHub SAP Fiori apps

**Status:** 🚧 In progress · **Stack:** SAPUI5 1.148 (Horizon theme) · OData V2 · Fiori elements (List Report / Object Page) · freestyle SAPUI5 (Flexible Column Layout) · MockServer · QUnit

SAP Fiori front ends for the fictional **InsureHub Group** (an insurer plus its microfinance arm, LendHub). Every app runs standalone in the browser against a local **MockServer** that simulates the SAP Gateway OData service, including its business rules, so no SAP system is needed to try them.

| App | Type | What it shows | Status |
|---|---|---|---|
| [`apps/leave-requests`](apps/leave-requests) | Freestyle SAPUI5, Flexible Column Layout | Employees request leave (working-day count, balance check); managers approve or reject through OData function imports; withdraw with MERGE; status tabs with live `$count` | ✅ built, QUnit formatter tests |
| [`apps/loan-applications`](apps/loan-applications) | Fiori elements List Report + Object Page (annotation-driven) | LendHub credit officers triage loan applications: risk band, debt-to-income, instalment schedule; approve/reject actions with credit-policy checks (band D cannot be approved, rejection needs a reason) | 🟡 app built; tests and docs to come |
| `apps/claims-insights` | Analytical (planned) | Claims KPIs by product line and branch | ⏳ not started |

## Run an app

No build step is needed. Any static web server works, because UI5 loads from the SAP CDN:

```bash
cd apps/leave-requests/webapp
npx http-server -p 8080 .        # or: python -m http.server 8080
# open http://localhost:8080/index.html
# unit tests: http://localhost:8080/test/unit/unitTests.qunit.html
```

The service URLs in each `manifest.json` (`/sap/opu/odata/sap/ZHR_LEAVE_SRV/`, `/sap/opu/odata/sap/ZLOAN_APPLICATION_SRV/`) are the Gateway paths a real backend would expose. The MockServer intercepts them locally.

## Data

All people, IDs, phone numbers and employers in `localService/mockdata` are made up. Mock dates move forward in whole weeks from 1 Oct 2026, so the demo always has current requests.

## Still to do

- `claims-insights` app
- `ui5.yaml` + `package.json` (UI5 Tooling), ESLint, Karma/QUnit and OPA5 journeys in CI
- docs: requirements, architecture (Gateway service design, CDS/annotations), test cases, ADRs
