"use strict";

function getUrlParameter(sParam, lowerCase) {
	var sPageUrl = decodeURIComponent(window.location.search.substring(1)),
		sUrlVariables = sPageUrl.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sUrlVariables.length; i++) {
		sParameterName = sUrlVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true :
				lowerCase ? sParameterName[1].toLowerCase() : sParameterName[1];
		}
	}
}

var QuadrantRenderer = {
	isActive: function () {
		if (typeof this.active !== 'undefined'){
			return this.active;
		}

		let quadrantParameter = getUrlParameter("quadrant");
		this.active = !!quadrantParameter;
		return this.active;

	},

	setup: function () {
		// Create HTML structure
		var sectionDrawing = document.createElement("section");
		document.body.appendChild(sectionDrawing);
		sectionDrawing.id = "drawing";

		let two = new Two({
			width: Constants.QUADRANT_SIZE,
			height: window.innerHeight,
			type: Two.Types.svg
		}).appendTo(sectionDrawing);

		let sectionInput = document.createEventObject('section');
		document.body.appendChild(sectionDrawing);
		sectionInput.id = "inputContainer";

		return two;
	}
};
