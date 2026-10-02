sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/library",
	"sap/m/library"
], function (NumberFormat, coreLibrary, mLibrary) {
	"use strict";

	var ValueColor = mLibrary.ValueColor;
	var ValueState = coreLibrary.ValueState;

	var oShort = NumberFormat.getFloatInstance({ style: "short", maxFractionDigits: 1 });
	var oAmount = NumberFormat.getFloatInstance({ minFractionDigits: 2, maxFractionDigits: 2, groupingEnabled: true });

	return {
		/** 45230.5 → "45.2K" for text, where space is tight. */
		shortNumber: function (n) {
			return n === null || n === undefined ? "" : oShort.format(n);
		},

		/** NumericContent shows value and scale separately: 789123 → "789.1" with scale "K". */
		thousands: function (n) {
			return n === null || n === undefined ? "" : (Math.round(n / 100) / 10).toFixed(1);
		},

		/** 45230.5 → "45,230.50" for tables. */
		amount: function (n) {
			return n === null || n === undefined ? "" : oAmount.format(n);
		},

		/**
		 * Tile colour for the rejection rate: up to 10% is normal for the portfolio, above 20% needs attention.
		 * @param {number} fRate percentage
		 * @returns {string} sap.m.ValueColor
		 */
		rejectionColor: function (fRate) {
			if (fRate > 20) {
				return ValueColor.Error;
			}
			return fRate > 10 ? ValueColor.Critical : ValueColor.Good;
		},

		/**
		 * Tile colour for settlement speed against the 30-day service standard.
		 * @param {number} fDays average days
		 * @returns {string} sap.m.ValueColor
		 */
		settleColor: function (fDays) {
			if (fDays > 30) {
				return ValueColor.Error;
			}
			return fDays > 20 ? ValueColor.Critical : ValueColor.Good;
		},

		/** Same thresholds as rejectionColor, for ObjectNumber states in the branch table. */
		rejectionState: function (fRate) {
			if (fRate > 20) {
				return ValueState.Error;
			}
			return fRate > 10 ? ValueState.Warning : ValueState.None;
		}
	};
});
