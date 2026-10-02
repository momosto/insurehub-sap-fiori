/* global document -- used inside page.waitForFunction, which runs in the browser */
// Measures how long each app takes to show data inside the launchpad, and how many requests it needs.
// Usage: node tools/measure-load.cjs <base-url> [runs]
//   e.g. node tools/measure-load.cjs http://localhost:8080 3
// Prints a Markdown table (median of the runs) so results can be pasted into docs/perf/.
const puppeteer = require("puppeteer");

const APPS = [
	{ name: "Launchpad home", hash: "", ready: ".sapUshellTile, .sapMGT" },
	{ name: "Leave Requests", hash: "#LeaveRequest-manage", ready: ".sapMObjLItem" },
	{ name: "Loan Applications", hash: "#LoanApplication-manage", ready: ".sapMListTblRow" },
	{ name: "Claims Insights", hash: "#Claim-analyze", ready: ".sapMGT .sapMNCValueScr" }
];

async function measure(browser, url, selector) {
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	const counts = { total: 0, cdn: 0, single: 0, bytes: 0 };
	page.on("requestfinished", async (req) => {
		counts.total++;
		if (req.url().includes("ui5.sap.com")) {
			counts.cdn++;
			if (/\.js(\?|$)/.test(req.url()) && !/preload/.test(req.url())) counts.single++;
		}
	});
	page.on("response", async (res) => {
		const len = Number(res.headers()["content-length"] || 0);
		counts.bytes += len;
	});
	const t0 = Date.now();
	await page.goto(url, { waitUntil: "domcontentloaded", timeout: 180000 });
	await page.waitForFunction((sel) => document.querySelectorAll(sel).length > 0, { timeout: 180000, polling: 100 }, selector);
	const seconds = (Date.now() - t0) / 1000;
	await page.close();
	return { seconds, ...counts };
}

const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

(async () => {
	const [base, runsArg = "3"] = process.argv.slice(2);
	const runs = Number(runsArg);
	const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } });
	console.log("| App | Time to data (median of " + runs + ") | Requests | CDN requests | Single CDN modules |");
	console.log("|---|---|---|---|---|");
	for (const app of APPS) {
		const results = [];
		for (let i = 0; i < runs; i++) {
			results.push(await measure(browser, `${base}/launchpad/index.html${app.hash}`, app.ready));
		}
		const m = (k) => median(results.map((r) => r[k]));
		console.log(`| ${app.name} | ${m("seconds").toFixed(1)} s | ${m("total")} | ${m("cdn")} | ${m("single")} |`);
	}
	await browser.close();
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
