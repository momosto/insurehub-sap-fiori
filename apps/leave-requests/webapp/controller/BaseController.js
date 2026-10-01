sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/base/strings/formatMessage",
	"../model/formatter"
], function (Controller, History, formatMessage, formatter) {
	"use strict";

	/**
	 * Shared helpers for every controller in the app, so views stay free of
	 * plumbing (router, models, i18n) and each controller only holds its own logic.
	 */
	return Controller.extend("insurehub.hr.leaverequests.controller.BaseController", {
		formatter: formatter,

		formatMessage: formatMessage,

		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Reads the most useful message out of an OData V2 error response.
		 * @param {object} oError error passed to the ODataModel error callback
		 * @returns {string} human-readable message
		 */
		getErrorMessage: function (oError) {
			try {
				return JSON.parse(oError.responseText).error.message.value;
			} catch (e) {
				return this.getResourceBundle().getText("genericError");
			}
		},

		/** Goes back in the browser history, or to the list if there is none (e.g. deep link). */
		onNavBack: function () {
			if (History.getInstance().getPreviousHash() !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("list", {}, true);
			}
		}
	});
});
