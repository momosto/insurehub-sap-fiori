sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (opaTest, Opa5, PropertyStrictEquals) {
	"use strict";

	QUnit.module("Deep links");

	opaTest("a link to a missing request shows 'not found'", function (Given, When, Then) {
		Given.iStartMyApp("requests/LR99999999");

		Then.waitFor({
			controlType: "sap.m.IllustratedMessage",
			matchers: new PropertyStrictEquals({ name: "title", value: "Request not found" }),
			success: function () {
				Opa5.assert.ok(true, "The not-found page is shown");
			},
			errorMessage: "The not-found page was not shown"
		});

		Then.iTeardownMyUIComponent();
	});
});
