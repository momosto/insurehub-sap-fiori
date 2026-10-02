sap.ui.define([
	"sap/ui/test/Opa5",
	"./LoanApplicationsJourney"
], function (Opa5) {
	"use strict";

	// Fiori elements V2 needs the launchpad shell services, so the journeys run the real
	// launchpad sandbox (../../../../../launchpad) in a frame and navigate by intent.
	var LAUNCHPAD = sap.ui.require.toUrl("insurehub/lending/loanapplications") + "/../../../launchpad/index.html";

	var Startup = Opa5.extend("insurehub.lending.loanapplications.test.integration.arrangements.Startup", {
		iStartTheLaunchpadAt: function (sIntent) {
			// a failed journey never reaches its teardown; clean up so the next one can start
			if (this.hasAppStartedInAFrame()) {
				this.iTeardownMyAppFrame();
			}
			return this.iStartMyAppInAFrame({
				source: LAUNCHPAD + "#" + sIntent,
				autoWait: true,
				timeout: 90,
				width: 1400,
				height: 900
			});
		}
	});

	Opa5.extendConfig({
		arrangements: new Startup(),
		autoWait: true,
		timeout: 45
	});

	QUnit.start();
});
