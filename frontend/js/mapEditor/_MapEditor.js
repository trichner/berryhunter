"use strict";

define([
	'Two',
	'Utils',
	'Constants',
	'GameMapGenerator',
	'mapEditor/QuadrantGrid',
	'GameMap',
	'MiniMap',
	'Preloading',
	'Quadrants',
	'gameObjects/Mobs',
	'gameObjects/Resources',
	'underscore',
], function (Two, Utils, Constants, GameMapGenerator, QuadrantGrid, GameMap, MiniMap, Preloading, Quadrants, Mobs, Resources, _) {
	let MapEditor = {};

	MapEditor.isActive = function () {
		if (typeof this.active !== 'undefined') {
			return this.active;
		}

		let quadrantParameter = Utils.getUrlParameter(Constants.MODE_PARAMETERS.MAP_EDITOR);
		this.active = !!quadrantParameter;
		return this.active;
	};

	MapEditor.setup = function () {
		let two = new Two({
			width: Constants.QUADRANT_SIZE,
			height: Constants.QUADRANT_SIZE,
			type: Two.Types.svg,
		}).appendTo(document.getElementById('drawingContainer'));

		require(['Develop'], function (Develop) {
			if (Develop.isActive()) {
				Develop.logWebsocketStatus('Disabled', 'neutral');
			}
		});

		// Empty quadrants
		Quadrants = [[]];
		this.calculateMapDimensions();

		GameMapGenerator.generate = GameMapGenerator.generateFromQuadrants;

		document.getElementById('quadrantJson').addEventListener('input', this.tryRenderQuadrants);
		document.getElementById('renderButton').addEventListener('click', this.tryRenderQuadrants);

		_.extend(window, Mobs);
		_.extend(window, Resources);

		return two;
	};

	require(['Game'], function (Game) {
		MapEditor.afterSetup = function () {
			Game.two.pause();

			Game.createPlayer(0, Game.width / 2, Game.height / 2, 'Map Architect');

			this.grid = new QuadrantGrid();

			Game.player.camera.onUpdate = function (translation) {
				this.grid.cameraUpdate(translation);
			}.bind(this);

			this.tryRenderQuadrants();
		};

		MapEditor.tryRenderQuadrants = function () {
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

			Game.groups.mapBorders.remove();
			Game.groups.mapBorders = Game.two.makeGroup();
			Game.groups.gameObjects.remove();
			Game.groups.gameObjects = Game.two.makeGroup();

			// Re-add overlay to ensure z-index
			Game.two.add(Game.groups.overlay.remove());

			try {
				Game.map = new GameMap();
			} catch (e) {
				jsonStatus.classList.add('error');
				jsonStatus.innerHTML = "Error in Quadrant Definition: " + e.message;
				return;
			}

			Game.miniMap.clear();

			MapEditor.grid = new QuadrantGrid(MapEditor.mapWidth, MapEditor.mapHeight);

			Game.two.update();
			jsonStatus.innerHTML = 'Rendered';
			jsonStatus.classList.add('success');
		};

		MapEditor.calculateMapDimensions = function () {
			// If there's no quadrant, at least render 1 empty quadrant
			let quadrantCount = Math.max(1, Quadrants.length);
			// TODO Quadranten möglichst quadratisch auslegen, statt alle in die Breite
			this.mapWidth = Constants.QUADRANT_SIZE * quadrantCount;
			this.mapHeight = Constants.QUADRANT_SIZE;
		};

		MapEditor.getMapDimensions = function () {
			return {
				width: this.mapWidth,
				height: this.mapHeight,
			}
		};
	});


	if (MapEditor.isActive()) {
		Preloading.registerPartial('partials/mapEditor.html');
	}

	return MapEditor;
});
