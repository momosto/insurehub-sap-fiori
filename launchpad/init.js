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
	});
});
