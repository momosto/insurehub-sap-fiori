sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/AggregationLengthEquals"
], function (Opa5, Press, PropertyStrictEquals, AggregationLengthEquals) {
	"use strict";

	var VIEW = "Overview";

	function tileValue(oTile) {
		return oTile.getTileContent()[0].getContent().getValue();
	}

	function selectKey(sId, sKey) {
		return {
			id: sId,
			viewName: VIEW,
			actions: function (oSelect) {
				oSelect.setSelectedKey(sKey);
				oSelect.fireChange({ selectedItem: oSelect.getSelectedItem() });
			},
			errorMessage: sId + " not found"
		};
	}

	Opa5.createPageObjects({
		onTheOverview: {
			actions: {
				iChooseThePeriod: function (iMonths) {
					return this.waitFor({
						id: "periodButton",
						viewName: VIEW,
						actions: function (oButton) {
							var oItem = oButton.getItems().filter(function (o) {
								return o.getKey() === String(iMonths);
							})[0];
							oButton.setSelectedItem(oItem);
							oButton.fireSelectionChange({ item: oItem });
						},
						errorMessage: "Period button not found"
					});
				},

				iChooseTheProductLine: function (sKey) {
					return this.waitFor(selectKey("productLineSelect", sKey));
				},

				iPressTheBranch: function (sBranch) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewName: VIEW,
						matchers: function (oItem) {
							return oItem.getBindingContext("insights").getProperty("key") === sBranch;
						},
						actions: new Press(),
						errorMessage: "Branch " + sBranch + " is not in the table"
					});
				},

				iPressReset: function () {
					return this.waitFor({ id: "resetButton", viewName: VIEW, actions: new Press() });
				}
			},

			assertions: {
				iSeeTheTileValue: function (sTileId, sValue) {
					return this.waitFor({
						id: sTileId,
						viewName: VIEW,
						matchers: function (oTile) {
							return tileValue(oTile) === sValue;
						},
						success: function () {
							Opa5.assert.ok(true, sTileId + " shows " + sValue);
						},
						errorMessage: sTileId + " does not show " + sValue
					});
				},

				iSeeBranchRows: function (iCount) {
					return this.waitFor({
						id: "branchTable",
						viewName: VIEW,
						matchers: new AggregationLengthEquals({ name: "items", length: iCount }),
						success: function () {
							Opa5.assert.ok(true, "The branch table has " + iCount + " rows");
						},
						errorMessage: "The branch table does not have " + iCount + " rows"
					});
				},

				iSeeTheSubtitle: function (sText) {
					return this.waitFor({
						id: "subtitle",
						viewName: VIEW,
						matchers: new PropertyStrictEquals({ name: "text", value: sText }),
						success: function () {
							Opa5.assert.ok(true, "Subtitle: " + sText);
						}
					});
				},

				iSeeTheBranchFilter: function (sKey) {
					return this.waitFor({
						id: "branchSelect",
						viewName: VIEW,
						matchers: new PropertyStrictEquals({ name: "selectedKey", value: sKey }),
						success: function () {
							Opa5.assert.ok(true, "Branch filter is '" + sKey + "'");
						}
					});
				},

				iSeeChartsWithData: function () {
					return this.waitFor({
						controlType: "sap.viz.ui5.controls.VizFrame",
						viewName: VIEW,
						success: function (aCharts) {
							Opa5.assert.strictEqual(aCharts.length, 3, "Three charts are on the page");
							aCharts.forEach(function (oChart) {
								var iRows = oChart.getDataset().getBinding("data").getLength();
								Opa5.assert.ok(iRows > 0, oChart.getId().split("--").pop() + " has " + iRows + " data points");
							});
						}
					});
				}
			}
		}
	});
});
