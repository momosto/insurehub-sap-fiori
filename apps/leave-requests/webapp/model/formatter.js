sap.ui.define([
	"sap/ui/core/library"
], function (coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	var formatter = {
		/**
		 * Maps the backend status code to a translated text.
		 * Called with the controller as "this", so it can reach the resource bundle.
		 * @param {string} sStatus P (pending), A (approved), R (rejected), W (withdrawn)
		 * @returns {string} translated status
		 */
		statusText: function (sStatus) {
			if (!sStatus) {
				return "";
			}
			return this.getResourceBundle().getText("status" + sStatus);
		},

		/**
		 * @param {string} sStatus status code
		 * @returns {sap.ui.core.ValueState} semantic colour for ObjectStatus
		 */
		statusState: function (sStatus) {
			switch (sStatus) {
				case "A": return ValueState.Success;
				case "R": return ValueState.Error;
				case "P": return ValueState.Warning;
				default: return ValueState.None;
			}
		},

		statusIcon: function (sStatus) {
			switch (sStatus) {
				case "A": return "sap-icon://accept";
				case "R": return "sap-icon://decline";
				case "P": return "sap-icon://pending";
				default: return "sap-icon://undo";
			}
		},

		/**
		 * Counts working days (Mon–Fri) between two dates, both inclusive.
		 * Public holidays are out of scope for the demo.
		 * @param {Date} oStart first day of leave
		 * @param {Date} oEnd last day of leave
		 * @returns {number} number of working days, 0 if the range is invalid
		 */
		countWorkingDays: function (oStart, oEnd) {
			if (!(oStart instanceof Date) || !(oEnd instanceof Date) || oEnd < oStart) {
				return 0;
			}
			var oDay = new Date(oStart.getFullYear(), oStart.getMonth(), oStart.getDate());
			var oLast = new Date(oEnd.getFullYear(), oEnd.getMonth(), oEnd.getDate());
			var iDays = 0;
			while (oDay <= oLast) {
				var iWeekday = oDay.getDay();
				if (iWeekday !== 0 && iWeekday !== 6) {
					iDays++;
				}
				oDay.setDate(oDay.getDate() + 1);
			}
			return iDays;
		},

		/**
		 * Returns the date at midnight UTC for the same calendar day.
		 * Edm.DateTime values are stored in UTC, so this stops a user in UTC+2
		 * from saving 2026-10-05 as 2026-10-04T22:00Z.
		 * @param {Date} oDate local date
		 * @returns {Date|null} date at 00:00 UTC
		 */
		toUTCDate: function (oDate) {
			if (!(oDate instanceof Date)) {
				return null;
			}
			return new Date(Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate()));
		}
	};

	formatter.ValueState = ValueState;

	return formatter;
});
