/* global document, sap, window -- used inside page.waitForFunction, which runs in the browser */
// Measures how long each app takes to show data inside the launchpad, and how many requests it needs.
// Usage: node tools/measure-load.cjs <base-url> [runs] [profile]
//   e.g. node tools/measure-load.cjs http://localhost:8080 3 mobile
// Profiles: "fast" (no throttling) or "mobile" (150 ms latency, 5 Mbit/s down, 2 Mbit/s up: a typical
// Zimbabwean 4G connection to a CDN edge abroad), where request count matters more than bytes.
// Prints a Markdown table (median of the runs) so results can be pasted into docs/perf/.
const puppeteer = require("puppeteer");

const APPS = [
	{ name: "Launchpad home", hash: "", ready: ".sapUshellTile, .sapMGT" },
	{ name: "Leave Requests", hash: "#LeaveRequest-manage", ready: ".sapMObjLItem" },
	{ name: "Loan Applications", hash: "#LoanApplication-manage", ready: ".sapMListTblRow" },
	// ready when the "Claims reported" tile shows a number (read through the UI5 API, not DOM classes)
	{ name: "Claims Insights", hash: "#Claim-analyze", ready: null }
];

const PROFILES = {
	fast: null,
	mobile: { offline: false, latency: 150, downloadThroughput: (5 * 1024 * 1024) / 8, uploadThroughput: (2 * 1024 * 1024) / 8 }
};
let network = null;

async function measure(browser, url, selector) {
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	if (network) {
		await page.emulateNetworkConditions({ download: network.downloadThroughput, upload: network.uploadThroughput, latency: network.latency });
	}
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
	await page.waitForFunction((sel) => {
		if (sel) {
			return document.querySelectorAll(sel).length > 0;
		}
		var Element = window.sap && sap.ui && sap.ui.core && sap.ui.core.Element;
		var tile = Element && Element.registry && Element.registry.filter((e) => /--tileClaims$/.test(e.getId()))[0];
		return !!tile && !!tile.getTileContent()[0].getContent().getValue();
	}, { timeout: 180000, polling: 100 }, selector);
	const seconds = (Date.now() - t0) / 1000;
	await page.close();
	return { seconds, ...counts };
}

const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

(async () => {
	const [base, runsArg = "3", profile = "fast"] = process.argv.slice(2);
	const runs = Number(runsArg);
	network = PROFILES[profile];
	console.log(`
**Network: ${profile}**
`);
	const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } });
	console.log("| App | Time to data (median of " + runs + ") | Requests | CDN requests | Single CDN modules |");
	console.log("|---|---|---|---|---|");
	for (const app of APPS) {
		const results = [];
		// one unmeasured warm-up per app so a slow first CDN connection does not skew the median
		await measure(browser, `${base}/launchpad/index.html${app.hash}`, app.ready).catch(() => {});
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
