"use strict";


const gameObjectClasses = {
	Character,
	RoundTree,
	MarioTree,
	Stone,
	Gold,
	BerryBush,
	Rabbit,
	SabreToothTiger
};

function GameMap() {
	if (MapEditor.isActive()) {
		let dimmensions = MapEditor.getMapDimensions();
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

GameMap.prototype.addOrUpdate = function (entity) {
	let gameObject = this.objects[entity.id];
	if (gameObject) {
		gameObject.setX(entity.x);
		gameObject.setY(entity.y);
	} else {
		gameObject = new gameObjectClasses[entity.object](entity.x, entity.y);
		this.objects[entity.id] = gameObject;
	}
};