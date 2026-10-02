# Test cases

**Version:** 0.1.0 · **Date:** 2026-10-02 · **Run:** `npm run lint` clean, `npm run check` clean, `npm test` 40/40 (leave unit 10, claims unit 13, leave OPA 8, claims OPA 5, loan OPA 4) in headless Chrome, UI5 1.148.11

**Levels:** S = static check · U = QUnit unit · O = OPA5 journey · O-FLP = OPA5 journey through the real launchpad (iframe).
**Result:** ✅ passed on 2026-10-02 · ⏳ not automated yet.

## 1. Static checks (`tools/check-apps.mjs`, ESLint)

| ID | Check | Expected | Level | Result |
|---|---|---|---|---|
| TC-S-01 | ESLint over apps, launchpad, tools | 0 problems | S | ✅ |
| TC-S-02 | every `manifest.json` parses; `sap.app.id` has a resource root in its `index.html`, the launchpad, and an inbound in `appconfig` | consistent | S | ✅ |
| TC-S-03 | i18n keys used in views/fragments/controllers/manifest exist; no unused keys | none missing, none unused | S | ✅ (8 unused keys removed when first run) |
| TC-S-04 | XML (views, fragments, metadata, annotations) well-formed | balanced tags, escaped `&` | S | ✅ |
| TC-S-05 | annotation targets exist; actions are `Namespace.Container/FunctionImport` and exist; alias is not a suffix of the namespace | valid | S | ✅; mutation test: reintroducing alias `SRV` fails the check |
| TC-S-06 | each mock data file maps to an entity set and uses only declared properties | valid | S | ✅ |

## 2. Leave Requests

### Unit (`test/unit/formatter.test.js`)

| ID | Req | Scenario | Expected | Result |
|---|---|---|---|---|
| TC-LR-U01 | LR-03 | Mon 5 Oct → Fri 9 Oct 2026 | 5 working days | ✅ |
| TC-LR-U02 | LR-03 | Fri 9 → Mon 12 Oct | 2 | ✅ |
| TC-LR-U03 | LR-03 | Sat–Sun only | 0 | ✅ |
| TC-LR-U04 | LR-03 | single weekday | 1 | ✅ |
| TC-LR-U05 | LR-03 | end before start; missing dates | 0 | ✅ |
| TC-LR-U06 | LR-03 | times of day 23:59 and 00:01 | still 2 days | ✅ |
| TC-LR-U07 | LR-03 | `toUTCDate` of local 5 Oct 00:00 | `2026-10-05T00:00:00.000Z` (no shift to 4 Oct in UTC+2) | ✅ |
| TC-LR-U08 | LR-03 | `toUTCDate` of a string | `null` | ✅ |
| TC-LR-U09 | LR-01 | status A/R/P/W | Success / Error / Warning / None | ✅ |
| TC-LR-U10 | LR-01 | status text | i18n key `status<code>`; empty for no status | ✅ |

### OPA5 (`test/integration/`)

| ID | Req | Journey | Expected | Result |
|---|---|---|---|---|
| TC-LR-O01 | LR-01 | open the app | title "Leave Requests (26)"; tabs All 26, Pending 8, Approved 12, Rejected 6 | ✅ |
| TC-LR-O02 | LR-01 | Pending tab | 8 items, all "Pending" | ✅ |
| TC-LR-O03 | LR-02 | search "Compassionate" | 3 items; All tab 3, Pending tab 2 | ✅ |
| TC-LR-O04 | LR-04 | open LR00010222 (Chipo Mhlanga), Approve with comment | status Approved; footer hidden | ✅ |
| TC-LR-O05 | LR-04 | open LR00010185, Reject | dialog's Reject disabled until a comment is typed; then Rejected | ✅ |
| TC-LR-O06 | LR-05, LR-06 | deep link to LR00010296 (Demo User), Withdraw, confirm | status Withdrawn | ✅ (failed before the routing fix, ADR-0002 #1) |
| TC-LR-O07 | LR-03 | Request Leave: Study Leave, 3 working days from a future Monday | dialog shows 3 days; after submit the new request opens as Pending; list title 27 | ✅ |
| TC-LR-O08 | LR-06 | deep link to LR99999999 | "Request not found" | ✅ (failed before the routing fix) |
| TC-LR-M01 | LR-03 | choose a past date or more days than the balance | field turns red with the message; Submit disabled | ⏳ manual check only |

## 3. Loan Applications (OPA5 through the launchpad)

| ID | Req | Journey | Expected | Result |
|---|---|---|---|---|
| TC-LA-O01 | LA-01 | `#LoanApplication-manage` | "Loan Applications (42)"; Awaiting Decision tab → 18; High Risk (C/D) tab → 29 | ✅ |
| TC-LA-O02 | LA-02, LA-03 | open LA26000107 (Nyasha Ncube, band A, Under Review); Approve with comment | status Approved | ✅ |
| TC-LA-O03 | LA-05 | open LA26000114 (Rudo Moyo, band D); Approve | error dialog "…cannot be approved (credit policy 4.2)"; after Close still Submitted | ✅ (failed silently before ADR-0002 #3) |
| TC-LA-O04 | LA-04 | open LA26000100 (Precious Moyo); Reject with reason | status Rejected | ✅ |
| TC-LA-M01 | LA-06 | filter bar | National ID and mobile number are not offered as filters | ✅ manual (metadata `sap:filterable="false"`, checked in screenshot) |

## 4. Claims Insights

### Unit (`test/unit/aggregator.test.js`, `formatter.test.js`)

Worked example (5 claims): 2 paid (claimed 1,000 + 500; paid 800 + 500), 1 rejected (2,000, 30 days, flagged), 1 open (300.10), 1 approved (0.20).

| ID | Req | Scenario | Expected | Result |
|---|---|---|---|---|
| TC-CI-U01 | CI-02 | 3-month window to 1 Oct 2026 | 2 Jul in; 30 Jun and 2 Oct out | ✅ |
| TC-CI-U02 | CI-03 | product line / branch / both / none | 1 / 1 / 3 / 5 claims | ✅ |
| TC-CI-U03 | CI-01 | worked example | count 5, open 1, claimed 3,800.30 (no float drift), paid 1,300, paid ratio 86.7%, rejection 25%, avg days 14.7, flagged 1 | ✅ |
| TC-CI-U04 | CI-01 | no claims | every KPI 0, none NaN | ✅ |
| TC-CI-U05 | CI-01 | amounts as numbers or strings; junk | parsed; junk counts 0 | ✅ |
| TC-CI-U06 | CI-05 | group by branch | Bulawayo (2,000) before Harare (1,800.30); rejection 100% for Bulawayo | ✅ |
| TC-CI-U07 | CI-04 | 3 months to 1 Oct | Jul 1 claim, Aug 0 (gap filled), Sep 2 (150.00); October excluded (incomplete) | ✅ |
| TC-CI-U08 | CI-04 | 12 months to 10 Feb 2026 | Feb 2025 … Jan 2026 | ✅ |
| TC-CI-U09 | CI-04 | status mix | OPEN, APPR, PAID, REJ order; empty statuses skipped | ✅ |
| TC-CI-U10 | CI-01 | `thousands` | 789,123.45 → "789.1"; 950 → "1.0"; null → "" | ✅ |
| TC-CI-U11 | CI-05 | `amount` | 292,868.8 → "292,868.80" | ✅ |
| TC-CI-U12 | CI-06 | rejection thresholds | 10 good; 10.1 critical; 20.1 error (tile colours and table states) | ✅ |
| TC-CI-U13 | CI-06 | settlement thresholds | 20 good; 25 critical; 31 error | ✅ |

### OPA5 (fixed today 1 Oct 2026, unshifted mock data)

| ID | Req | Journey | Expected | Result |
|---|---|---|---|---|
| TC-CI-O01 | CI-01, CI-04, CI-05 | open | claims 180, flagged 8, subtitle "last 12 months", 6 branch rows, 3 charts with data | ✅ |
| TC-CI-O02 | CI-02 | 3 months | claims 43, flagged 4 | ✅ |
| TC-CI-O03 | CI-03 | + product line Funeral | claims 7, flagged 0 | ✅ |
| TC-CI-O04 | CI-05 | reset, press Harare CBD row | branch filter HRE1, 1 row, claims 65 | ✅ |
| TC-CI-O05 | CI-03 | reset | claims 180, branch filter All, 6 rows | ✅ |

## 5. Launchpad

| ID | Req | Check | Expected | Result |
|---|---|---|---|---|
| TC-FLP-01 | FLP-01 | open `launchpad/index.html` | one group with Leave Requests, Loan Applications, Claims Insights tiles (icons, subtitles); no SAP sample group | ✅ (screenshot `docs/img/launchpad.png`) |
| TC-FLP-02 | FLP-02 | intents for all three apps | each app opens inside the shell | ✅ (covered by TC-LA-O* and screenshots) |
| TC-FLP-03 | hosting | `npm run build` then open `dist/index.html` | landing page links work | ✅ (`docs/img/landing.png`) |
