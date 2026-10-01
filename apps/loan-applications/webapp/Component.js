sap.ui.define([
	"sap/suite/ui/generic/template/lib/AppComponent"
], function (AppComponent) {
	"use strict";

	// Fiori elements builds the List Report and Object Page from the manifest's
	// "sap.ui.generic.app" section and the OData annotations. No views or controllers needed.
	return AppComponent.extend("insurehub.lending.loanapplications.Component", {
		metadata: {
			manifest: "json"
		}
	});
});
