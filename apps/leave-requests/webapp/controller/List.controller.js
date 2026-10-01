sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"../model/formatter"
], function (BaseController, JSONModel, Filter, FilterOperator, Sorter, Fragment, MessageToast, MessageBox, formatter) {
	"use strict";

	var ValueState = formatter.ValueState;
	var STATUSES = ["P", "A", "R"];

	return BaseController.extend("insurehub.hr.leaverequests.controller.List", {
		onInit: function () {
			this.setModel(new JSONModel({
				title: this.getResourceBundle().getText("listTitle"),
				status: "ALL",
				counts: {},
				descending: true
			}), "listView");

			this._oList = this.byId("requestList");
			this._sQuery = "";

			this.getRouter().getRoute("list").attachPatternMatched(this._onListMatched, this);
			this.getRouter().getRoute("detail").attachPatternMatched(this._onDetailMatched, this);
		},

		/* =========================================================== */
		/* Routing                                                     */
		/* =========================================================== */

		_onListMatched: function () {
			this._oList.removeSelections(true);
		},

		/** Keeps the list selection in sync when a request is opened by URL. */
		_onDetailMatched: function (oEvent) {
			this._sSelectedId = oEvent.getParameter("arguments").requestId;
			this._selectItem();
		},

		_selectItem: function () {
			var sId = this._sSelectedId;
			var oItem = this._oList.getItems().find(function (oListItem) {
				return oListItem.getBindingContext().getProperty("RequestId") === sId;
			});
			if (oItem) {
				this._oList.setSelectedItem(oItem);
			}
		},

		/* =========================================================== */
		/* List events                                                 */
		/* =========================================================== */

		onUpdateFinished: function (oEvent) {
			var iTotal = oEvent.getParameter("total");
			var oBundle = this.getResourceBundle();
			this.getModel("listView").setProperty("/title",
				this._oList.getBinding("items").isLengthFinal()
					? oBundle.getText("listCountTitle", [iTotal])
					: oBundle.getText("listTitle"));
			this._updateCounts();
			if (this._sSelectedId) {
				this._selectItem();
			}
		},

		onSelectionChange: function (oEvent) {
			this._showDetail(oEvent.getParameter("listItem"));
		},

		onItemPress: function (oEvent) {
			this._showDetail(oEvent.getSource());
		},

		_showDetail: function (oItem) {
			this.getRouter().navTo("detail", {
				requestId: oItem.getBindingContext().getProperty("RequestId")
			}, !this.getModel("device").getProperty("/system/phone"));
		},

		onStatusSelect: function () {
			this._applyFilters();
		},

		onSearch: function (oEvent) {
			this._sQuery = (oEvent.getParameter("query") || "").trim();
			this._applyFilters();
		},

		onSort: function () {
			var oListView = this.getModel("listView");
			var bDescending = !oListView.getProperty("/descending");
			oListView.setProperty("/descending", bDescending);
			this._oList.getBinding("items").sort(new Sorter("StartDate", bDescending));
		},

		/* =========================================================== */
		/* Filtering and tab counts                                    */
		/* =========================================================== */

		/** Search filter only, shared by the list and the tab counters. */
		_getSearchFilters: function () {
			if (!this._sQuery) {
				return [];
			}
			return [new Filter({
				filters: [
					new Filter("EmployeeName", FilterOperator.Contains, this._sQuery),
					new Filter("LeaveTypeText", FilterOperator.Contains, this._sQuery)
				],
				and: false
			})];
		},

		_applyFilters: function () {
			var sStatus = this.getModel("listView").getProperty("/status");
			var aFilters = this._getSearchFilters();
			if (sStatus !== "ALL") {
				aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
			}
			this._oList.getBinding("items").filter(aFilters, "Application");
		},

		/**
		 * Reads $count per status so every tab shows how many requests it holds,
		 * respecting the current search term.
		 */
		_updateCounts: function () {
			var oModel = this.getModel();
			var oListView = this.getModel("listView");
			var aSearch = this._getSearchFilters();

			var fnRead = function (sKey, aFilters) {
				oModel.read("/LeaveRequests/$count", {
					filters: aFilters,
					success: function (iCount) {
						oListView.setProperty("/counts/" + sKey, Number(iCount));
					}
				});
			};

			fnRead("ALL", aSearch);
			STATUSES.forEach(function (sStatus) {
				fnRead(sStatus, aSearch.concat(new Filter("Status", FilterOperator.EQ, sStatus)));
			});
		},

		formatPeriod: function (sStart, sEnd) {
			return sStart === sEnd ? sStart : sStart + " – " + sEnd;
		},

		/* =========================================================== */
		/* Create a leave request                                      */
		/* =========================================================== */

		onCreate: function () {
			var oToday = new Date();
			oToday.setHours(0, 0, 0, 0);

			this.setModel(new JSONModel({
				LeaveType: "",
				StartDate: null,
				EndDate: null,
				Days: 0,
				Reason: "",
				minDate: oToday,
				periodState: ValueState.None,
				periodStateText: "",
				valid: false
			}), "create");

			if (!this._pCreateDialog) {
				this._pCreateDialog = Fragment.load({
					id: this.getView().getId(),
					name: "insurehub.hr.leaverequests.fragment.CreateDialog",
					controller: this
				}).then(function (oDialog) {
					this.getView().addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			this._pCreateDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		onCreateInputChange: function () {
			this._validateCreate(true);
		},

		/**
		 * Validates the period against the chosen leave type's balance.
		 * @param {boolean} bShowErrors false to only compute validity (e.g. on open)
		 * @returns {boolean} whether the request can be submitted
		 */
		_validateCreate: function (bShowErrors) {
			var oCreate = this.getModel("create");
			var oData = oCreate.getData();
			var oBundle = this.getResourceBundle();
			var iDays = formatter.countWorkingDays(oData.StartDate, oData.EndDate);
			var sError = "";

			if (!oData.StartDate || !oData.EndDate) {
				sError = oBundle.getText("errPeriodRequired");
			} else if (oData.StartDate < oData.minDate) {
				sError = oBundle.getText("errPeriodInPast");
			} else if (iDays === 0) {
				sError = oBundle.getText("errNoWorkingDays");
			} else {
				var oType = this._getLeaveType(oData.LeaveType);
				if (oType && iDays > oType.Balance) {
					sError = oBundle.getText("errOverBalance", [oType.Balance, oType.Text]);
				}
			}

			oCreate.setProperty("/Days", iDays);
			oCreate.setProperty("/valid", !sError && !!oData.LeaveType);
			if (bShowErrors) {
				oCreate.setProperty("/periodState", sError ? ValueState.Error : ValueState.Success);
				oCreate.setProperty("/periodStateText", sError);
			}
			return !sError;
		},

		_getLeaveType: function (sCode) {
			var oModel = this.getModel();
			return sCode ? oModel.getObject(oModel.createKey("/LeaveTypes", { Code: sCode })) : null;
		},

		onCreateSubmit: function () {
			if (!this._validateCreate(true)) {
				return;
			}
			var oData = this.getModel("create").getData();
			var oType = this._getLeaveType(oData.LeaveType);
			var oAppView = this.getModel("appView");
			// The mock service cannot generate keys, so the client proposes one.
			// A real Gateway service would assign it in CREATE_ENTITY and ignore this value.
			var sId = "LR" + Date.now().toString().slice(-8);

			var oPayload = {
				RequestId: sId,
				EmployeeName: oAppView.getProperty("/currentUser"),
				LeaveType: oData.LeaveType,
				LeaveTypeText: oType ? oType.Text : "",
				StartDate: formatter.toUTCDate(oData.StartDate),
				EndDate: formatter.toUTCDate(oData.EndDate),
				Days: oData.Days,
				Reason: oData.Reason,
				Status: "P",
				ManagerComment: "",
				CreatedAt: new Date()
			};

			oAppView.setProperty("/busy", true);
			this.getModel().create("/LeaveRequests", oPayload, {
				success: function () {
					oAppView.setProperty("/busy", false);
					this.byId("createDialog").close();
					MessageToast.show(this.getResourceBundle().getText("createSuccess", [sId]));
					this.getRouter().navTo("detail", { requestId: sId });
				}.bind(this),
				error: function (oError) {
					oAppView.setProperty("/busy", false);
					MessageBox.error(this.getErrorMessage(oError));
				}.bind(this)
			});
		},

		onCreateCancel: function () {
			this.byId("createDialog").close();
		},

		onCreateDialogClosed: function () {
			this.getModel("create").setData({});
		}
	});
});
