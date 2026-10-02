sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/List",
	"./pages/Detail"
], function (opaTest) {
	"use strict";

	QUnit.module("Approve, reject, withdraw");

	opaTest("a manager approves a pending request", function (Given, When, Then) {
		Given.iStartMyApp();

		When.onTheList.iOpenTheRequest("LR00010222");
		Then.onTheDetail.iSeeTheRequestOf("Chipo Mhlanga")
			.and.iSeeTheStatus("Pending");

		When.onTheDetail.iPressApprove()
			.and.iEnterTheComment("Enjoy the break")
			.and.iConfirmTheDialogWith("Approve");

		Then.onTheDetail.iSeeTheStatus("Approved")
			.and.iDoNotSeeTheDecisionButtons();
	});

	opaTest("rejecting needs a reason", function (Given, When, Then) {
		When.onTheList.iOpenTheRequest("LR00010185");
		Then.onTheDetail.iSeeTheRequestOf("Kudzai Sibanda");

		When.onTheDetail.iPressReject();
		Then.onTheDetail.iSeeTheDialogButtonDisabled("Reject");

		When.onTheDetail.iEnterTheComment("Overlaps the audit week")
			.and.iConfirmTheDialogWith("Reject");
		Then.onTheDetail.iSeeTheStatus("Rejected");

		Then.iTeardownMyUIComponent();
	});

	opaTest("an employee withdraws their own pending request", function (Given, When, Then) {
		Given.iStartMyApp("requests/LR00010296");

		Then.onTheDetail.iSeeTheRequestOf("Demo User")
			.and.iSeeTheStatus("Pending");

		When.onTheDetail.iPressWithdraw()
			.and.iConfirmTheDialogWith("OK");

		Then.onTheDetail.iSeeTheStatus("Withdrawn");

		Then.iTeardownMyUIComponent();
	});
});
