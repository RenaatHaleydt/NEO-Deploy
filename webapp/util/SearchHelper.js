sap.ui.define(["sap/ui/model/Filter"],
	function (Filter) {
		"use strict";
		return {
			openValueHelpDialog: function (oContext, sInputValue, sProperty, sNameFragment, oFilterForList) {
				// create value help dialog
				if (!oContext.valueHelpDialog) {
					oContext.valueHelpDialog = sap.ui.xmlfragment(
						"com.danone.eOrderEntry.fragment." + sNameFragment,
						oContext
					);
					oContext.getView().addDependent(oContext.valueHelpDialog);
				}

				var oFilters = [];
				if (sInputValue) { // If the search dialog is opened with a value in the search field
					var oFilter = new Filter("tolower(" + sProperty + ")", sap.ui.model.FilterOperator.Contains, "'" + sInputValue.toLowerCase() + "'");
					oFilters.push(oFilter);
				}
				if (oFilterForList) { // If the list needs to be filtered for some reason
					oFilters.push(oFilterForList);
				}

				// oContext.valueHelpDialog.getBinding("items").filter(oFilters);
				oContext.valueHelpDialog.open(sInputValue);
			},
			handleValueHelpClose: function (oContext, oEvent, sPropertyForSalesOrderModel) {
				// When the search help dialog is used for Filtering
				// var bForFilter = oContext.getModel("randomModel").getProperty("/ValueHelpForFilter");
				var oSelectedItem = oEvent.getParameter("selectedItem");
				if (oSelectedItem) {
					// When the search help dialog is used for Filtering
					// if (bForFilter) {
					// 	oContext.getView().getModel("filterModel").setProperty("/" + sPropertyForSalesOrderModel, oSelectedItem.getProperty("title"));
					// } else {
					oContext.getModel("salesOrderModel").setProperty("/" + sPropertyForSalesOrderModel, oSelectedItem.getProperty(
						"title"));
					// }
				}
				oEvent.getSource().getBinding("items").filter([]);
				oContext.valueHelpDialog.destroy();
				oContext.valueHelpDialog = undefined;
			},
			handleValueHelpCancel: function (oContext) {
				if (oContext.valueHelpDialog) {
					oContext.valueHelpDialog.destroy();
					oContext.valueHelpDialog = undefined;
				}
			},
			filterListInValueHelp: function (oContext, sPropertyToFilterInoDataAggregation, oEvent, sPropertyThatIncludesTheItemsAggregation) {
				var sValue = oEvent.getParameter("value");

				if (sPropertyThatIncludesTheItemsAggregation) { // We need to filter in the array we fetched ourself => if the items are not bound to an oData source, but to a Model we created ourself
					var aFilteredList = oContext.getModel("randomModel").getProperty("/" + sPropertyThatIncludesTheItemsAggregation).filter(function (
						sField) {
						return sField.toLowerCase().includes(sValue.toLowerCase());
					});

					oContext.getModel("randomModel").setProperty("/" + sPropertyThatIncludesTheItemsAggregation, aFilteredList);
				} else {
					var oFilters = [];
					if (sValue) {
						var oFilter = new Filter("tolower(" + sPropertyToFilterInoDataAggregation + ")", sap.ui.model.FilterOperator.Contains, "'" + sValue
							.toLowerCase() + "'");
						oFilters.push(oFilter);
					}
					oEvent.getSource().getBinding("items").filter(oFilters);
				}
			}
		};
	});