sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device"
], function (UIComponent, Device) {
	"use strict";

	return UIComponent.extend("insurehub.claims.insights.Component", {
		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},

		/**
		 * Compact density on devices with a mouse, cozy (touch-friendly) otherwise.
		 * The Fiori launchpad sets the class itself, so we only add it when running standalone.
		 * @returns {string} the CSS class for the content density
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else {
					this._sContentDensityClass = Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
				}
			}
			return this._sContentDensityClass;
		}
	});
});
