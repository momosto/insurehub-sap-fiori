sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("insurehub.hr.leaverequests.controller.App", {
		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.getRouter().attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
		},

		/**
		 * One column for the list, two for list + detail. A full-screen detail
		 * stays full screen when the user moves to another request.
		 */
		_onBeforeRouteMatched: function (oEvent) {
			var oAppView = this.getModel("appView");
			var sRoute = oEvent.getParameter("name");
			if (sRoute === "list") {
				oAppView.setProperty("/layout", "OneColumn");
			} else if (oAppView.getProperty("/layout") !== "MidColumnFullScreen") {
				oAppView.setProperty("/layout", "TwoColumnsMidExpanded");
			}
		}
	});
});
