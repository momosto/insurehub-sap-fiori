// Serves the repo and runs every QUnit/OPA5 page headless (ui5-test-runner + puppeteer).
// Usage: npm test            all pages
//        npm test -- unit    only pages whose path contains "unit"
// Reports (HTML + screenshots of failures) land in report/; CI uploads that folder.
import { spawn } from "node:child_process";
import { createServer } from "http-server";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT || 8765);
const filter = process.argv[2] || "";

const pages = [
	"apps/leave-requests/webapp/test/unit/unitTests.qunit.html",
	"apps/claims-insights/webapp/test/unit/unitTests.qunit.html",
	"apps/leave-requests/webapp/test/integration/opaTests.qunit.html",
	"apps/claims-insights/webapp/test/integration/opaTests.qunit.html",
	"apps/loan-applications/webapp/test/integration/opaTests.qunit.html"
].filter((p) => p.includes(filter));

const server = createServer({ root, cache: -1, silent: true });
server.listen(port, async () => {
	const args = [
		"ui5-test-runner",
		...pages.flatMap((p) => ["--url", `http://localhost:${port}/${p}`]),
		"--report-dir", "report",
		"--page-timeout", "600000",
		"--global-timeout", "1800000",
		"--parallel", "2",
		"--fail-fast", "false",
		"--output-interval", "30s"
	];
	const child = spawn("npx", args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
	child.on("exit", (code) => {
		server.close();
		process.exit(code ?? 1);
	});
});
