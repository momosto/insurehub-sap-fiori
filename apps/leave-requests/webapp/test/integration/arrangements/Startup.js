sap.ui.define([
	"sap/ui/test/Opa5",
	"insurehub/hr/leaverequests/localService/mockserver"
], function (Opa5, mockserver) {
	"use strict";

	return Opa5.extend("insurehub.hr.leaverequests.test.integration.arrangements.Startup", {
		/**
		 * Starts the component on a fresh mock service, optionally at a deep link.
		 * @param {string} [sHash] e.g. "requests/LR00010222"
		 */
		iStartMyApp: function (sHash) {
			// a failed journey never reaches its teardown; clean up so the next one can start
			if (this.hasUIComponentStarted()) {
				this.iTeardownMyUIComponent();
			}
			mockserver.init();
			return this.iStartMyUIComponent({
				componentConfig: { name: "insurehub.hr.leaverequests", async: true, manifest: true },
				hash: sHash || "",
				autoWait: true
			});
		}
	});
});
