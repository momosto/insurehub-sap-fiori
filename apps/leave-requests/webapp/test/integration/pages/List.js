sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/AggregationLengthEquals"
], function (Opa5, Press, EnterText, BindingPath, PropertyStrictEquals, AggregationLengthEquals) {
	"use strict";

	var VIEW = "List";

	/** Next Monday at least a week away, so the period is always in the future and starts on a weekday. */
	function futureMonday() {
		var oDate = new Date();
		oDate.setHours(0, 0, 0, 0);
		oDate.setDate(oDate.getDate() + 7 + ((8 - oDate.getDay()) % 7));
		return oDate;
	}

	Opa5.createPageObjects({
		onTheList: {
			actions: {
				iSearchFor: function (sText) {
					return this.waitFor({
						id: "searchField",
						viewName: VIEW,
						actions: new EnterText({ text: sText, pressEnterKey: true }),
						errorMessage: "Search field not found"
					});
				},

				iSelectTheTab: function (sKey) {
					return this.waitFor({
						controlType: "sap.m.IconTabFilter",
						viewName: VIEW,
						matchers: new PropertyStrictEquals({ name: "key", value: sKey }),
						actions: new Press(),
						errorMessage: "Tab " + sKey + " not found"
					});
				},

				iOpenTheRequest: function (sRequestId) {
					return this.waitFor({
						controlType: "sap.m.ObjectListItem",
						viewName: VIEW,
						matchers: new BindingPath({ path: "/LeaveRequests('" + sRequestId + "')" }),
						actions: new Press(),
						errorMessage: "Request " + sRequestId + " is not in the list"
					});
				},

				iPressCreate: function () {
					return this.waitFor({
						id: "createButton",
						viewName: VIEW,
						actions: new Press(),
						errorMessage: "Create button not found"
					});
				},

				iChooseTheLeaveType: function (sCode) {
					return this.waitFor({
						id: "leaveTypeSelect",
						viewName: VIEW,
						actions: function (oSelect) {
							oSelect.setSelectedKey(sCode);
							oSelect.fireChange({ selectedItem: oSelect.getSelectedItem() });
						},
						errorMessage: "Leave type select not found"
					});
				},

				iChooseAPeriodOfWorkingDays: function (iDays) {
					return this.waitFor({
						id: "periodPicker",
						viewName: VIEW,
						actions: function (oPicker) {
							var oStart = futureMonday();
							var oEnd = new Date(oStart);
							oEnd.setDate(oStart.getDate() + iDays - 1);
							oPicker.setDateValue(oStart);
							oPicker.setSecondDateValue(oEnd);
							oPicker.fireChange({ valid: true });
						},
						errorMessage: "Period picker not found"
					});
				},

				iPressSubmit: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						searchOpenDialogs: true,
						matchers: new PropertyStrictEquals({ name: "text", value: "Submit" }),
						actions: new Press(),
						errorMessage: "Submit button not found or disabled"
					});
				}
			},

			assertions: {
				iSeeTheTitleWithCount: function (iCount) {
					return this.waitFor({
						id: "listTitle",
						viewName: VIEW,
						matchers: new PropertyStrictEquals({ name: "text", value: "Leave Requests (" + iCount + ")" }),
						success: function () {
							Opa5.assert.ok(true, "The title shows " + iCount + " requests");
						},
						errorMessage: "The title does not show " + iCount + " requests"
					});
				},

				iSeeItems: function (iCount) {
					return this.waitFor({
						id: "requestList",
						viewName: VIEW,
						matchers: new AggregationLengthEquals({ name: "items", length: iCount }),
						success: function () {
							Opa5.assert.ok(true, "The list has " + iCount + " items");
						},
						errorMessage: "The list does not have " + iCount + " items"
					});
				},

				iSeeTheTabCount: function (sKey, iCount) {
					return this.waitFor({
						controlType: "sap.m.IconTabFilter",
						viewName: VIEW,
						matchers: [
							new PropertyStrictEquals({ name: "key", value: sKey }),
							new PropertyStrictEquals({ name: "count", value: String(iCount) })
						],
						success: function () {
							Opa5.assert.ok(true, "Tab " + sKey + " counts " + iCount);
						},
						errorMessage: "Tab " + sKey + " does not count " + iCount
					});
				},

				iSeeOnlyItemsWithStatus: function (sStatusText) {
					return this.waitFor({
						id: "requestList",
						viewName: VIEW,
						success: function (oList) {
							var aTexts = oList.getItems().map(function (oItem) {
								return oItem.getFirstStatus().getText();
							});
							Opa5.assert.ok(aTexts.length > 0 && aTexts.every(function (s) {
								return s === sStatusText;
							}), aTexts.length + " items, all " + sStatusText);
						}
					});
				},

				iSeeTheWorkingDays: function (iDays) {
					return this.waitFor({
						controlType: "sap.m.ObjectNumber",
						searchOpenDialogs: true,
						matchers: new PropertyStrictEquals({ name: "number", value: String(iDays) }),
						success: function () {
							Opa5.assert.ok(true, "The dialog counts " + iDays + " working days");
						},
						errorMessage: "The dialog does not count " + iDays + " working days"
					});
				}
			}
		}
	});
});
