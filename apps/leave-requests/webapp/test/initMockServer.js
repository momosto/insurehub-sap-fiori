sap.ui.define([
	"../localService/mockserver"
], function (mockserver) {
	"use strict";

	// Start the mock OData service first, then let ComponentSupport create the app
	// from the data-sap-ui-component div in index.html.
	mockserver.init();
	sap.ui.require(["sap/ui/core/ComponentSupport"]);
});
