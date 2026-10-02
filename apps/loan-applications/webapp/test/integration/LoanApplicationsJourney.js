sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/LoanApplications"
], function (opaTest) {
	"use strict";

	// Records from localService/mockdata/LoanApplications.json (docs/09-test-cases.md, TC-LA-O01..O04)
	QUnit.module("List report");

	opaTest("lists every application and filters by tab", function (Given, When, Then) {
		Given.iStartTheLaunchpadAt("LoanApplication-manage");

		Then.onTheLoanApp.iSeeTheTableTitle("Loan Applications (42)");

		When.onTheLoanApp.iSelectTheTab("Awaiting Decision");
		Then.onTheLoanApp.iSeeTheTableTitle("Loan Applications (18)");

		When.onTheLoanApp.iSelectTheTab("High Risk");
		Then.onTheLoanApp.iSeeTheTableTitle("Loan Applications (29)");

		Then.iTeardownMyApp();
	});

	QUnit.module("Credit decisions");

	opaTest("a low-risk application is approved", function (Given, When, Then) {
		Given.iStartTheLaunchpadAt("LoanApplication-manage&/LoanApplications('LA26000107')");

		Then.onTheLoanApp.iSeeTheApplicant("Nyasha Ncube")
			.and.iSeeTheStatusOf("LA26000107", "Under Review");

		When.onTheLoanApp.iPressTheAction("Approve")
			.and.iEnterTheComment("Income verified with payslips")
			.and.iConfirmTheDialog("Approve");

		Then.onTheLoanApp.iSeeTheStatusOf("LA26000107", "Approved");

		Then.iTeardownMyApp();
	});

	opaTest("credit policy blocks approving a band D application", function (Given, When, Then) {
		Given.iStartTheLaunchpadAt("LoanApplication-manage&/LoanApplications('LA26000114')");

		Then.onTheLoanApp.iSeeTheApplicant("Rudo Moyo");

		When.onTheLoanApp.iPressTheAction("Approve")
			.and.iConfirmTheDialog("Approve");

		Then.onTheLoanApp.iSeeAMessageContaining("credit policy 4.2");

		When.onTheLoanApp.iCloseTheMessage();
		Then.onTheLoanApp.iSeeTheStatusOf("LA26000114", "Submitted");

		Then.iTeardownMyApp();
	});

	opaTest("an application is rejected with a reason", function (Given, When, Then) {
		Given.iStartTheLaunchpadAt("LoanApplication-manage&/LoanApplications('LA26000100')");

		Then.onTheLoanApp.iSeeTheApplicant("Precious Moyo");

		When.onTheLoanApp.iPressTheAction("Reject")
			.and.iEnterTheComment("Employer could not confirm income")
			.and.iConfirmTheDialog("Reject");

		Then.onTheLoanApp.iSeeTheStatusOf("LA26000100", "Rejected");

		Then.iTeardownMyApp();
	});
});
