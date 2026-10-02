sap.ui.define([
	"insurehub/claims/insights/model/aggregator"
], function (aggregator) {
	"use strict";

	var TODAY = new Date(Date.UTC(2026, 9, 1)); // 1 Oct 2026

	function claim(sId, mProps) {
		return Object.assign({
			ClaimID: sId,
			ProductLine: "MOT", ProductLineText: "Motor",
			Branch: "HRE1", BranchName: "Harare CBD",
			ReportedOn: new Date(Date.UTC(2026, 8, 15)),
			Status: "PAID", StatusText: "Paid",
			ClaimedAmount: "1000.00", PaidAmount: "800.00",
			DaysToSettle: 10, Flagged: false
		}, mProps);
	}

	// Worked example used by several tests (see docs/09-test-cases.md TC-CI-U03):
	// 2 paid (claimed 1000 + 500, paid 800 + 500), 1 rejected, 1 open, 1 approved.
	var SAMPLE = [
		claim("C1"),
		claim("C2", { ProductLine: "FUN", ProductLineText: "Funeral", ClaimedAmount: "500.00", PaidAmount: "500.00", DaysToSettle: 4 }),
		claim("C3", { Status: "REJ", StatusText: "Rejected", PaidAmount: "0.00", ClaimedAmount: "2000.00", DaysToSettle: 30, Flagged: true, Branch: "BYO1", BranchName: "Bulawayo Main" }),
		claim("C4", { Status: "OPEN", StatusText: "Open", PaidAmount: "0.00", ClaimedAmount: "300.10", DaysToSettle: null }),
		claim("C5", { Status: "APPR", StatusText: "Approved", PaidAmount: "0.00", ClaimedAmount: "0.20", DaysToSettle: null })
	];

	QUnit.module("filter");

	QUnit.test("keeps claims reported inside the period", function (assert) {
		var aClaims = [
			claim("in", { ReportedOn: new Date(Date.UTC(2026, 6, 2)) }),   // 2 Jul: inside 3 months
			claim("out", { ReportedOn: new Date(Date.UTC(2026, 5, 30)) }),  // 30 Jun: outside
			claim("future", { ReportedOn: new Date(Date.UTC(2026, 9, 2)) })
		];
		var aResult = aggregator.filter(aClaims, { months: 3, productLine: "", branch: "" }, TODAY);
		assert.deepEqual(aResult.map(function (c) { return c.ClaimID; }), ["in"]);
	});

	QUnit.test("product line and branch narrow the result; empty means all", function (assert) {
		assert.strictEqual(aggregator.filter(SAMPLE, { months: 12, productLine: "FUN", branch: "" }, TODAY).length, 1);
		assert.strictEqual(aggregator.filter(SAMPLE, { months: 12, productLine: "", branch: "BYO1" }, TODAY).length, 1);
		assert.strictEqual(aggregator.filter(SAMPLE, { months: 12, productLine: "MOT", branch: "HRE1" }, TODAY).length, 3);
		assert.strictEqual(aggregator.filter(SAMPLE, { months: 12, productLine: "", branch: "" }, TODAY).length, 5);
	});

	QUnit.module("kpis");

	QUnit.test("worked example", function (assert) {
		var k = aggregator.kpis(SAMPLE);
		assert.strictEqual(k.count, 5, "claims");
		assert.strictEqual(k.open, 1, "open");
		assert.strictEqual(k.claimed, 3800.30, "1000 + 500 + 2000 + 300.10 + 0.20, without floating-point drift");
		assert.strictEqual(k.paid, 1300, "800 + 500");
		assert.strictEqual(k.paidRatio, 86.7, "1300 / 1500 paid claims' claimed amount");
		assert.strictEqual(k.rejectionRate, 25, "1 rejected of 4 decided");
		assert.strictEqual(k.avgDaysToSettle, 14.7, "(10 + 4 + 30) / 3");
		assert.strictEqual(k.flagged, 1);
	});

	QUnit.test("no claims gives zeros, not NaN", function (assert) {
		assert.deepEqual(aggregator.kpis([]), {
			count: 0, open: 0, claimed: 0, paid: 0, paidRatio: 0, rejectionRate: 0, avgDaysToSettle: 0, flagged: 0
		});
	});

	QUnit.test("amounts may arrive as numbers or strings; junk counts as zero", function (assert) {
		var k = aggregator.kpis([claim("a", { ClaimedAmount: 10.5 }), claim("b", { ClaimedAmount: "abc" })]);
		assert.strictEqual(k.claimed, 10.5);
	});

	QUnit.module("groupBy");

	QUnit.test("one row per group, largest claimed first", function (assert) {
		var aRows = aggregator.groupBy(SAMPLE, "Branch", "BranchName");
		assert.deepEqual(aRows.map(function (r) { return r.key + ":" + r.count; }), ["BYO1:1", "HRE1:4"],
			"Bulawayo (2000 claimed) before Harare (1800.30)");
		assert.strictEqual(aRows[1].text, "Harare CBD");
		assert.strictEqual(aRows[0].rejectionRate, 100);
	});

	QUnit.module("monthly");

	QUnit.test("fills empty months and stops at the last complete month", function (assert) {
		var aClaims = [
			claim("sep", { ReportedOn: new Date(Date.UTC(2026, 8, 30)), ClaimedAmount: "100.00" }),
			claim("sep2", { ReportedOn: new Date(Date.UTC(2026, 8, 1)), ClaimedAmount: "50.00" }),
			claim("jul", { ReportedOn: new Date(Date.UTC(2026, 6, 15)) }),
			claim("oct", { ReportedOn: new Date(Date.UTC(2026, 9, 1)) })
		];
		var aMonths = aggregator.monthly(aClaims, TODAY, 3);
		assert.deepEqual(aMonths, [
			{ month: "2026-07", count: 1, claimed: 1000 },
			{ month: "2026-08", count: 0, claimed: 0 },
			{ month: "2026-09", count: 2, claimed: 150 }
		]);
	});

	QUnit.test("a 12-month window crosses the year boundary", function (assert) {
		var aMonths = aggregator.monthly([], new Date(Date.UTC(2026, 1, 10)), 12);
		assert.strictEqual(aMonths.length, 12);
		assert.strictEqual(aMonths[0].month, "2025-02");
		assert.strictEqual(aMonths[11].month, "2026-01");
	});

	QUnit.module("statusMix");

	QUnit.test("counts per status in workflow order, skipping empty statuses", function (assert) {
		var aMix = aggregator.statusMix(SAMPLE.concat([claim("C6")]));
		assert.deepEqual(aMix.map(function (s) { return s.status + ":" + s.count; }), ["OPEN:1", "APPR:1", "PAID:3", "REJ:1"]);
		assert.deepEqual(aggregator.statusMix([claim("x")]), [{ status: "PAID", text: "Paid", count: 1 }]);
	});
});
