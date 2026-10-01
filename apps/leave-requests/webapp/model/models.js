sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/Device"
], function (JSONModel, BindingMode, Device) {
	"use strict";

	return {
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode(BindingMode.OneWay);
			return oModel;
		},

		/** UI state shared by all views: flexible column layout and busy flag. */
		createAppViewModel: function () {
			return new JSONModel({
				layout: "OneColumn",
				busy: false,
				currentUser: "Demo User"
			});
		}
	};
});
