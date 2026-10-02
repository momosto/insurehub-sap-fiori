sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/base/Log"
], function (MockServer, Log) {
	"use strict";

	var ROOT_URI = "/sap/opu/odata/sap/ZCLAIMS_INSIGHTS_SRV/";
	var APP_PATH = "insurehub/claims/insights/localService";

	// Mock data covers the 12 months before this date; see leave-requests for the same idea.
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
		oMockServer.setEntitySetData("Claims", oMockServer.getEntitySetData("Claims").map(function (oClaim) {
			oClaim.LossDate = shiftDate(oClaim.LossDate, iOffset);
			oClaim.ReportedOn = shiftDate(oClaim.ReportedOn, iOffset);
			return oClaim;
		}));
	}

	return {
		/**
		 * @param {{shiftDates: boolean}} [mOptions] tests pass shiftDates: false (plus a fixed "today" for the app)
		 *   so expected numbers never drift with the calendar
		 */
		init: function (mOptions) {
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

			oMockServer.start();
			if (!mOptions || mOptions.shiftDates !== false) {
				shiftMockDates();
			}

			Log.info("Claims Insights mock server running at " + ROOT_URI);
			return oMockServer;
		}
	};
});
