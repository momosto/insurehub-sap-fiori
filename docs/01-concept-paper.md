# Concept paper: InsureHub SAP Fiori apps

**Version:** 0.1.0 · **Date:** 2026-10-02 · **Status:** built (see [07-traceability.md](07-traceability.md))

## 1. Problem

Many Zimbabwean corporates, banks, insurers and parastatals run SAP (ECC or S/4HANA) for HR and finance. Their staff still work in SAP GUI transactions or spreadsheets for everyday approvals:

- **Leave** is requested on paper or by email, then keyed into SAP HR by an administrator. Managers have no single list of what is waiting for them.
- **Loan applications** in the microfinance arm are triaged in spreadsheets. Credit officers cannot see affordability, risk band and the repayment schedule on one screen. The credit policy rule that band D is never approved lives in people's heads.
- **Claims managers** get a monthly Excel pack. They cannot slice it by product line or branch when a question comes up in a meeting.

## 2. Proposal

Three Fiori apps on one launchpad, each using the SAP UI pattern that fits the job:

| App | Users | Pattern | Why this pattern |
|---|---|---|---|
| Leave Requests | every employee; line managers | freestyle SAPUI5, flexible column layout (list + detail) | custom validation (working days, balance) and a two-role flow do not fit a generated template |
| Loan Applications | LendHub credit officers | **Fiori elements** List Report + Object Page, annotation-driven | standard "find, inspect, act" work: the template gives filters, variants, tabs, export and accessibility for free |
| Claims Insights | claims and finance managers | analytical overview page (KPI tiles, charts, drill-down table) | answers "how are we doing" in seconds, with filters instead of a new Excel pack |

All three use OData V2 services as an SAP Gateway would expose them (`/sap/opu/odata/sap/Z…_SRV`). Each repository ships a MockServer, so the apps run and are tested with no SAP system.

## 3. Benefits (for the portfolio and for a real client)

- Shows both Fiori development styles (freestyle and Fiori elements) plus analytics, launchpad integration and OPA5 testing. These are the skills SAP customers ask for.
- The service contracts (metadata, function imports, error format) are the specification an ABAP developer would implement. The front ends need no change when the real Gateway service replaces the mock.
- Business rules are visible and tested: working-day counting, balance checks, maker/approver comments, the band D credit policy and settlement-speed thresholds.

## 4. Scope

**In:** three apps, launchpad sandbox, mock services, unit + OPA5 tests, CI, static demo hosting, documentation of the backend contract.
**Out (documented, not built):** the ABAP/CDS backend, PFCG roles in a real system, transport to a customer landscape. [03-architecture.md](03-architecture.md) and [08-operations.md](08-operations.md) describe them.

## 5. Risks

| Risk | Mitigation |
|---|---|
| UI5 CDN version retired | version pinned in one place per page; upgrade is a search-and-replace, tests catch breakage |
| Mock drifts from what a real Gateway returns | mocks follow Gateway conventions (key predicates, function imports, `innererror.errordetails` with `transition`); found and fixed one such drift during build (ADR-0002) |
| Fiori elements V2 needs launchpad services | apps run inside a launchpad sandbox, and OPA tests drive the real launchpad |
