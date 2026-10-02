sap.ui.define([
	"insurehub/hr/leaverequests/model/formatter",
	"sap/ui/core/library"
], function (formatter, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	QUnit.module("countWorkingDays");

	QUnit.test("counts Monday to Friday inclusive", function (assert) {
		// 5 Oct 2026 is a Monday
		assert.strictEqual(formatter.countWorkingDays(new Date(2026, 9, 5), new Date(2026, 9, 9)), 5);
	});

	QUnit.test("skips weekends", function (assert) {
		// Friday to the following Monday = 2 working days
		assert.strictEqual(formatter.countWorkingDays(new Date(2026, 9, 9), new Date(2026, 9, 12)), 2);
	});

	QUnit.test("a weekend-only period has no working days", function (assert) {
		assert.strictEqual(formatter.countWorkingDays(new Date(2026, 9, 10), new Date(2026, 9, 11)), 0);
	});

	QUnit.test("a single weekday counts as one", function (assert) {
		assert.strictEqual(formatter.countWorkingDays(new Date(2026, 9, 7), new Date(2026, 9, 7)), 1);
	});

	QUnit.test("end before start or missing dates return 0", function (assert) {
		assert.strictEqual(formatter.countWorkingDays(new Date(2026, 9, 9), new Date(2026, 9, 5)), 0);
		assert.strictEqual(formatter.countWorkingDays(null, new Date()), 0);
		assert.strictEqual(formatter.countWorkingDays(new Date(), undefined), 0);
	});

	QUnit.test("ignores the time of day", function (assert) {
		assert.strictEqual(formatter.countWorkingDays(new Date(2026, 9, 5, 23, 59), new Date(2026, 9, 6, 0, 1)), 2);
	});

	QUnit.module("toUTCDate");

	QUnit.test("keeps the calendar day at midnight UTC", function (assert) {
		var oResult = formatter.toUTCDate(new Date(2026, 9, 5, 0, 0));
		assert.strictEqual(oResult.toISOString(), "2026-10-05T00:00:00.000Z");
	});

	QUnit.test("returns null for non-dates", function (assert) {
		assert.strictEqual(formatter.toUTCDate("2026-10-05"), null);
	});

	QUnit.module("status");

	QUnit.test("statusState maps codes to value states", function (assert) {
		assert.strictEqual(formatter.statusState("A"), ValueState.Success);
		assert.strictEqual(formatter.statusState("R"), ValueState.Error);
		assert.strictEqual(formatter.statusState("P"), ValueState.Warning);
		assert.strictEqual(formatter.statusState("W"), ValueState.None);
	});

	QUnit.test("statusText reads the i18n key status<code>", function (assert) {
		var oController = {
			getResourceBundle: function () {
				return { getText: function (sKey) { return "text:" + sKey; } };
			}
		};
		assert.strictEqual(formatter.statusText.call(oController, "P"), "text:statusP");
		assert.strictEqual(formatter.statusText.call(oController, ""), "");
	});
});
