sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/List"
], function (opaTest) {
	"use strict";

	QUnit.module("List");

	opaTest("shows every request with a count per status", function (Given, When, Then) {
		Given.iStartMyApp();

		Then.onTheList.iSeeTheTitleWithCount(26)
			.and.iSeeTheTabCount("ALL", 26)
			.and.iSeeTheTabCount("P", 8)
			.and.iSeeTheTabCount("A", 12)
			.and.iSeeTheTabCount("R", 6);
	});

	opaTest("the Pending tab only lists pending requests", function (Given, When, Then) {
		When.onTheList.iSelectTheTab("P");

		Then.onTheList.iSeeItems(8)
			.and.iSeeOnlyItemsWithStatus("Pending");
	});

	opaTest("searching narrows the list and the tab counts", function (Given, When, Then) {
		When.onTheList.iSelectTheTab("ALL")
			.and.iSearchFor("Compassionate");

		Then.onTheList.iSeeItems(3)
			.and.iSeeTheTabCount("ALL", 3)
			.and.iSeeTheTabCount("P", 2);

		Then.iTeardownMyUIComponent();
	});
});
