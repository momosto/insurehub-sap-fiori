# ADR-0004: UI5 from the SAP CDN, static hosting and a launchpad sandbox

**Status:** Accepted · **Date:** 2026-10-02

## Context

The demo must open from a link, cost nothing to host, and behave like apps on a real Fiori launchpad. Fiori elements V2 apps depend on shell services (`ShellUIService`, navigation) and render a blank page when started standalone.

## Decision

- Load SAPUI5 1.148.11 from `ui5.sap.com` (pinned). Development serves the source as static files; the published site is built with UI5 Tooling so each app ships as one `Component-preload.js` (added in 0.1.1 after measuring, see `docs/perf/`).
- Ship a launchpad sandbox (`launchpad/index.html` with `sap/ushell/bootstrap/sandbox.js`). Tiles and target mappings live in `appconfig/fioriSandboxConfig.json`, which the sandbox merges *after* its own defaults; an inline config cannot remove the sandbox's sample group.
- Freestyle apps also keep standalone `index.html` pages for quick development; Fiori elements is used through the launchpad only.
- GitHub Pages hosts `dist/` (built by `tools/build-site.mjs`), deployed by CI from `main` after all tests pass.

## Consequences

- The demo depends on the SAP CDN being reachable. Production serves UI5 from the ABAP or BTP front-end server, in-region, which removes most of the latency measured in `docs/perf/`.
- The launchpad warms up the Fiori elements libraries in the background on the home page, because loading them on demand produced a 300-request waterfall.
- The sandbox uses deprecated "classic homepage" controls (console warnings). This is acceptable for a demo; a production launchpad uses spaces and pages.
