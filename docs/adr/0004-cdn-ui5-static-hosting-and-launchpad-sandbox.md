# ADR-0004: UI5 from the SAP CDN, static hosting and a launchpad sandbox

**Status:** Accepted · **Date:** 2026-10-02

## Context

The demo must open from a link, cost nothing to host, and behave like apps on a real Fiori launchpad. Fiori elements V2 apps depend on shell services (`ShellUIService`, navigation) and render a blank page when started standalone.

## Decision

- Load SAPUI5 1.148.11 from `ui5.sap.com` (pinned). No build step; the repository is served as static files.
- Ship a launchpad sandbox (`launchpad/index.html` with `sap/ushell/bootstrap/sandbox.js`). Tiles and target mappings live in `appconfig/fioriSandboxConfig.json`, which the sandbox merges *after* its own defaults; an inline config cannot remove the sandbox's sample group.
- Freestyle apps also keep standalone `index.html` pages for quick development; Fiori elements is used through the launchpad only.
- GitHub Pages hosts `dist/` (built by `tools/build-site.mjs`), deployed by CI from `main` after all tests pass.

## Consequences

- The demo depends on the SAP CDN being reachable. Production would use UI5 Tooling to build preload bundles and serve UI5 from the ABAP or BTP front-end server.
- The sandbox uses deprecated "classic homepage" controls (console warnings). This is acceptable for a demo; a production launchpad uses spaces and pages.
