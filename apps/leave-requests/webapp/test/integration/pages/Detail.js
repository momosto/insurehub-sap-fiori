sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor"
], function (Opa5, Press, EnterText, PropertyStrictEquals, Ancestor) {
	"use strict";

	var VIEW = "Detail";

	function pressDialogButton(sText) {
		return {
			controlType: "sap.m.Button",
			searchOpenDialogs: true,
			matchers: new PropertyStrictEquals({ name: "text", value: sText }),
			actions: new Press(),
			errorMessage: "No enabled '" + sText + "' button in the open dialog"
		};
	}

	Opa5.createPageObjects({
		onTheDetail: {
			actions: {
				iPressApprove: function () {
					return this.waitFor({ id: "approveButton", viewName: VIEW, actions: new Press() });
				},

				iPressReject: function () {
					return this.waitFor({ id: "rejectButton", viewName: VIEW, actions: new Press() });
				},

				iPressWithdraw: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: VIEW,
						matchers: new PropertyStrictEquals({ name: "text", value: "Withdraw" }),
						actions: new Press(),
						errorMessage: "Withdraw button not visible"
					});
				},

				iEnterTheComment: function (sText) {
					return this.waitFor({
						id: "decisionComment",
						viewName: VIEW,
						searchOpenDialogs: true,
						actions: new EnterText({ text: sText }),
						errorMessage: "Comment field not found"
					});
				},

				iConfirmTheDialogWith: function (sText) {
					return this.waitFor(pressDialogButton(sText));
				}
			},

			assertions: {
				iSeeTheRequestOf: function (sEmployee) {
					return this.waitFor({
						controlType: "sap.m.Title",
						viewName: VIEW,
						matchers: new PropertyStrictEquals({ name: "text", value: sEmployee }),
						success: function () {
							Opa5.assert.ok(true, "The detail shows " + sEmployee);
						},
						errorMessage: "The detail does not show " + sEmployee
					});
				},

				iSeeTheStatus: function (sStatusText) {
					return this.waitFor({
						id: "objectPage",
						viewName: VIEW,
						success: function (oPage) {
							return this.waitFor({
								controlType: "sap.m.ObjectStatus",
								matchers: [
									new Ancestor(oPage),
									new PropertyStrictEquals({ name: "text", value: sStatusText })
								],
								success: function () {
									Opa5.assert.ok(true, "The status is " + sStatusText);
								},
								errorMessage: "The status is not " + sStatusText
							});
						}
					});
				},

				iSeeTheDialogButtonDisabled: function (sText) {
					return this.waitFor({
						controlType: "sap.m.Button",
						searchOpenDialogs: true,
						enabled: false,
						matchers: new PropertyStrictEquals({ name: "text", value: sText }),
						success: function (aButtons) {
							Opa5.assert.strictEqual(aButtons[0].getEnabled(), false, "'" + sText + "' is disabled");
						},
						errorMessage: "No '" + sText + "' button in the open dialog"
					});
				},

				iDoNotSeeTheDecisionButtons: function () {
					return this.waitFor({
						id: "objectPage",
						viewName: VIEW,
						success: function (oPage) {
							Opa5.assert.strictEqual(oPage.getShowFooter(), false, "Approve/Reject are hidden once decided");
						}
					});
				}
			}
		}
	});
});
