sap.ui.define([], function () {
	"use strict";

	/*
	 * Pure functions that turn a list of claims into the numbers on the overview page.
	 * No UI5 controls or models in here, so every figure can be unit-tested with plain data.
	 * Amounts arrive from OData V2 as strings ("1234.50"), dates as Date objects.
	 */

	function toNumber(v) {
		var n = typeof v === "number" ? v : parseFloat(v);
		return isNaN(n) ? 0 : n;
	}

	/** Rounds to cents without floating-point drift (0.1 + 0.2 style). */
	function round2(n) {
		return Math.round((n + Number.EPSILON) * 100) / 100;
	}

	/** Percentages are shown with one decimal. */
	function round1(n) {
		return Math.round((n + Number.EPSILON) * 10) / 10;
	}

	function monthKey(oDate) {
		var m = oDate.getUTCMonth() + 1;
		return oDate.getUTCFullYear() + "-" + (m < 10 ? "0" : "") + m;
	}

	var aggregator = {
		/**
		 * Keeps the claims reported in the last <iMonths> months (relative to oToday) that match the filters.
		 * @param {object[]} aClaims claims
		 * @param {{months: number, productLine: string, branch: string}} mFilter "" means all
		 * @param {Date} oToday reference date
		 * @returns {object[]} matching claims
		 */
		filter: function (aClaims, mFilter, oToday) {
			var oFrom = new Date(Date.UTC(oToday.getUTCFullYear(), oToday.getUTCMonth() - mFilter.months, oToday.getUTCDate()));
			return aClaims.filter(function (c) {
				return c.ReportedOn >= oFrom && c.ReportedOn <= oToday &&
					(!mFilter.productLine || c.ProductLine === mFilter.productLine) &&
					(!mFilter.branch || c.Branch === mFilter.branch);
			});
		},

		/**
		 * Headline KPIs.
		 * - loss ratio proxy: paid / claimed on settled (paid) claims
		 * - rejection rate: rejected / decided (paid + approved + rejected)
		 * - average days to settle: over claims that have DaysToSettle
		 * @param {object[]} aClaims claims already filtered
		 * @returns {object} KPI values
		 */
		kpis: function (aClaims) {
			var fClaimed = 0, fPaid = 0, iDecided = 0, iRejected = 0, iOpen = 0, iFlagged = 0;
			var iSettleDays = 0, iSettled = 0, fClaimedOnPaid = 0;

			aClaims.forEach(function (c) {
				fClaimed += toNumber(c.ClaimedAmount);
				fPaid += toNumber(c.PaidAmount);
				if (c.Status === "OPEN") {
					iOpen++;
				} else {
					iDecided++;
				}
				if (c.Status === "REJ") {
					iRejected++;
				}
				if (c.Status === "PAID") {
					fClaimedOnPaid += toNumber(c.ClaimedAmount);
				}
				if (c.DaysToSettle !== null && c.DaysToSettle !== undefined) {
					iSettleDays += c.DaysToSettle;
					iSettled++;
				}
				if (c.Flagged) {
					iFlagged++;
				}
			});

			return {
				count: aClaims.length,
				open: iOpen,
				claimed: round2(fClaimed),
				paid: round2(fPaid),
				paidRatio: fClaimedOnPaid ? round1(fPaid / fClaimedOnPaid * 100) : 0,
				rejectionRate: iDecided ? round1(iRejected / iDecided * 100) : 0,
				avgDaysToSettle: iSettled ? round1(iSettleDays / iSettled) : 0,
				flagged: iFlagged
			};
		},

		/**
		 * Totals per group, sorted by claimed amount (largest first).
		 * @param {object[]} aClaims claims
		 * @param {string} sKey grouping property, e.g. "ProductLine" or "Branch"
		 * @param {string} sTextKey property holding the display text
		 * @returns {object[]} one row per group with the same KPIs as kpis()
		 */
		groupBy: function (aClaims, sKey, sTextKey) {
			var mGroups = {};
			aClaims.forEach(function (c) {
				(mGroups[c[sKey]] = mGroups[c[sKey]] || { key: c[sKey], text: c[sTextKey], claims: [] }).claims.push(c);
			});
			return Object.keys(mGroups).map(function (k) {
				var g = mGroups[k];
				var o = aggregator.kpis(g.claims);
				o.key = g.key;
				o.text = g.text;
				return o;
			}).sort(function (a, b) {
				return b.claimed - a.claimed;
			});
		},

		/**
		 * Claims reported per calendar month, with empty months filled in so the trend line has no gaps.
		 * Only complete months are shown: the current month would always look like a sudden drop.
		 * @param {object[]} aClaims claims
		 * @param {Date} oToday reference date; the last month shown is the one before it
		 * @param {number} iMonths number of months
		 * @returns {{month: string, count: number, claimed: number}[]} oldest first
		 */
		monthly: function (aClaims, oToday, iMonths) {
			var aMonths = [];
			var mByMonth = {};
			for (var i = iMonths; i >= 1; i--) {
				var sKey = monthKey(new Date(Date.UTC(oToday.getUTCFullYear(), oToday.getUTCMonth() - i, 1)));
				mByMonth[sKey] = { month: sKey, count: 0, claimed: 0 };
				aMonths.push(mByMonth[sKey]);
			}
			aClaims.forEach(function (c) {
				var oRow = mByMonth[monthKey(c.ReportedOn)];
				if (oRow) {
					oRow.count++;
					oRow.claimed = round2(oRow.claimed + toNumber(c.ClaimedAmount));
				}
			});
			return aMonths;
		},

		/**
		 * Number of claims per status, in workflow order.
		 * @param {object[]} aClaims claims
		 * @returns {{status: string, text: string, count: number}[]} statuses with at least one claim
		 */
		statusMix: function (aClaims) {
			var aOrder = ["OPEN", "APPR", "PAID", "REJ"];
			var mCount = {};
			var mText = {};
			aClaims.forEach(function (c) {
				mCount[c.Status] = (mCount[c.Status] || 0) + 1;
				mText[c.Status] = c.StatusText;
			});
			return aOrder.filter(function (s) {
				return mCount[s];
			}).map(function (s) {
				return { status: s, text: mText[s], count: mCount[s] };
			});
		}
	};

	return aggregator;
});
