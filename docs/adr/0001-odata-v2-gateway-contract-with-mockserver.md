# ADR-0001: OData V2 Gateway contracts, simulated with MockServer

**Status:** Accepted · **Date:** 2026-09-30

## Context

The apps must run for reviewers without an SAP system, yet be ready for a real one. Most SAP customers in the region run ECC or early S/4HANA releases, where SEGW-built OData V2 services are the norm.

## Decision

- Each app gets an OData V2 service contract written as `localService/metadata.xml`, using Gateway conventions: `/sap/opu/odata/sap/Z…_SRV/`, `sap:` annotations (labels, `sap:text`, `sap:value-list`, `sap:filterable`), and function imports for state changes (`sap:action-for`, `sap:applicable-path`).
- `sap/ui/core/util/MockServer` serves the contract in the browser from JSON files and simulates function imports, including their business rules and error responses.
- The mock restarts cleanly (`init()` destroys the previous instance), so tests can start the app many times with fresh data.

## Consequences

- No backend to host; the whole demo is static files.
- The metadata is the hand-off to an ABAP developer. A static check keeps annotations and mock data consistent with it.
- OData V4 / RAP is not shown. A V4 variant of Loan Applications is on the backlog.
