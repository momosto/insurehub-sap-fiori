sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/base/strings/formatMessage",
	"../model/aggregator",
	"../model/formatter"
], function (Controller, JSONModel, formatMessage, aggregator, formatter) {
	"use strict";

	var DEFAULT_FILTER = { months: 12, monthsKey: "12", productLine: "", branch: "" };

	/*
	 * Reads every claim once from the OData service and does the slicing in the browser
	 * (model/aggregator.js). For a few thousand claims this is instant; a production service
	 * would expose an aggregated CDS view instead (see docs/03-architecture.md).
	 */
	return Controller.extend("insurehub.claims.insights.controller.Overview", {
		formatter: formatter,

		formatMessage: formatMessage,

		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this._aClaims = [];
			// Card headers already name each chart; hide the VizFrame's own title and show values on the bars
			["lineChart", "monthlyChart", "statusChart"].forEach(function (sId) {
				this.byId(sId).setVizProperties({
					title: { visible: false },
					legendGroup: { layout: { position: "bottom" } },
					plotArea: { dataLabel: { visible: sId !== "monthlyChart" } }
				});
			}, this);
			this.getView().setModel(new JSONModel({
				busy: true,
				loadFailed: false,
				filter: Object.assign({}, DEFAULT_FILTER),
				options: { productLines: [], branches: [] },
				kpis: {},
				byLine: [],
				byBranch: [],
				monthly: [],
				statusMix: []
			}), "insights");
			this._loadClaims();
		},

		/**
		 * Reference date for the period filter. Tests start the component with componentData.today
		 * (and unshifted mock data) so the numbers they check never change.
		 * @returns {Date} today, or the fixed test date
		 */
		today: function () {
			var oData = this.getOwnerComponent().getComponentData();
			return oData && oData.today ? new Date(oData.today) : new Date();
		},

		_loadClaims: function () {
			var oInsights = this.getView().getModel("insights");
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/Claims", {
				success: function (oData) {
					this._aClaims = oData.results;
					oInsights.setProperty("/options", {
						productLines: this._options("ProductLine", "ProductLineText"),
						branches: this._options("Branch", "BranchName")
					});
					oInsights.setProperty("/busy", false);
					this._refresh();
				}.bind(this),
				error: function () {
					oInsights.setProperty("/busy", false);
					oInsights.setProperty("/loadFailed", true);
				}
			});
		},

		/** Select options from the data itself, with "All" first. */
		_options: function (sKey, sTextKey) {
			var sAll = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("all");
			var mSeen = {};
			var aOptions = [];
			this._aClaims.forEach(function (c) {
				if (!mSeen[c[sKey]]) {
					mSeen[c[sKey]] = true;
					aOptions.push({ key: c[sKey], text: c[sTextKey] });
				}
			});
			aOptions.sort(function (a, b) {
				return a.text.localeCompare(b.text);
			});
			return [{ key: "", text: sAll }].concat(aOptions);
		},

		_refresh: function () {
			var oInsights = this.getView().getModel("insights");
			var mFilter = oInsights.getProperty("/filter");
			var oToday = this.today();
			var aClaims = aggregator.filter(this._aClaims, mFilter, oToday);

			oInsights.setProperty("/kpis", aggregator.kpis(aClaims));
			oInsights.setProperty("/byLine", aggregator.groupBy(aClaims, "ProductLine", "ProductLineText"));
			oInsights.setProperty("/byBranch", aggregator.groupBy(aClaims, "Branch", "BranchName"));
			oInsights.setProperty("/monthly", aggregator.monthly(aClaims, oToday, mFilter.months));
			oInsights.setProperty("/statusMix", aggregator.statusMix(aClaims));
		},

		onPeriodChange: function (oEvent) {
			var sKey = oEvent.getParameter("item").getKey();
			var oInsights = this.getView().getModel("insights");
			oInsights.setProperty("/filter/monthsKey", sKey);
			oInsights.setProperty("/filter/months", Number(sKey));
			this._refresh();
		},

		onFilterChange: function () {
			this._refresh();
		},

		onReset: function () {
			this.getView().getModel("insights").setProperty("/filter", Object.assign({}, DEFAULT_FILTER));
			this._refresh();
		},

		/** Pressing a branch row narrows the whole page to that branch. */
		onBranchPress: function (oEvent) {
			var sBranch = oEvent.getSource().getBindingContext("insights").getProperty("key");
			this.getView().getModel("insights").setProperty("/filter/branch", sBranch);
			this._refresh();
		}
	});
});
