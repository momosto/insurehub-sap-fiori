sap.ui.define([
	"insurehub/hr/leaverequests/localService/mockserver",
	"insurehub/lending/loanapplications/localService/mockserver",
	"insurehub/claims/insights/localService/mockserver"
], function (leaveMock, loanMock, claimsMock) {
	"use strict";

	// Every app keeps its own Gateway service URL; one MockServer per service answers locally.
	leaveMock.init();
	loanMock.init();
	claimsMock.init();

	sap.ushell.Container.createRenderer("fiori2", true).then(function (oRenderer) {
		oRenderer.placeAt("content");
		warmUpFioriElements();
	});

	/*
	 * Loan Applications (Fiori elements) needs ~10 libraries. Loaded on demand, their modules arrive one
	 * request at a time before the library bundles do (300+ requests). Starting the bundles in the background
	 * once the shell is up keeps the home page light and makes the app open from a few large files instead.
	 */
	function warmUpFioriElements() {
		sap.ui.require(["sap/ui/core/Lib"], function (Lib) {
			["sap.ui.comp", "sap.ui.generic.app", "sap.suite.ui.generic.template", "sap.uxap", "sap.f", "sap.ui.layout"]
				.forEach(function (sName) {
					Lib.load({ name: sName }).catch(function () {
						// the app loads whatever is missing itself
					});
				});
		});
	}
});
