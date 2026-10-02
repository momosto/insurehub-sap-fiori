// Builds the static demo site for GitHub Pages into dist/:
//   dist/index.html            landing page (links to the launchpad and each app)
//   dist/launchpad/            Fiori launchpad sandbox with the three tiles
//   dist/appconfig/            launchpad tiles and target mappings
//   dist/apps/<app>/webapp/    each app built with UI5 Tooling: its modules bundled into Component-preload.js
//                              (one request instead of ~15), tests and mock service kept as separate files
// UI5 loads from the SAP CDN and every app talks to its MockServer, so no backend is needed.
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
for (const dir of ["launchpad", "appconfig"]) {
	cpSync(join(root, dir), join(dist, dir), { recursive: true });
}
for (const app of readdirSync(join(root, "apps"))) {
	const cwd = join(root, "apps", app);
	// relative destination: no spaces, so it survives the Windows shell
	const dest = relative(cwd, join(dist, "apps", app, "webapp")).split("\\").join("/");
	execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", ["ui5", "build", "--dest", dest, "--clean-dest"], {
		cwd,
		stdio: ["ignore", "ignore", "inherit"],
		shell: process.platform === "win32"
	});
	console.log(`built apps/${app}`);
}

const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
writeFileSync(join(dist, ".nojekyll"), "");
writeFileSync(join(dist, "index.html"), `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>InsureHub SAP Fiori apps</title>
	<style>
		:root { color-scheme: light dark; --bg: #f5f6f7; --fg: #1d2d3e; --muted: #556b82; --card: #fff; --line: #d9d9d9; --link: #0064d9; }
		@media (prefers-color-scheme: dark) { :root { --bg: #12171c; --fg: #eaecee; --muted: #a9b4be; --card: #1d232a; --line: #333c45; --link: #4db1ff; } }
		body { margin: 0; font: 16px/1.5 "72", "Segoe UI", system-ui, sans-serif; background: var(--bg); color: var(--fg); }
		main { max-width: 52rem; margin: 0 auto; padding: 2rem 1rem; }
		h1 { margin: 0 0 .25rem; font-size: 1.75rem; }
		p { color: var(--muted); margin: .25rem 0 1.5rem; }
		.cards { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
		a.card { display: block; padding: 1rem; background: var(--card); border: 1px solid var(--line); border-radius: .75rem; color: inherit; text-decoration: none; }
		a.card:hover { border-color: var(--link); }
		a.card strong { display: block; color: var(--link); }
		.primary { margin-bottom: 1rem; }
		footer { margin-top: 2rem; font-size: .875rem; color: var(--muted); }
		footer a { color: var(--link); }
	</style>
</head>
<body>
<main>
	<h1>InsureHub SAP Fiori apps</h1>
	<p>Fictional insurer and microfinance group. Every app runs in your browser against mock SAP Gateway (OData V2) services.</p>
	<div class="cards primary">
		<a class="card" href="launchpad/index.html"><strong>Open the Fiori launchpad →</strong>All three apps as tiles, with intent-based navigation.</a>
	</div>
	<div class="cards">
		<a class="card" href="launchpad/index.html#LeaveRequest-manage"><strong>Leave Requests</strong>Freestyle SAPUI5, flexible column layout</a>
		<a class="card" href="launchpad/index.html#LoanApplication-manage"><strong>Loan Applications</strong>Fiori elements List Report + Object Page</a>
		<a class="card" href="launchpad/index.html#Claim-analyze"><strong>Claims Insights</strong>Analytical overview with charts</a>
	</div>
	<footer>v${version} · <a href="apps/leave-requests/webapp/test/integration/opaTests.qunit.html">Run the OPA5 tests in your browser</a> · All names, IDs and numbers are made up.</footer>
</main>
</body>
</html>
`);
console.log("Built dist/");
