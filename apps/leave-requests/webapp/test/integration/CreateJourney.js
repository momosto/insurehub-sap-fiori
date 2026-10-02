sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/List",
	"./pages/Detail"
], function (opaTest) {
	"use strict";

	QUnit.module("Create");

	opaTest("an employee requests three days of study leave", function (Given, When, Then) {
		Given.iStartMyApp();

		When.onTheList.iPressCreate()
			.and.iChooseTheLeaveType("STU")
			.and.iChooseAPeriodOfWorkingDays(3);
		Then.onTheList.iSeeTheWorkingDays(3);

		When.onTheList.iPressSubmit();

		Then.onTheDetail.iSeeTheRequestOf("Demo User")
			.and.iSeeTheStatus("Pending");
		Then.onTheList.iSeeTheTitleWithCount(27);

		Then.iTeardownMyUIComponent();
	});
});
