// Serves the repo and runs every QUnit/OPA5 page headless (ui5-test-runner + puppeteer).
// Usage: npm test                      all pages, from source
//        npm test -- unit              only pages whose path contains "unit"
//        npm test -- --dist integration  run against the built site in dist/ (what GitHub Pages serves)
// Reports (HTML + screenshots of failures) land in report/; CI uploads that folder.
import { spawn } from "node:child_process";
import { createServer } from "http-server";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT || 8765);
const args = process.argv.slice(2);
const fromDist = args.includes("--dist");
const filter = args.filter((a) => a !== "--dist")[0] || "";

const pages = [
	"apps/leave-requests/webapp/test/unit/unitTests.qunit.html",
	"apps/claims-insights/webapp/test/unit/unitTests.qunit.html",
	"apps/leave-requests/webapp/test/integration/opaTests.qunit.html",
	"apps/claims-insights/webapp/test/integration/opaTests.qunit.html",
	"apps/loan-applications/webapp/test/integration/opaTests.qunit.html"
].filter((p) => p.includes(filter)).map((p) => (fromDist ? `dist/${p}` : p));

const server = createServer({ root, cache: -1, silent: true });
server.listen(port, async () => {
	const runnerArgs = [
		"ui5-test-runner",
		...pages.flatMap((p) => ["--url", `http://localhost:${port}/${p}`]),
		"--report-dir", fromDist ? "report/dist" : "report",
		"--page-timeout", "600000",
		"--global-timeout", "1800000",
		"--parallel", "2",
		"--fail-fast", "false",
		"--output-interval", "30s"
	];
	const child = spawn("npx", runnerArgs, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
	child.on("exit", (code) => {
		server.close();
		process.exit(code ?? 1);
	});
});
