sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, Fragment, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("insurehub.hr.leaverequests.controller.Detail", {
		onInit: function () {
			this.setModel(new JSONModel({ busy: false }), "detailView");
			this.setModel(new JSONModel({ approve: true, title: "", comment: "" }), "decision");
			this.getRouter().getRoute("detail").attachPatternMatched(this._onDetailMatched, this);
		},

		_onDetailMatched: function (oEvent) {
			var sRequestId = oEvent.getParameter("arguments").requestId;
			var oModel = this.getModel();
			oModel.metadataLoaded().then(function () {
				this._bindView(oModel.createKey("/LeaveRequests", { RequestId: sRequestId }));
			}.bind(this));
		},

		_bindView: function (sPath) {
			var oDetailView = this.getModel("detailView");
			this.getView().bindElement({
				path: sPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDetailView.setProperty("/busy", true);
					},
					dataReceived: function () {
						oDetailView.setProperty("/busy", false);
					}
				}
			});
		},

		/** A deep link to a missing request shows the "not found" page instead of an empty form. */
		_onBindingChange: function () {
			var oElementBinding = this.getView().getElementBinding();
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		},

		/* =========================================================== */
		/* Layout actions                                              */
		/* =========================================================== */

		onClose: function () {
			this.getRouter().navTo("list");
		},

		onToggleFullScreen: function () {
			var oAppView = this.getModel("appView");
			var bFull = oAppView.getProperty("/layout") === "MidColumnFullScreen";
			oAppView.setProperty("/layout", bFull ? "TwoColumnsMidExpanded" : "MidColumnFullScreen");
		},

		/* =========================================================== */
		/* Approve / reject (OData function imports)                   */
		/* =========================================================== */

		onApprove: function () {
			this._openDecisionDialog(true);
		},

		onReject: function () {
			this._openDecisionDialog(false);
		},

		_openDecisionDialog: function (bApprove) {
			var oBundle = this.getResourceBundle();
			this.getModel("decision").setData({
				approve: bApprove,
				title: oBundle.getText(bApprove ? "decisionApproveTitle" : "decisionRejectTitle"),
				comment: ""
			});

			if (!this._pDecisionDialog) {
				this._pDecisionDialog = Fragment.load({
					id: this.getView().getId(),
					name: "insurehub.hr.leaverequests.fragment.DecisionDialog",
					controller: this
				}).then(function (oDialog) {
					this.getView().addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			this._pDecisionDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		onDecisionCancel: function () {
			this.byId("decisionDialog").close();
		},

		onDecisionConfirm: function () {
			var oDecision = this.getModel("decision").getData();
			var sComment = (oDecision.comment || "").trim();
			var oBundle = this.getResourceBundle();

			if (!oDecision.approve && !sComment) {
				MessageToast.show(oBundle.getText("decisionCommentRequired"));
				return;
			}

			var oModel = this.getModel();
			var oDetailView = this.getModel("detailView");
			var sRequestId = this.getView().getBindingContext().getProperty("RequestId");

			this.byId("decisionDialog").close();
			oDetailView.setProperty("/busy", true);

			oModel.callFunction(oDecision.approve ? "/ApproveLeave" : "/RejectLeave", {
				method: "POST",
				urlParameters: {
					RequestId: sRequestId,
					Comment: sComment
				},
				success: function () {
					oDetailView.setProperty("/busy", false);
					MessageToast.show(oBundle.getText(oDecision.approve ? "approveSuccess" : "rejectSuccess"));
					oModel.refresh(true);
				},
				error: function (oError) {
					oDetailView.setProperty("/busy", false);
					MessageBox.error(this.getErrorMessage(oError));
				}.bind(this)
			});
		},

		/* =========================================================== */
		/* Withdraw (OData MERGE)                                      */
		/* =========================================================== */

		onWithdraw: function () {
			var oBundle = this.getResourceBundle();
			MessageBox.confirm(oBundle.getText("withdrawConfirm"), {
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === MessageBox.Action.OK) {
						this._withdraw();
					}
				}.bind(this)
			});
		},

		_withdraw: function () {
			var oModel = this.getModel();
			var sPath = this.getView().getBindingContext().getPath();
			var oDetailView = this.getModel("detailView");

			oDetailView.setProperty("/busy", true);
			oModel.update(sPath, { Status: "W" }, {
				success: function () {
					oDetailView.setProperty("/busy", false);
					MessageToast.show(this.getResourceBundle().getText("withdrawSuccess"));
					oModel.refresh(true);
				}.bind(this),
				error: function (oError) {
					oDetailView.setProperty("/busy", false);
					MessageBox.error(this.getErrorMessage(oError));
				}.bind(this)
			});
		}
	});
});
