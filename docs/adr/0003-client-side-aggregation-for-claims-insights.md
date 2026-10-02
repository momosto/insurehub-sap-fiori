# ADR-0003: Client-side aggregation for Claims Insights

**Status:** Accepted · **Date:** 2026-10-02

## Context

Claims Insights needs totals, ratios and monthly series by product line and branch. In S/4HANA this would be an analytical CDS query consumed by an Analytical List Page or OVP cards. MockServer cannot aggregate (`$apply` is OData V4; V2 analytical services need the Gateway's aggregation engine).

## Decision

- The app reads the claims entity set once and computes every figure in `model/aggregator.js`, a module of pure functions with no UI5 dependencies beyond `sap.ui.define`.
- The UI is freestyle (`GenericTile`, `VizFrame`, `sap.m.Table`) and bound to a JSON model that the aggregator fills.
- Measures are defined so each maps onto a CDS analytical measure later: count, sum of claimed/paid, paid ratio on paid claims, rejection rate over decided claims, average days to settle, flagged count.

## Consequences

- Every number is unit-tested with a hand-worked example (`aggregator.test.js`), including floating-point drift, empty input and year boundaries.
- Fine for thousands of claims, not for millions. The production version moves aggregation to the server and keeps the same page layout.
