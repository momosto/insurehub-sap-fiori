sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/base/Log"
], function (MockServer, Log) {
	"use strict";

	var ROOT_URI = "/sap/opu/odata/sap/ZHR_LEAVE_SRV/";
	var APP_PATH = "insurehub/hr/leaverequests/localService";

	// The mock data was written around this date. Dates are moved forward in whole
	// weeks so the demo always has upcoming requests and weekdays stay weekdays.
	var DATA_ANCHOR = Date.UTC(2026, 9, 1);
	var WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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
		var aRequests = oMockServer.getEntitySetData("LeaveRequests").map(function (oRequest) {
			oRequest.StartDate = shiftDate(oRequest.StartDate, iOffset);
			oRequest.EndDate = shiftDate(oRequest.EndDate, iOffset);
			oRequest.CreatedAt = shiftDate(oRequest.CreatedAt, iOffset);
			return oRequest;
		});
		oMockServer.setEntitySetData("LeaveRequests", aRequests);
	}

	/**
	 * Simulates the ApproveLeave / RejectLeave function imports that a
	 * Gateway service would implement in EXECUTE_ACTION.
	 */
	function decisionHandler(sNewStatus) {
		return function (oXhr, sQuery) {
			var mParams = new URLSearchParams(sQuery);
			// OData V2 passes string parameters as quoted literals: RequestId='LR0001'
			var fnUnquote = function (sValue) {
				return (sValue || "").replace(/^'(.*)'$/, "$1").replace(/''/g, "'");
			};
			var sRequestId = fnUnquote(mParams.get("RequestId"));
			var sComment = fnUnquote(mParams.get("Comment"));

			var aRequests = oMockServer.getEntitySetData("LeaveRequests");
			var oRequest = aRequests.find(function (oEntry) {
				return oEntry.RequestId === sRequestId;
			});

			if (!oRequest) {
				oXhr.respondJSON(404, {}, JSON.stringify({ error: { message: { value: "Leave request " + sRequestId + " not found" } } }));
				return true;
			}
			if (oRequest.Status !== "P") {
				oXhr.respondJSON(400, {}, JSON.stringify({ error: { message: { value: "Only pending requests can be decided" } } }));
				return true;
			}

			oRequest.Status = sNewStatus;
			oRequest.ManagerComment = sComment;
			oMockServer.setEntitySetData("LeaveRequests", aRequests);

			oXhr.respondJSON(200, {}, JSON.stringify({ d: oRequest }));
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
				autoRespondAfter: 400
			});

			var sLocalServicePath = sap.ui.require.toUrl(APP_PATH);
			oMockServer.simulate(sLocalServicePath + "/metadata.xml", {
				sMockdataBaseUrl: sLocalServicePath + "/mockdata",
				bGenerateMissingMockData: false
			});

			oMockServer.setRequests(oMockServer.getRequests().concat([
				{ method: "POST", path: /ApproveLeave\?(.*)/, response: decisionHandler("A") },
				{ method: "POST", path: /RejectLeave\?(.*)/, response: decisionHandler("R") }
			]));

			oMockServer.start();
			shiftMockDates();

			Log.info("Leave Requests mock server running at " + ROOT_URI);
			return oMockServer;
		}
	};
});
