# Load times, 2026-10-02

**Why:** the published demo felt slow (about 20 s before the loan list appeared on the author's connection).
**How:** `tools/measure-load.cjs` on a GitHub runner (`.github/workflows/perf.yml`), serving `dist/` exactly as GitHub Pages does, cache disabled, one warm-up then the median of 3 runs. "Time" is until data is on screen (list rows, KPI tile value), not until the page starts drawing.
**Profiles:** *fast* = runner network, no throttling. *mobile* = 150 ms latency, 5 Mbit/s down, 2 Mbit/s up, roughly a Zimbabwean 4G connection to a CDN edge abroad.

## What was slow

Loan Applications (Fiori elements) loaded **309 UI5 modules one request at a time**. The library bundles (`library-preload.js`) were downloaded too, but only after the app had already asked for their modules individually. With 150 ms per round trip, that waterfall dominated. The apps' own files also came one by one (no `Component-preload.js`).

## Variants

| Variant | Change |
|---|---|
| main | as published in 0.1.0 |
| A | UI5 Tooling build: each app's modules bundled into `Component-preload.js` |
| B | A + Fiori elements libraries listed in the launchpad bootstrap (`data-sap-ui-libs`) |
| C | A + Fiori elements libraries loaded in the background after the launchpad renders |
| **D** | A + C, but only on the home page or the loan app (not when Leave Requests or Claims Insights is opened directly) |

## Results: mobile profile (time to data, requests)

| Page | main | A | B | C | **D (shipped)** |
|---|---|---|---|---|---|
| Launchpad home | 8.8 s | 8.9 s | 12.2 s | 9.3 s | 9.4 s |
| Leave Requests (direct link) | 12.1 s | 10.9 s | 13.6 s | 11.5 s | **10.9 s** |
| Claims Insights (direct link) | 13.2 s | 12.2 s | 15.0 s | 14.7 s | **12.0 s** |
| Loan Applications (direct link) | 18.1 s / 459 req | 17.4 s / 455 | 15.1 s / 234 | 14.9 s / 304 | **14.8 s / 304** |
| Loan Applications, home then tile after 5 s | n/a | 8.8 s / 343 req | n/a | n/a | **3.3 s / 67 req** |

## Results: fast profile

Every page shows data in 1–3 s in every variant. Without latency the request count barely matters, which is why the problem never showed in CI or on a fast connection.

| Page | main | D |
|---|---|---|
| Launchpad home | 1.0 s | 1.2 s |
| Leave Requests | 1.8 s | 1.8 s |
| Claims Insights | 1.8 s | 2.0 s |
| Loan Applications | 2.5 s | 2.3 s |
| Loan Applications via tile | n/a | 1.3 s |

## Decision

Ship **D**: the common path (open the launchpad, then the loan tile) is 2.7× faster on mobile, direct links are equal or faster than before, and the home page pays 0.5 s for the background downloads. B was rejected because it slows every other page by 1.5–3 s.

## Still slow, and why

- The launchpad sandbox itself loads about 60 modules singly (`sap/ushell` sandbox adapters, not part of any bundle). A production launchpad on an SAP system serves these from its own cache-busted bundles.
- Everything comes from `ui5.sap.com` abroad. A production deployment serves UI5 from the front-end server or BTP in-region, which removes most of the latency.
