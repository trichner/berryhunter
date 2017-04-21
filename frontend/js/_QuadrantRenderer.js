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
		if (typeof this.active !== 'undefined') {
			return this.active;
		}

		let quadrantParameter = getUrlParameter("quadrant");
		this.active = !!quadrantParameter;
		return this.active;
	},

	setup: function () {
		let two = new Two({
			width: Constants.QUADRANT_SIZE,
			height: Constants.QUADRANT_SIZE,
			type: Two.Types.svg
		}).appendTo(document.getElementById('drawingContainer'));

		// Empty quadrants
		Quadrants = [[]];
		this.calculateMapDimensions();

		GameMapGenerator.generate = GameMapGenerator.generateFromQuadrants;

		var textarea = document.getElementById('quadrantJson');
		textarea.addEventListener('input', this.onJsonInput);

		return two;
	},

	onJsonInput: function () {
		try {
			Quadrants = eval(this.value);
			QuadrantRenderer.calculateMapDimensions();

			groups.gameObjects.remove();
			groups.gameObjects = two.makeGroup();

			gameMap.objects = GameMapGenerator.generateFromQuadrants(this.mapWidth, this.mapHeight);

			two.update();
		} catch (e) {
			var err = e.constructor('Fehler im JSON: ' + e.message);
			// +3 because 'err' has the line number of the 'eval' line plus 2.
			err.lineNumber = e.lineNumber - err.lineNumber + 3;
			throw err;
		}
	},

	calculateMapDimensions: function () {
		// If there's no quadrant, at least render 1 empty quadrant
		let quadrantCount = Math.max(1, Quadrants.length);
		// TODO Quadranten möglichst quadratisch auslegen, statt alle in die Breite
		this.mapWidth = Constants.QUADRANT_SIZE * quadrantCount;
		this.mapHeight = Constants.QUADRANT_SIZE;
	},

	getMapDimensions: function () {
		return {
			width: this.mapWidth,
			height: this.mapHeight
		}
	}
};
