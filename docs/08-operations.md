# Operations

**Version:** 0.1.0 · **Date:** 2026-10-02

## 1. Demo (this repository)

| Task | How |
|---|---|
| Run locally | `npm ci && npm start`, then open http://localhost:8080/launchpad/index.html |
| Run tests | `npm test` (all pages) or `npm test -- unit` / `npm test -- integration`; report in `report/report.html` |
| Publish | push to `main`; CI deploys `dist/` to GitHub Pages after lint, checks and tests pass |
| Upgrade UI5 | replace `1.148.11` in every `index.html`, test page and the launchpad (one search), run `npm test`, check the screenshots |
| Reset demo data | reload the page: MockServer data lives in memory and restarts from `localService/mockdata` |

## 2. Production runbook (SAP landscape)

### Deploy

1. Build with UI5 Tooling (`ui5 build --all`); upload to the ABAP repository with `/UI5/UI5_REPOSITORY_LOAD` (BSP applications `ZHR_LEAVE`, `ZLOAN_APPS`, `ZCLAIMS_INS`) in DEV; release the transport through QAS to PRD.
2. Recalculate the app index: `/UI5/APP_INDEX_CALCULATE`.
3. Launchpad content (`/UI2/FLPD_CUST` or the Launchpad app manager): catalog `ZINSUREHUB` with three tiles and target mappings `LeaveRequest-manage`, `LoanApplication-manage`, `Claim-analyze`; assign to the business roles in [04-security-and-compliance.md](04-security-and-compliance.md).
4. Clear caches: `/UI2/INVALIDATE_GLOBAL_CACHES`, then `/IWFND/CACHE_CLEANUP` for metadata changes.

### Troubleshoot

| Symptom | Check |
|---|---|
| Tile opens a blank page | browser console; `/IWFND/ERROR_LOG` for the service; app index recalculated? |
| "Service not found" / 403 | `/IWFND/MAINT_SERVICE`: service active and system alias set; user has `S_SERVICE` for it |
| Action buttons always disabled (Loan Applications) | `IsDecidable` filled by the backend? `sap:applicable-path` in metadata |
| Error message not shown to the user after an action | the backend must set `transition` in `errordetails` (or use the `/IWBEP/CX_MGW_BUSI_EXCEPTION` with message container): see ADR-0002 |
| Old version after deploy | caches above; the app's `manifest.json` `applicationVersion` should change with every release |

## 3. Monitoring (production)

- Gateway: `/IWFND/STATS` for response times per service, `/IWFND/ERROR_LOG` for failures.
- Front end: the launchpad's usage analytics or SAP Cloud ALM real-user monitoring.
- Business: number of leave requests pending more than 5 days and loan applications awaiting decision more than 2 days. Both can be read from the services above.
