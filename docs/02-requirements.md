# Requirements

**Version:** 0.1.0 · **Date:** 2026-10-02

## Leave Requests (LR)

| ID | As a… | I want… | Acceptance |
|---|---|---|---|
| LR-01 | employee | to see all leave requests with their status | list sorted by start date; tabs All / Pending / Approved / Rejected with live counts |
| LR-02 | employee | to search by name or leave type | search narrows the list and the tab counts together |
| LR-03 | employee | to request leave | choose type and period; working days (Mon–Fri) counted for me; past dates, weekend-only periods and periods over my balance are refused; the new request opens as Pending |
| LR-04 | manager | to approve or reject a pending request | approve with an optional comment; reject only with a comment; decided requests lose the buttons |
| LR-05 | employee | to withdraw my own pending request | Withdraw shown only on my pending requests, with confirmation |
| LR-06 | user | deep links to work | `#/requests/<id>` opens the request in the second column; an unknown id shows "Request not found" |

## Loan Applications (LA)

| ID | As a… | I want… | Acceptance |
|---|---|---|---|
| LA-01 | credit officer | a list of applications with filters | filter by status, product, branch, risk band, submission date; search; tabs All / Awaiting Decision / High Risk (C/D) with counts |
| LA-02 | credit officer | the full picture on one page | applicant, affordability (income, instalment, debt-to-income), credit score with target, loan terms and the repayment schedule |
| LA-03 | credit officer | to approve an application | Approve action with optional comment; status becomes Approved; action disabled once decided (`sap:applicable-path="IsDecidable"`) |
| LA-04 | credit officer | to reject with a reason | Reject requires a reason; status becomes Rejected |
| LA-05 | risk manager | credit policy enforced by the system | band D can never be approved; the officer sees the policy message in a dialog |
| LA-06 | data protection officer | personal data kept out of filters | national ID and mobile number are not filterable |

## Claims Insights (CI)

| ID | As a… | I want… | Acceptance |
|---|---|---|---|
| CI-01 | claims manager | headline KPIs | claims reported (and still open), amount claimed, amount paid (and % of claimed on paid claims), average days to settle, rejection rate, claims flagged by ClaimGuard |
| CI-02 | claims manager | to change the period | 3, 6 or 12 months; every figure recalculates |
| CI-03 | claims manager | to filter by product line and branch | filters combine with the period; reset returns to the portfolio |
| CI-04 | claims manager | charts | claimed vs paid by product line; claims per month (complete months only, gaps filled); status mix |
| CI-05 | claims manager | a branch table I can drill into | claims, claimed, paid, average days, rejection rate, flagged per branch; pressing a row filters the page to that branch |
| CI-06 | claims manager | warnings that stand out | rejection rate > 10% amber, > 20% red; settlement > 20 days amber, > 30 days red (30-day service standard) |

## Launchpad (FLP)

| ID | Requirement | Acceptance |
|---|---|---|
| FLP-01 | one entry point | launchpad home with one InsureHub group and three tiles |
| FLP-02 | intent-based navigation | `#LeaveRequest-manage`, `#LoanApplication-manage`, `#Claim-analyze` open the apps; browser back returns home |

## Non-functional requirements

| Category | Requirement |
|---|---|
| Compatibility | SAPUI5 ≥ 1.120 (manifest `minUI5Version`); built and tested on 1.148 (Horizon theme) |
| Responsiveness | usable on phone, tablet and desktop (`deviceTypes`); compact density with a mouse, cozy on touch |
| Accessibility | standard UI5 controls only (keyboard and screen-reader support); every input has a label; colour is never the only signal (icons and text accompany status colours) |
| i18n | all UI text in `i18n.properties`; no unused or missing keys (checked in CI) |
| Backend contract | OData V2, Gateway URL conventions, function imports for state changes, Gateway error format |
| Privacy | demo data fictional; IDs and phone numbers in obviously fake ranges |
| Quality | ESLint clean; static consistency checks; unit + OPA5 tests green in CI on every push |
| Hosting | static files only; demo published to GitHub Pages from `main` |
