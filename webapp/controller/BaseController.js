sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"../model/formatter"
], function (Controller, UIComponent, mobileLibrary, formatter) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("com.danone.eOrderEntry.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = this.getModel("viewModel");
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/** 
		 * This method requires data and a name to create a JSON model and bind it to the view
		 * @param {data}
		 * @param {name}
		 */
		createModelAndSetToView: function (data, name) {
			var oModel = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(oModel, name);
		},
		/** 
		 * Displays a sap.m.MessageBox error with a given message and an error
		 * @param sMessage
		 * @param oError
		 */
		showErrorMessage: function (oError, sMessage) {
			sap.m.MessageBox.error(sMessage ? sMessage : this.getResourceBundle().getText("errorText"), {
				title: this.getResourceBundle().getText("generalErrorMessageTitle"),
				details: formatter.compressErrorObject(oError)
			});
		},
		/** 
		 * Fetches the environment where the app is opened
		 * @returns account Object
		 */
		getAccountName: function () {
			var account = document.URL.split(".").filter(function (element) {
					if (element.indexOf("danonedeveu") !== -1) return true;
					else return false;
				}).length > 0 ? "danonedeveu" :
				document.URL.split(".").filter(function (element) {
					if (element.indexOf("danonequaeu") !== -1) return true;
					else return false;
				}).length > 0 ? "danonequaeu" : "danoneprodeu";
			return account;
		},
		/** 
		 * When a user presses an item (or a button) in the list/table, this method returns the object that is bound to that row
		 * @param oEvent = the press event of an item in the list/table
		 * @returns object from a model attached to the Component
		 */
		getObjectFromModelAfterSelectedInTableWithoDataBinding: function (oEvent, sNameOfModel) {
			var sPathForObject = oEvent.getSource().getBindingContext().getPath();
			return this.getPropertyFromModelViaPath(sPathForObject, sNameOfModel);
		},
		getPropertyFromModelViaPath: function (sPath, sNameOfModel) {
			if (!sNameOfModel) // We want the default model
				return this.getOwnerComponent().getModel().getProperty(sPath);
			else
				return this.getOwnerComponent().getModel(sNameOfModel).getProperty(sPath);
		},
		setObjectFromDefaultModelAfterSelectedInTableWithoDataBinding: function (oEvent, oObject) {
			var sPathForObject = oEvent.getSource().getBindingContext().getPath();
			return this.setPropertyFromDefaultModelViaPath(sPathForObject, oObject);
		},
		setPropertyFromDefaultModelViaPath: function (sPath, oObject) {
			return this.getOwnerComponent().getModel().setProperty(sPath, oObject);
		},

		getTextOfColumnByColumnHeaderBindingPathToi18nModelInTable: function (oEvent, sTableId, sColumnNamePathi18n) {
			var iIndex = this.getIndexOfColumnHeaderBindingPathToi18nModelInTable(sTableId, sColumnNamePathi18n);
			return oEvent.getSource().getParent().getCells()[iIndex].getAggregation("items").pop().getText();
		},
		getIndexOfColumnHeaderBindingPathToi18nModelInTable: function (sTableId, sColumnNamePathi18n) {
			var iIndex = 0;
			var aColumns = this.byId(sTableId).getColumns();

			for (var i = 0; i < aColumns.length; i++) {
				if (aColumns[i].getHeader() === null)
					continue; // continue jumps out of the loop
				if (aColumns[i].getHeader().getBinding("text").getPath() === sColumnNamePathi18n) {
					iIndex = i;
					break;
				}
			}
			return iIndex;
		},
		setResourceBundle: function (sLanguage) {
			var i18nModel = new sap.ui.model.resource.ResourceModel({
				"bundleName": "com.danone.eOrderEntry.i18n.i18n",
				bundleUrl: "i18n/i18n.properties",
				bundleLocale: sLanguage,
				fallbackLocale: sLanguage,
				supportedLocales: [sLanguage]
			});

			this.getOwnerComponent().setModel(i18nModel, "i18n");
			sap.ui.getCore().getConfiguration().setLanguage(sLanguage.toUpperCase());
		},
		setDateFormatForLanguage: function (sLanguage) {
			var sDateFormat = formatter.formatDateFormatDependingOnLanguageSettings(sLanguage);
			this.getModel("viewModel").setProperty("/DateFormat", sDateFormat);
			this.getModel("viewModel").setProperty("/MomentDateFormat", sDateFormat.toUpperCase());
		},

		/**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */
		addHistoryEntry: (function () {
			var aHistoryEntries = [];

			return function (oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function (oHistoryEntry) {
					return oHistoryEntry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})()

	});

});