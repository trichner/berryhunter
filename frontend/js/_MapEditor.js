"use strict";

var QuadrantRenderer = {
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

		this.grid = new QuadrantGrid();

		// two.update();

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
			if (!Quadrants) {
				throw "Doesn't return a definition."
			}
		} catch (e) {
			jsonStatus.classList.add('error');
			jsonStatus.innerHTML = "Error in JSON: " + e.message;
			return;
		}

		QuadrantRenderer.calculateMapDimensions();

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

		groups.gameObjects.translation.subSelf(playerCam.translation);
		groups.mapBorders.translation.subSelf(playerCam.translation);

		miniMap.remove();
		miniMap = new MiniMap(gameMap);

		this.grid = new QuadrantGrid();

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

class QuadrantGrid {
	constructor() {
		this.group = new Two.Group();
		groups.mapBorders.add(this.group);

		const gridSpacing = Constants.GRID_SPACING;
		let offsetX = 0;
		for (var x = gridSpacing; x < Constants.QUADRANT_SIZE; x += gridSpacing) {
			this.group.add(QuadrantGrid.createGridLine(x, 0, x, height));
		}

		// let offsetY = (height % gridSpacing) / 2;
		let offsetY = 0;
		for (var y = gridSpacing; y < Constants.QUADRANT_SIZE; y += gridSpacing) {
			this.group.add(QuadrantGrid.createGridLine(0, y, width, y));
		}
	}

	static createGridLine(x1, y1, x2, y2) {
		let shape = new Two.Line(x1, y1, x2, y2);
		shape.stroke = 'yellow';
		shape.noFill();

		return shape;
	}
}