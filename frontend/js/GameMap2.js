"use strict";


const gameObjectClasses = {
	RoundTree,
	MarioTree,
	Stone,
	Gold,
	BerryBush,
	Rabbit,
	SabreToothTiger
};

function GameMap() {
	if (QuadrantRenderer.isActive()) {
		let dimmensions = QuadrantRenderer.getMapDimensions();
		this.width = dimmensions.width;
		this.height = dimmensions.height;
	} else {
		this.width = width;
		this.height = height;
	}

	/*
	 * Create map borders
	 */
	groups.mapBorders.add(
		new Border(0, 0, 'NORTH', this.width),
		new Border(this.width, 0, 'EAST', this.height),
		new Border(0, this.height, 'SOUTH', this.width),
		new Border(0, 0, 'WEST', this.height));

	this.objects = {};

	// console.info('Map is ' + this.width + ' x ' + this.height);
	// console.log(this.objects.length + ' objects generated');
}


GameMap.prototype.add = function (objectPosition) {
	let gameObject = this.objects[objectPosition.id];
	if (gameObject) {
		gameObject.setX(objectPosition.x);
		gameObject.setY(objectPosition.y);
	}else {
		gameObject = new gameObjectClasses[objectPosition.object](objectPosition.x, objectPosition.y);
		this.objects[objectPosition.id] = gameObject;
	}
};

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
