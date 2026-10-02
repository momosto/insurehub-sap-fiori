sap.ui.define([
	"insurehub/claims/insights/model/formatter",
	"sap/ui/core/library",
	"sap/m/library"
], function (formatter, coreLibrary, mLibrary) {
	"use strict";

	var ValueColor = mLibrary.ValueColor;
	var ValueState = coreLibrary.ValueState;

	QUnit.module("numbers");

	QUnit.test("thousands keeps one decimal for tiles", function (assert) {
		assert.strictEqual(formatter.thousands(789123.45), "789.1");
		assert.strictEqual(formatter.thousands(950), "1.0");
		assert.strictEqual(formatter.thousands(0), "0.0");
		assert.strictEqual(formatter.thousands(null), "");
	});

	QUnit.test("amount shows cents and grouping", function (assert) {
		assert.strictEqual(formatter.amount(292868.8), "292,868.80");
		assert.strictEqual(formatter.amount(undefined), "");
	});

	QUnit.module("thresholds");

	QUnit.test("rejection rate: normal up to 10%, warning to 20%, error above", function (assert) {
		assert.strictEqual(formatter.rejectionColor(10), ValueColor.Good);
		assert.strictEqual(formatter.rejectionColor(10.1), ValueColor.Critical);
		assert.strictEqual(formatter.rejectionColor(20.1), ValueColor.Error);
		assert.strictEqual(formatter.rejectionState(5), ValueState.None);
		assert.strictEqual(formatter.rejectionState(15), ValueState.Warning);
		assert.strictEqual(formatter.rejectionState(25), ValueState.Error);
	});

	QUnit.test("settlement against the 30-day service standard", function (assert) {
		assert.strictEqual(formatter.settleColor(20), ValueColor.Good);
		assert.strictEqual(formatter.settleColor(25), ValueColor.Critical);
		assert.strictEqual(formatter.settleColor(31), ValueColor.Error);
	});
});
