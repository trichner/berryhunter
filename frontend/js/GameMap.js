"use strict";

function GameMap() {
	if (QuadrantRenderer.isActive()) {
		let dimmensions = QuadrantRenderer.getMapDimensions();
		this.width = dimmensions.width;
		this.height = dimmensions.height;
	} else {
		this.width = Constants.BASE_MOVEMENT_SPEED;
		this.width *= 60; // FPS
		this.width *= 30; // Required seconds to get across the map

		//noinspection JSSuspiciousNameCombination
		this.height = this.width;
	}

	/*
	 * Create map borders
	 */
	groups.mapBorders.add(
		new Border(0, 0, 'NORTH', this.width),
		new Border(this.width, 0, 'EAST', this.height),
		new Border(0, this.height, 'SOUTH', this.width),
		new Border(0, 0, 'WEST', this.height));

	this.objects = GameMapGenerator.generate(this.width, this.height);

	// console.info('Map is ' + this.width + ' x ' + this.height);
	// console.log(this.objects.length + ' objects generated');
}

function executeRandomFunction(weightedFunctions) {
	let weightTotal = 0;

	weightedFunctions.forEach(function (weightedFunction) {
		weightTotal += weightedFunction.weight;
	});

	// http://stackoverflow.com/a/9330493
	var index = randomInt(weightTotal) + 1;
	var sum = 0;
	var i = 0;
	while (sum < index) {
		var weightedFunction = weightedFunctions[i++];
		sum += weightedFunction.weight;
	}
	return weightedFunctions[i - 1].func();
}

/**
 * Returns an array of game objects that are currently within the given area.
 * @param startX
 * @param startY
 * @param endX
 * @param endY
 * @return Array
 */
GameMap.prototype.getObjects = function (startX, startY, endX, endY) {
	var containedObjects = this.objects.filter(function (object) {
		// let verticalContain = false;
		// let horizontalContain = true;
		//
		let boundingRect = object.shape.getBoundingClientRect(true);
		//
		// if (boundingRect.top < endY) {
		// 	verticalContain = true;
		// } else if (object.bottom > startY) {
		// 	verticalContain = true;
		// }
		// if (object.left < endX) {
		// 	horizontalContain = true;
		// } else if (object.right > startX) {
		// 	horizontalContain = true;
		// }
		//
		// return verticalContain || horizontalContain;


		return !(
		boundingRect.left > endX ||
		boundingRect.right < startX ||
		boundingRect.top > endY ||
		boundingRect.bottom < startY);
	});
	console.log(containedObjects.length + ' objects in view.');
	return containedObjects;
};

class Border extends GameObject {
	constructor(x, y, side, length) {
		super(x, y, side, length);
	}

	createShape(x, y, side, length) {
		var x2, y2;
		switch (side) {
			case 'NORTH':
				x2 = x + length;
				y2 = y;
				break;
			case 'EAST':
				x2 = x;
				y2 = y + length;
				break;
			case 'SOUTH':
				x2 = x + length;
				y2 = y;
				break;
			case 'WEST':
				x2 = x;
				y2 = y + length;
				break;
		}

		let shape = new Two.Line(x, y, x2, y2);
		shape.noFill();
		shape.stroke = 'yellow';
		return shape;
	}

	visibleOnMinimap() {
		return false;
	}

	show() {
		groups.mapBorders.add(this.shape);
	}

	hide() {
		groups.mapBorders.remove(this.shape);
	}
}
