sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/base/Log"
], function (MockServer, Log) {
	"use strict";

	var ROOT_URI = "/sap/opu/odata/sap/ZLOAN_APPLICATION_SRV/";
	var APP_PATH = "insurehub/lending/loanapplications/localService";

	// Mock data was generated around this date; see leave-requests for the same idea.
	var DATA_ANCHOR = Date.UTC(2026, 9, 1);
	var WEEK_MS = 7 * 24 * 60 * 60 * 1000;

	var STATUS = {
		APP: { text: "Approved", criticality: 3 },
		REJ: { text: "Rejected", criticality: 1 }
	};

	var oMockServer;

	function shiftDate(sODataDate, iOffset) {
		var iMs = Number(/\/Date\((-?\d+)\)\//.exec(sODataDate)[1]);
		return "/Date(" + (iMs + iOffset) + ")/";
	}

	function shiftMockDates() {
		var iWeeks = Math.floor((Date.now() - DATA_ANCHOR) / WEEK_MS);
		if (iWeeks <= 0) {
			return;
		}
		var iOffset = iWeeks * WEEK_MS;
		oMockServer.setEntitySetData("LoanApplications", oMockServer.getEntitySetData("LoanApplications").map(function (oApp) {
			oApp.SubmittedOn = shiftDate(oApp.SubmittedOn, iOffset);
			return oApp;
		}));
		oMockServer.setEntitySetData("Instalments", oMockServer.getEntitySetData("Instalments").map(function (oInstalment) {
			oInstalment.DueDate = shiftDate(oInstalment.DueDate, iOffset);
			return oInstalment;
		}));
	}

	/**
	 * Same shape as an SAP Gateway error: "transition": true in errordetails tells UI5 the message belongs to
	 * this request only, so Fiori elements shows it in a dialog instead of attaching it to the object.
	 */
	function errorResponse(oXhr, iStatus, sMessage) {
		var sCode = "ZLOAN/" + iStatus;
		oXhr.respondJSON(iStatus, {}, JSON.stringify({
			error: {
				code: sCode,
				message: { lang: "en", value: sMessage },
				innererror: {
					errordetails: [{ code: sCode, message: sMessage, propertyref: "", severity: "error", target: "", transition: true }]
				}
			}
		}));
		return true;
	}

	/**
	 * Simulates the ApproveApplication / RejectApplication function imports,
	 * including the business rules a real backend would enforce.
	 */
	function decisionHandler(sNewStatus) {
		return function (oXhr, sQuery) {
			var mParams = new URLSearchParams(sQuery);
			var fnUnquote = function (sValue) {
				return (sValue || "").replace(/^'(.*)'$/, "$1").replace(/''/g, "'");
			};
			var sId = fnUnquote(mParams.get("ApplicationID"));
			var sComment = fnUnquote(mParams.get("Comment")).trim();

			var aApps = oMockServer.getEntitySetData("LoanApplications");
			var oApp = aApps.find(function (oEntry) {
				return oEntry.ApplicationID === sId;
			});

			if (!oApp) {
				return errorResponse(oXhr, 404, "Loan application " + sId + " not found");
			}
			if (!oApp.IsDecidable) {
				return errorResponse(oXhr, 400, "Application " + sId + " has already been decided");
			}
			if (sNewStatus === "APP" && oApp.RiskBand === "D") {
				return errorResponse(oXhr, 400, "Risk band D applications cannot be approved (credit policy 4.2)");
			}
			if (sNewStatus === "REJ" && !sComment) {
				return errorResponse(oXhr, 400, "A reason is required when rejecting an application");
			}

			oApp.Status = sNewStatus;
			oApp.StatusText = STATUS[sNewStatus].text;
			oApp.StatusCriticality = STATUS[sNewStatus].criticality;
			oApp.DecisionComment = sComment || "Affordability within policy";
			oApp.IsDecidable = false;
			oMockServer.setEntitySetData("LoanApplications", aApps);

			oXhr.respondJSON(200, {}, JSON.stringify({ d: oApp }));
			return true;
		};
	}

	return {
		init: function () {
			// OPA journeys start the app several times; each start gets a fresh copy of the data
			if (oMockServer) {
				oMockServer.destroy();
			}
			oMockServer = new MockServer({ rootUri: ROOT_URI });

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 300
			});

			var sLocalServicePath = sap.ui.require.toUrl(APP_PATH);
			oMockServer.simulate(sLocalServicePath + "/metadata.xml", {
				sMockdataBaseUrl: sLocalServicePath + "/mockdata",
				bGenerateMissingMockData: false
			});

			oMockServer.setRequests(oMockServer.getRequests().concat([
				{ method: "POST", path: /ApproveApplication\?(.*)/, response: decisionHandler("APP") },
				{ method: "POST", path: /RejectApplication\?(.*)/, response: decisionHandler("REJ") }
			]));

			oMockServer.start();
			shiftMockDates();

			Log.info("Loan Applications mock server running at " + ROOT_URI);
			return oMockServer;
		}
	};
});
