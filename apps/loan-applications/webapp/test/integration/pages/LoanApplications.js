sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, Press, EnterText, PropertyStrictEquals) {
	"use strict";

	/*
	 * Fiori elements generates the List Report and Object Page, so there are no hand-written view IDs.
	 * The page object finds controls by type, text and binding path instead.
	 */

	function boundTo(sId) {
		var sPath = "/LoanApplications('" + sId + "')";
		return function (oControl) {
			var oContext = oControl.getBindingContext();
			return !!oContext && oContext.getPath() === sPath;
		};
	}

	function textOf(oControl) {
		return (oControl.getText && oControl.getText()) || (oControl.getTitle && oControl.getTitle()) || "";
	}

	/** Presses the first enabled, visible button with this text (footer and toolbar can both have one). */
	function pressButton(sText, bInDialog) {
		return {
			controlType: "sap.m.Button",
			searchOpenDialogs: !!bInDialog,
			matchers: new PropertyStrictEquals({ name: "text", value: sText }),
			success: function (aButtons) {
				new Press().executeOn(aButtons[0]);
			},
			errorMessage: "No enabled '" + sText + "' button" + (bInDialog ? " in the open dialog" : "")
		};
	}

	Opa5.createPageObjects({
		onTheLoanApp: {
			actions: {
				iSelectTheTab: function (sTextStart) {
					return this.waitFor({
						controlType: "sap.m.IconTabFilter",
						matchers: function (oTab) {
							return oTab.getText().indexOf(sTextStart) === 0;
						},
						actions: new Press(),
						errorMessage: "No tab starting with '" + sTextStart + "'"
					});
				},

				iOpenTheApplication: function (sId) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: boundTo(sId),
						actions: new Press(),
						errorMessage: "Application " + sId + " is not in the table"
					});
				},

				iPressTheAction: function (sText) {
					return this.waitFor(pressButton(sText, false));
				},

				iEnterTheComment: function (sText) {
					return this.waitFor({
						controlType: "sap.m.InputBase",
						searchOpenDialogs: true,
						actions: new EnterText({ text: sText }),
						errorMessage: "No comment field in the action dialog"
					});
				},

				iConfirmTheDialog: function (sText) {
					return this.waitFor(pressButton(sText, true));
				},

				iCloseTheMessage: function () {
					return this.waitFor(pressButton("Close", true));
				}
			},

			assertions: {
				iSeeTheTableTitle: function (sText) {
					return this.waitFor({
						controlType: "sap.m.Title",
						matchers: new PropertyStrictEquals({ name: "text", value: sText }),
						success: function () {
							Opa5.assert.ok(true, "Table title: " + sText);
						},
						errorMessage: "No table title '" + sText + "'"
					});
				},

				iSeeTheApplicant: function (sName) {
					return this.waitFor({
						controlType: "sap.m.Title",
						matchers: new PropertyStrictEquals({ name: "text", value: sName }),
						success: function () {
							Opa5.assert.ok(true, "Object page shows " + sName);
						},
						errorMessage: "Object page does not show " + sName
					});
				},

				iSeeTheStatusOf: function (sId, sStatus) {
					return this.waitFor({
						controlType: "sap.m.ObjectStatus",
						matchers: function (oStatus) {
							return boundTo(sId)(oStatus) && oStatus.getText() === sStatus;
						},
						success: function () {
							Opa5.assert.ok(true, sId + " is " + sStatus);
						},
						errorMessage: sId + " does not show status " + sStatus
					});
				},

				iSeeAMessageContaining: function (sText) {
					return this.waitFor({
						searchOpenDialogs: true,
						matchers: function (oControl) {
							return textOf(oControl).indexOf(sText) !== -1;
						},
						success: function () {
							Opa5.assert.ok(true, "Message shown: " + sText);
						},
						errorMessage: "No open dialog says '" + sText + "'"
					});
				}
			}
		}
	});
});
