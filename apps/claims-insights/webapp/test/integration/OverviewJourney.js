sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Overview"
], function (opaTest) {
	"use strict";

	// Expected numbers come from localService/mockdata/Claims.json with today fixed at 1 Oct 2026
	// (see docs/09-test-cases.md, TC-CI-O01..O05).
	QUnit.module("Overview");

	opaTest("the last 12 months: KPIs, charts and branches", function (Given, When, Then) {
		Given.iStartMyApp();

		Then.onTheOverview.iSeeTheTileValue("tileClaims", "180")
			.and.iSeeTheTileValue("tileFlagged", "8")
			.and.iSeeTheSubtitle("Claims reported in the last 12 months")
			.and.iSeeBranchRows(6)
			.and.iSeeChartsWithData();
	});

	opaTest("a shorter period recalculates every figure", function (Given, When, Then) {
		When.onTheOverview.iChooseThePeriod(3);

		Then.onTheOverview.iSeeTheTileValue("tileClaims", "43")
			.and.iSeeTheTileValue("tileFlagged", "4")
			.and.iSeeTheSubtitle("Claims reported in the last 3 months");
	});

	opaTest("the product line filter combines with the period", function (Given, When, Then) {
		When.onTheOverview.iChooseTheProductLine("FUN");

		Then.onTheOverview.iSeeTheTileValue("tileClaims", "7")
			.and.iSeeTheTileValue("tileFlagged", "0");
	});

	opaTest("pressing a branch row narrows the page to that branch", function (Given, When, Then) {
		When.onTheOverview.iPressReset()
			.and.iPressTheBranch("HRE1");

		Then.onTheOverview.iSeeTheBranchFilter("HRE1")
			.and.iSeeBranchRows(1)
			.and.iSeeTheTileValue("tileClaims", "65");
	});

	opaTest("reset brings back the whole portfolio", function (Given, When, Then) {
		When.onTheOverview.iPressReset();

		Then.onTheOverview.iSeeTheTileValue("tileClaims", "180")
			.and.iSeeTheBranchFilter("")
			.and.iSeeBranchRows(6);

		Then.iTeardownMyUIComponent();
	});
});
