# Security and compliance

**Version:** 0.1.0 · **Date:** 2026-10-02

The demo has no backend and no real data. This page is the security design a real deployment would follow, and it records what the front ends already do.

## 1. Authorisation (production design)

| Business role (FLP) | Apps | Backend authorisation (PFCG) |
|---|---|---|
| `Z_BR_EMPLOYEE` | Leave Requests (own requests) | `P_ORGIN` / `P_PERNR` for own personnel number; service `ZHR_LEAVE_SRV` via `S_SERVICE` |
| `Z_BR_LINE_MANAGER` | Leave Requests (team) | as above + `P_ORGIN` for the org units managed; `ApproveLeave`/`RejectLeave` checked in the DPC (the UI never decides who may approve) |
| `Z_BR_CREDIT_OFFICER` | Loan Applications | `S_SERVICE` for `ZLOAN_APPLICATION_SRV`; custom object `Z_LOAN_APP` with activity 03 (display) and branch field |
| `Z_BR_CREDIT_MANAGER` | Loan Applications (decide) | `Z_LOAN_APP` activities 03 + `A1` (approve) / `A2` (reject), limited by amount band |
| `Z_BR_CLAIMS_MANAGER` | Claims Insights | `S_SERVICE` for `ZCLAIMS_INSIGHTS_SRV`; CDS access control (`DCL`) by branch |

Principles: every decision is enforced in the backend; the UI only hides what the user cannot do (`sap:applicable-path`, `showFooter`). Credit policy (band D never approved) lives in the service. The demo mock enforces it the same way, and the OPA journey proves the message reaches the user.

## 2. Front-end controls already in place

| Threat | Control |
|---|---|
| Clickjacking | `data-sap-ui-frame-options="trusted"` on app pages (`allow` only on the launchpad sandbox, which embeds the apps itself) |
| XSS | only UI5 controls; no `innerHTML`; user text bound as plain properties (UI5 escapes) |
| CSRF (production) | ODataModel fetches `X-CSRF-Token` automatically for POST/MERGE; Gateway validates it |
| Personal data in filters and URLs | `NationalID` and `Phone` are `sap:filterable="false"`, so they never appear in `$filter` or in shared links/variants |
| Personal data on screen | shown only on the object page of the application being decided, never in the list |
| Unpinned code from the internet | UI5 pinned to an exact version on the SAP CDN; no other third-party script; npm dev tools locked by `package-lock.json` |

## 3. Data protection (Zimbabwe Cyber and Data Protection Act, 2021)

- Purpose limitation: each service exposes only the fields its app needs (claims analytics carries no claimant names).
- Minimisation in the demo: all people, employers, IDs and numbers are fictional. IDs use district code `00` and phone numbers `+263 77 000 xxxx`, which are not issued.
- Retention and audit (production): Gateway logs (`/IWFND/ERROR_LOG`, `/IWBEP/ERROR_LOG`) without payloads; change documents on leave and loan decisions.

## 4. Segregation of duties

- Leave: requester ≠ approver, enforced in the DPC by comparing the approver's personnel number with the request's.
- Loans: capture happens in LendHub; decisions here; the credit manager role cannot edit application data (entity set is read-only, `sap:updatable="false"`).
