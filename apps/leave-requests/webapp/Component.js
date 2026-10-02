sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("insurehub.hr.leaverequests.Component", {
		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createAppViewModel(), "appView");

			// Attached here, not in the App controller: the root view is created asynchronously,
			// so on a deep link the first route would match before the controller exists.
			this.getRouter().attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
			this.getRouter().initialize();
		},

		/**
		 * One column for the list, two for list + detail. A full-screen detail
		 * stays full screen when the user moves to another request.
		 */
		_onBeforeRouteMatched: function (oEvent) {
			var oAppView = this.getModel("appView");
			if (oEvent.getParameter("name") === "list") {
				oAppView.setProperty("/layout", "OneColumn");
			} else if (oAppView.getProperty("/layout") !== "MidColumnFullScreen") {
				oAppView.setProperty("/layout", "TwoColumnsMidExpanded");
			}
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
