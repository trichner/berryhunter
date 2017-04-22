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

		document.getElementById('quadrantJson').addEventListener('input', this.tryRenderQuadrants);
		document.getElementById('renderButton').addEventListener('click', this.tryRenderQuadrants);

		return two;
	},

	tryRenderQuadrants: function () {
		let jsonStatus = document.getElementById('jsonStatus');
		jsonStatus.classList.remove('error');
		jsonStatus.classList.remove('success');

		if (!this.value) {
			jsonStatus.innerHTML = 'Waiting for input...';
		}

		try {
			Quadrants = eval(document.getElementById('quadrantJson').value);
			if (!Quadrants) {
				throw "Doesn't return a definition."
			}
		} catch (e) {
			jsonStatus.classList.add('error');
			jsonStatus.innerHTML = "Error in JSON: " + e.message;
			return;
		}

		QuadrantRenderer.calculateMapDimensions();

		groups.gameObjects.remove();
		groups.gameObjects = two.makeGroup();
		groups.mapBorders.remove();
		groups.mapBorders = two.makeGroup();

		try {
			gameMap = new GameMap();
		} catch (e) {
			jsonStatus.classList.add('error');
			jsonStatus.innerHTML = "Error in Quadrant Definition: " + e.message;
			return;
		}

		miniMap = new MiniMap(gameMap);
		two.update();
		jsonStatus.innerHTML = 'Rendered';
		jsonStatus.classList.add('success');
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
