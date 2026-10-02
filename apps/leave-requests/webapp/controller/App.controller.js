sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	// The column layout follows the route; Component.js owns that so deep links work.
	return BaseController.extend("insurehub.hr.leaverequests.controller.App", {
		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});
