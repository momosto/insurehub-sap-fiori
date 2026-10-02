# ADR-0002: Defects found by the OPA5 journeys, and the rules that prevent them

**Status:** Accepted · **Date:** 2026-10-02

## Context

Before the integration tests existed, two apps looked fine in a quick manual check. The OPA5 journeys and headless screenshots found three defects.

| # | Defect | Root cause |
|---|---|---|
| 1 | Leave Requests: a deep link (`#/requests/<id>`), including one to a missing request, showed only the list column | the root view is created asynchronously (`IAsyncContentCreation`); `Component.init` started the router before the App controller had attached the layout handler, so the first route match was missed |
| 2 | Loan Applications: blank page; Approve/Reject "not defined in the metadata" | annotations used `Container/FunctionImport` (not resolvable by the V2 metamodel), and after qualifying the name, the annotation alias `SRV` was substituted *inside* the qualified string (`ZLOAN_APPLICATION_SRV.` contains `SRV.`), corrupting it |
| 3 | Loan Applications: approving a band D application failed silently | the mock's 400 response lacked `innererror.errordetails[].transition`; UI5 attached the message to the object instead of treating it as a transition message, so Fiori elements never opened the error dialog |

## Decision

1. The **Component** owns route-driven layout (`attachBeforeRouteMatched` before `router.initialize()`).
2. Annotation actions use `Namespace.Container/FunctionImport`; aliases must not be a suffix of the namespace (`LoanSrv`, not `SRV`). `tools/check-apps.mjs` enforces both.
3. Mock error responses use the full Gateway shape with `transition: true`. [08-operations.md](../08-operations.md) records the same requirement for the real backend.
4. Every journey that starts the app first tears down any component or frame left by a failed journey.

## Consequences

The static checker fails the build on rules 2 and on i18n drift (tested by deliberately reintroducing the alias bug and a missing key). Defect 1 is covered by the deep-link journeys, defect 3 by "credit policy blocks approving a band D application".
