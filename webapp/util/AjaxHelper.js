sap.ui.define([],
	function () {
		"use strict";

		return {
			readEntity: function (oModel, sPath, aFilters, aSorters, oParams) {
				return new Promise(function (resolve, reject) {
					oModel.read(sPath, {
						filters: aFilters,
						sorters: aSorters,
						urlParameters: oParams,
						success: function (oData) {
							resolve(oData);
						},
						error: function (oResult) {
							reject(oResult);
						}
					});
				});
			},
			postEntry: function (oModel, sEntity, oEntry, oParams) {
				return new Promise(function (resolve, reject) {
					oModel.create(sEntity, oEntry, {
						urlParameters: oParams,
						success: function (data, oResponse) {
							resolve(data);
						},
						error: function (error) {
							reject(error);
						}
					});
				});
			},
			getCurrentUser: function (oContext) {
				return new Promise(function (resolve, reject) {
					var oUserModel = new sap.ui.model.json.JSONModel();
					oUserModel.loadData("/services/userapi/currentUser");
					oUserModel.attachRequestCompleted(function (oEvent) {
						if (oEvent.getParameter("success")) {
							resolve(this.getData());
						} else {
							var sMessage = oEvent.getParameter("errorObject").textStatus;

							if (sMessage) {
								reject(new Error("Status: " + sMessage));
							} else {
								reject(new Error(oContext.getResourceBundle().getText("errorMessageFailFetchCurrentUser")));
							}
						}
					});
				});
			},
			getODataModelMetadataLoadedOrFailed: function (oController, sModelName, sFailMessage) {
				return new Promise(function (resolve, reject) {
					var oModel = sModelName ? oController.getModel(sModelName) : oController.getModel();
					oModel.attachMetadataLoaded(null, function () {
						resolve(null);
					}, null);
					oModel.attachMetadataFailed(null, function () {
						reject(sFailMessage);
					}, null);
				});
			}
		};

	});