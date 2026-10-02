sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./ListJourney",
	"./DecisionJourney",
	"./CreateJourney",
	"./NotFoundJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "insurehub.hr.leaverequests.view.",
		autoWait: true,
		timeout: 30
	});

	QUnit.start();
});
