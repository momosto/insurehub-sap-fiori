sap.ui.define([
	"sap/ui/test/Opa5",
	"insurehub/claims/insights/localService/mockserver",
	"./OverviewJourney"
], function (Opa5, mockserver) {
	"use strict";

	var Startup = Opa5.extend("insurehub.claims.insights.test.integration.arrangements.Startup", {
		/** Fresh, unshifted mock data and a fixed "today", so the expected numbers never move. */
		iStartMyApp: function () {
			if (this.hasUIComponentStarted()) {
				this.iTeardownMyUIComponent();
			}
			mockserver.init({ shiftDates: false });
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "insurehub.claims.insights",
					async: true,
					manifest: true,
					componentData: { today: "2026-10-01T00:00:00Z" }
				},
				autoWait: true
			});
		}
	});

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "insurehub.claims.insights.view.",
		autoWait: true,
		timeout: 30
	});

	QUnit.start();
});
