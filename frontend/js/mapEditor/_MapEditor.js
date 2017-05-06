"use strict";

const MapEditor = {
	isActive: function () {
		if (typeof this.active !== 'undefined') {
			return this.active;
		}

		let quadrantParameter = getUrlParameter("map-editor");
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

		Constants.SHOW_FPS = false;

		return two;
	},

	afterSetup: function () {
		two.pause();

		createPlayer(0, width/2, height/2);

		this.grid = new QuadrantGrid();

		playerCam.onUpdate = function (translation) {
			this.grid.cameraUpdate(translation);
		}.bind(this);

		this.tryRenderQuadrants();
	},


	disable: function () {
		clearNode(document.body);
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

		} catch (e) {
			jsonStatus.classList.add('error');
			jsonStatus.innerHTML = "Error in JSON: " + e.message;
			return;
		}

		if (!Quadrants) {
			jsonStatus.classList.add('error');
			jsonStatus.innerHTML = "The JSON doesn't return a definition.";
		}

		MapEditor.calculateMapDimensions();

		groups.mapBorders.remove();
		groups.mapBorders = two.makeGroup();
		groups.gameObjects.remove();
		groups.gameObjects = two.makeGroup();

		// Re-add overlay to ensure z-index
		groups.overlay.remove();
		groups.overlay = two.makeGroup();

		try {
			gameMap = new GameMap();
		} catch (e) {
			jsonStatus.classList.add('error');
			jsonStatus.innerHTML = "Error in Quadrant Definition: " + e.message;
			return;
		}

		miniMap.remove();
		miniMap = new MiniMap(gameMap);

		MapEditor.grid = new QuadrantGrid(MapEditor.mapWidth, MapEditor.mapHeight);

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

