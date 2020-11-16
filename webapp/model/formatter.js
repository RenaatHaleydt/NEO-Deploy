sap.ui.define([], function () {
	"use strict";
	/*global moment */

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		//Basic formatter stuff
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		formatDateForView: function (oValue) {
			if (typeof oValue === "string")
				oValue = this.formatter.convertEpochDateToJavaScriptDate(oValue);
			if (typeof oValue === "object") {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "YYYY/MM/dd"
				});
				return oDateFormat.format(oValue);
			}

		},
		/** 
		 * This method requires a name of a property to find it in the CARModel.
		 * This method converts a date with the format ‘dd-MM-YYYY’ into a Javascript Date Object
		 * @param propName
		 * @returns String
		 */
		convertDateToJavaScriptDateObject: function (propName) {
			var date = this.getView().getModel("CARModel").getProperty("/" + propName);
			if (date === null)
				return "";

			if (this.isValidDate(date) || date.includes("/Date"))
				return date;

			if (date && date !== "") {
				var day = date.split("-")[0];
				var month = (parseInt(date.split("-")[1].split("-")[0], 10) - 1);
				var year = date.slice(-4);
				return new Date(year, month, day);
			}

			return "";
		},
		/** 
		 * Checks if a date is an instance of Date and different from NaN
		 * @param d
		 * @returns boolean
		 */
		isValidDate: function (d) {
			return d instanceof Date && !isNaN(d);
		},
		/** 
		 * Converts the Epoch date (the date coming from HANA) into the format ‘dd-MM-YYYY’ to display in the views
		 * @param dateEpoch
		 * @returns String
		 */
		convertEpochDateToDateWithDayDashMonthDashYear: function (dateEpoch) {
			var dateJS;
			var sDateJS = "";

			dateEpoch = dateEpoch.split('(')[1];
			dateEpoch = dateEpoch.split(')')[0];
			if (dateEpoch !== "0") {
				dateJS = new Date(parseInt(dateEpoch, 10)); // new Date() is automaticcaly converted to the local time zone (with time offset)
				// var signDateOffset = dateJS.getTimezoneOffset().toString();
				// if (signDateOffset.startsWith("-")) {
				// 	dateJS.setMinutes(parseInt(signDateOffset.split("-")[1], 10));
				// }
				// if (signDateOffset.startsWith("+")) {
				// 	dateJS.setMinutes(-parseInt(signDateOffset.split("-")[1], 10));
				// }

				sDateJS = dateJS.getDate() + "-" + (dateJS.getUTCMonth() + 1) + "-" +
					dateJS.getUTCFullYear();
			}
			return sDateJS;
		},
		/** 
		 * Converts the Epoch date (the data coming from HANA) into a Javascript Date object
		 * @param dateEpoch
		 * @returns Javascript Date Object
		 */
		convertEpochDateToJavaScriptDate: function (dateEpoch) {
			var dateJS;

			dateEpoch = dateEpoch.split('(')[1];
			dateEpoch = dateEpoch.split(')')[0];
			if (dateEpoch !== "0") {
				if (dateEpoch.includes("+")) // When the dates are coming from sHaRe (SuccessFactors), it is possible it looks like /Date(1586981513000+0000)/ for example
					dateEpoch = dateEpoch.split("+")[0];
				dateJS = new Date(parseInt(dateEpoch, 10)); // new Date() is automaticcaly converted to the local time zone (with time offset)
			}
			return dateJS;
		},
		/** 
		 * Converts the Javascript Date Object into a Date with format ‘dd-MM-YYY’ to display in the front.
		 * @param date
		 * @returns String
		 */
		_convertJavascriptDateToDateWithDashes: function (date) {
			var sDate = "";
			var day,
				month,
				year;
			if (this.isValidDate(date)) {
				day = date.toISOString().split("T")[0].split("-")[2];
				month = date.toISOString().split("T")[0].split("-")[1];
				year = date.toISOString().split("T")[0].split("-")[0];
				sDate = day + "-" + month + "-" + year;
			}
			return sDate;
		},
		/** 
		 * Returns the conversion of the DateTime object into epoch date
		 * @constructor 
		 * @param dateTime
		 * @returns String
		 */
		_convertDateTimeIntoEpoch: function (dateTime) {
			// var dateJS = new Date(dateTime.split("T")[0]);
			var dateJS = dateTime;
			if (this.isValidDate(dateJS) && dateJS !== "") {
				return '\/Date(' + Date.parse(dateTime) + ')\/';
			} else {
				return '\/Date(' + "0" + ')\/';
			}
		},
		/** 
		 * Returns the modified Error object with the error message split into an array of lines
		 * @param oError
		 * @returns Error object
		 */
		compressErrorObject: function (oError) {
			if (oError.responseText !== undefined) {
				oError.responseText = this.makeNewLineAfterXChars(oError.responseText);
			}
			if (oError.responseJSON !== undefined) {
				if (oError.responseJSON.error.message.value !== undefined)
					oError.responseJSON.error.message.value = this.makeNewLineAfterXChars(oError.responseJSON.error.message.value);
			}
			if (typeof oError === "object" && JSON.stringify(oError) === "{}") { // oError is a TypeError vomming from the frontend
				oError = String(oError);
			}

			return oError;
		},
		/** 
		 * Returns an array of lines (with X words)
		 * @param sString
		 * @returns Array
		 */
		makeNewLineAfterXChars: function (sString) {
			var aChunks = [];
			var aTemp = [];
			var aTempChunk = "";

			aTemp = sString.split(" ");

			for (var i = 0; i < aTemp.length; i++) {
				aTempChunk += aTemp[i] + " ";
				if (aTempChunk.length > 50 || (i === (aTemp.length - 1) && aTempChunk.length !== 0)) { //We make the lines 50 words long and check if the last aTempChunk is empty before we go out of the loop
					aChunks.push(aTempChunk);
					aTempChunk = "";
				}
			}
			return aChunks;
		},
		formatDateFormatDependingOnLanguageSettings: function (sLanguage) {
			switch (sLanguage) {
			case "en":
				return "MM/dd/yyyy";
			case "es":
				return "d/MM/yyyy";
			case "de":
			case "fr":
			case "in":
			case "pl":
			case "pt":
			case "ru":
				return "dd/MM/yyyy";
			case "nl":
				return "d-M-yyyy";
			case "zh":
				return "yyyy-M-d";
			}
			return "MM/dd/yyyy";
		},
		formatDateDependingOnLanguageSettings: function (dDate, sDateFormat) {
			if (dDate) {
				return moment(dDate).format(sDateFormat);
			}
			return null;
		}
	};

});