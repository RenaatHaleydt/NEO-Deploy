sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../util/AjaxHelper",
	"../util/SearchHelper"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, AjaxHelper, SearchHelper) {
	"use strict";

	return BaseController.extend("com.danone.eOrderEntry.controller.Main", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the main controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.initializeModels();

			this.getCurrentUserLanguage();

			// Add the main page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("mainViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#NewSalesOrder-display"
			}, true);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("viewModel"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},
		onSaveSalesOrder: function (oEvent) {

		},
		onCancelSalesOrder: function (oEvent) {

		},
		checkOrder: function (oEvent) {

		},
		incompLogCheck: function (oEvent) {

		},

		/*---------------------------------- Items table ----------------------------------*/
		onSortItemTable: function (oEvent) {
			var that = this;
			var sDialogTab = "filter";
			if (oEvent.getSource() instanceof sap.m.Button) {
				var sButtonId = oEvent.getSource().getId();
				if (sButtonId.match("sort")) {
					sDialogTab = "sort";
				} else if (sButtonId.match("group")) {
					sDialogTab = "group";
				}
			}
			// load asynchronous XML fragment
			if (!this.byId("viewSettingsDialog")) {
				sap.ui.core.Fragment.load({
					id: this.getView().getId(),
					name: "com.danone.eOrderEntry.fragment.viewSettingsDialog",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					this.getView().addDependent(oDialog);
					oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
					oDialog.open(sDialogTab);
				}.bind(this));
			} else {
				this.byId("viewSettingsDialog").open(sDialogTab);
			}
		},
		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
		 * are applied to the master list, which can also mean that they
		 * are removed from the master list, in case they are
		 * removed in the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		onConfirmViewSettingsDialog: function (oEvent) {

			this._applySortGroup(oEvent);
		},

		addNewItem: function (oEvent) {
			var oTableItemsBinding = this.byId("itemsTable").getBinding("items");
			oTableItemsBinding.getModel().getData().Items.push(this.getEmptyLineObject());
			oTableItemsBinding.refresh();
			this.byId("itemsTable").removeSelections();
		},
		deleteItems: function (oEvent) {
			var that = this;
			var oTable = this.byId("itemsTable");
			var aSelectedItems = oTable.getSelectedItems();
			if (aSelectedItems.length > 0) {
				sap.m.MessageBox.warning(this.getResourceBundle().getText("confirmMessageDeleteItems"), {
					actions: [sap.m.MessageBox.Action.DELETE, sap.m.MessageBox.Action.CANCEL],
					emphasizedAction: sap.m.MessageBox.Action.DELETE,
					onClose: function (sAction) {
						if (sAction === "DELETE") {
							var aSelectedIndexes = aSelectedItems.map(
								function (oObj) {
									return parseInt(oObj.getBindingContextPath().split("/")[oObj.getBindingContextPath().split("/").length - 1], 10);
								});
							aSelectedIndexes = aSelectedIndexes.sort(function (a, b) {
								return b - a;
							}); // We sort the selectedIndexes from high to low, so that we can delete those items in the model without changing the order of the other deletions

							for (var i = 0; i < aSelectedIndexes.length; i++) {
								that.getView().getModel("salesOrderModel").getData().Items.splice(aSelectedIndexes[i], 1);
							}

							oTable.getBinding("items").refresh();
							oTable.removeSelections();
							sap.m.MessageToast.show(that.getResourceBundle().getText("successMessageItemsDeleted"), {
								duration: 5000
							});
						}
						if (sAction === "CANCEL") {
							oTable.removeSelections();
						}
					}
				});
			} else {
				sap.m.MessageToast.show(that.getResourceBundle().getText("selectItemToDeleteWarning"), {
					duration: 5000
				});
			}
		},
		onSearchItemTable: function (oEvent) {
			var sSearchValue = this.getView().byId("searchField").getValue();

			// Ask which properties needs to be searched with this value
		},
		onRefreshTotalsPress: function (oEvent) {

		},
		onItemProposalPress: function (oEvent) {

		},
		// Search Help Dialogs
		// General
		handleValueHelpCancel: function (oEvent) {
			SearchHelper.handleValueHelpCancel(this);
		},
		// If the property to search = Description
		handleValueHelpDescriptionSearch: function (oEvent) {
			SearchHelper.filterListInValueHelp(this, "Description", oEvent, null);
		},

		// Material Search Help Dialog
		handleMaterialHelpRequest: function (oEvent) {
			SearchHelper.openValueHelpDialog(this, null, null, "materialSearchHelp", null);
		},
		handleValueHelpMaterialSearch: function (oEvent) {
			// SearchHelper.filterListInValueHelp(this, "Material", oEvent, "SalesOrgs");
		},
		handleValueHelpMaterialClose: function (oEvent) {
			SearchHelper.handleValueHelpClose(this, oEvent, "SalesOrg");
		},
		onOpenDialogCommentPress: function (oEvent) {
			var iIndexOfItemInListForComment = parseInt(oEvent.getSource().getParent().getBindingContextPath().replace("/Items/", ""), 10);
			this.getView().getModel("randomModel").setProperty("/indexOfItemForComment", iIndexOfItemInListForComment); // We need to know (in the dialog context when we press save) which Item beeds to be saved or edited

			this.commentDialog = sap.ui.xmlfragment("com.danone.eOrderEntry.fragment.commentDialog", this);

			this.getView().addDependent(this.commentDialog);

			var oItem = this.getView().getModel("salesOrderModel").getData().Items[iIndexOfItemInListForComment];
			if (oItem.ReasonRejection !== "") { // The user added comments before
				sap.ui.getCore().byId("commentsId").setValue(oItem.ReasonRejection);
			}
			this.commentDialog.open();
		},
		/** 
		 * Handles the close event of the dialog for entering comments
		 * @param oEvent
		 */
		onCloseItemCommentDialog: function (oEvent) {
			if (this.commentDialog !== undefined) {
				this.commentDialog.close();
				this.commentDialog.destroy();
			}
		},
		onSaveItemComment: function (oEvent) {
			var iIndexOfItemInListForComment = this.getView().getModel("randomModel").getProperty("/indexOfItemForComment");
			var oItem = this.getView().getModel("salesOrderModel").getData().Items[iIndexOfItemInListForComment];
			oItem.ReasonRejection = sap.ui.getCore().byId("commentsId").getValue();
			this.onCloseItemCommentDialog(oEvent);
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		toggleBusy: function () {
			var bCurrentBusyState = this.getModel("viewModel").getProperty("/busy");
			this.getModel("viewModel").setProperty("/busy", false);
		},
		getCurrentUserLanguage: function () {
			var sLanguage = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
			if (sLanguage) {
				this.setResourceBundle(sLanguage);
				this.setDateFormatForLanguage(sLanguage);
			}
		},
		initializeModels: function () {
			this.initializeSalesOrderModel();

			// Model used to manipulate control states
			var oViewModel = new JSONModel({
				iconURI: $.sap.getModulePath("com.danone.eOrderEntry", "/images") + "/CLogoForIcon.png",
				iconIncompLog: "sap-icon://complete",
				busy: false,
				DateFormat: "dd/MM/yyyy",
				MomentDateFormat: "DD/MM/YYYY"
			});
			this.setModel(oViewModel, "viewModel");

			this.createModelAndSetToView({}, "randomModel");
		},
		initializeSalesOrderModel: function () {
			// Model used to store the new Sales Order
			var oSalesOrderModel = new JSONModel({
				SoldTo: null,
				NetValue: 0,
				OrderType: null,
				SalesArea: null,
				PONumber: null,
				OrderReason: null,
				ShipTo: null,
				Address: null,
				Tel: null,
				SalesRepresentative: null,
				Items: [this.getEmptyLineObject()]
			});

			this.getView().setModel(oSalesOrderModel, "salesOrderModel");
		},
		getEmptyLineObject: function () {
			return {
				ItemNumber: null,
				MatNumber: null,
				MatDescription: "",
				Quantity: null,
				UOM: "",
				Category: "",
				Amount: null,
				Plant: "",
				NetValue: null,
				ReasonRejection: ""
			};
		},
		/**
		 * Apply the chosen sorter and grouper to the master list
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @private
		 */
		_applySortGroup: function (oEvent) {
			var mParams = oEvent.getParameters(),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
			this.byId("itemsTable").getBinding("items").sort(aSorters);
		}
	});
});