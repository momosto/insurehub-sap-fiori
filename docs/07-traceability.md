# Traceability and implementation report

**Version:** 0.1.0 · **Date:** 2026-10-02 · **Build:** lint and static checks clean, 40/40 QUnit + OPA5 tests ([09-test-cases.md](09-test-cases.md))

Status: ✅ built and tested · 🟡 built, tested manually or partly · ⏳ not built (reason given).

## 1. Requirements

| ID | Implementation | Verified by | Status |
|---|---|---|---|
| LR-01 | `List.view.xml` (IconTabBar with `$count` per status), `formatter.status*` | TC-LR-U09/U10, O01, O02 | ✅ |
| LR-02 | `List.controller._getSearchFilters` shared by list and counts | TC-LR-O03 | ✅ |
| LR-03 | `CreateDialog.fragment.xml`, `List.controller._validateCreate`, `formatter.countWorkingDays/toUTCDate` | TC-LR-U01..U08, O07, M01 | 🟡 error messages checked manually |
| LR-04 | `Detail.controller` (function imports `ApproveLeave`/`RejectLeave`), `DecisionDialog` | TC-LR-O04, O05 | ✅ |
| LR-05 | `Detail.controller.onWithdraw` (MERGE `Status: W`) | TC-LR-O06 | ✅ |
| LR-06 | `Component._onBeforeRouteMatched`, `Detail._onBindingChange` → `notFound` | TC-LR-O06, O08 | ✅ |
| LA-01 | `annotations.xml` (`UI.SelectionFields`, `UI.LineItem`, `UI.SelectionVariant#Open/#HighRisk`), manifest `quickVariantSelectionX` | TC-LA-O01 | ✅ |
| LA-02 | `UI.HeaderInfo`, `UI.HeaderFacets`, `UI.DataPoint`s, `UI.Facets` with field groups and `to_Instalments` table | TC-LA-O02, screenshot | ✅ |
| LA-03 | `UI.Identification` + `UI.LineItem` `DataFieldForAction`, `sap:applicable-path="IsDecidable"` | TC-LA-O02 | ✅ |
| LA-04 | `RejectApplication` `Comment` `Nullable="false"` + mock rule | TC-LA-O04 | ✅ |
| LA-05 | mock `decisionHandler` (band D rule) returning a Gateway transition error | TC-LA-O03 | ✅ |
| LA-06 | `sap:filterable="false"` on `NationalID`, `Phone` | TC-LA-M01 | 🟡 manual |
| CI-01 | `aggregator.kpis`, six `GenericTile`s | TC-CI-U03..U05, O01 | ✅ |
| CI-02 | `SegmentedButton` → `aggregator.filter` | TC-CI-U01, O02 | ✅ |
| CI-03 | `Select`s + reset | TC-CI-U02, O03, O05 | ✅ |
| CI-04 | three `VizFrame`s on `byLine`, `monthly`, `statusMix` | TC-CI-U07..U09, O01 | ✅ |
| CI-05 | branch `Table`, `onBranchPress` | TC-CI-U06, O04 | ✅ |
| CI-06 | `formatter.rejectionColor/settleColor/rejectionState` | TC-CI-U12, U13 | ✅ |
| FLP-01 | `launchpad/`, `appconfig/fioriSandboxConfig.json` (group + tiles) | TC-FLP-01 | ✅ |
| FLP-02 | inbounds in `appconfig` and each manifest's `crossNavigation` | TC-FLP-02 | ✅ |

## 2. Non-functional requirements

| Category | Evidence | Status |
|---|---|---|
| Compatibility | `minUI5Version` 1.120 in all manifests; tested on 1.148.11 | ✅ |
| Responsiveness | `deviceTypes` all true; density class by device; `demandPopin` in tables | 🟡 phone layout checked manually only |
| Accessibility | standard controls; labels with `labelFor`; status shown as icon + text + colour | 🟡 no screen-reader audit |
| i18n | static check: no missing or unused keys | ✅ |
| Backend contract | metadata per app; Gateway URL and error format | ✅ |
| Privacy | fictional data; fake ID/phone ranges; PII not filterable | ✅ |
| Quality gates | CI: lint, static checks, 40 tests before deploy | ✅ |
| Hosting | GitHub Pages from `main` | ✅ |
| Performance | time to data measured per release on fast and mobile profiles ([docs/perf](perf/2026-10-02-load-times.md)) | ✅ |

## 3. Defects found during testing

| # | Found by | Defect | Fix |
|---|---|---|---|
| 1 | TC-LR-O06, O08 | deep links did not open the detail column | layout handler moved to `Component` (ADR-0002) |
| 2 | headless screenshot | Loan Applications blank; actions unresolved | qualified action names; alias `LoanSrv` (ADR-0002); static check added |
| 3 | TC-LA-O03 | band D approval failed silently | Gateway error format with `transition` (ADR-0002) |
| 4 | first static check run | 8 unused i18n keys | removed |
| 5 | review | mock data contained realistic phone numbers and real employer names | replaced with fictional values before publishing |

## 4. Deviations and backlog

- UI5 Tooling build added in 0.1.1 (`Component-preload.js` per app); UI5 itself still comes from the CDN.
- Loan Applications has no unit tests: the app has no custom code (pure Fiori elements); its rules are tested through OPA.
- OData V4 / RAP variant of Loan Applications: backlog.
