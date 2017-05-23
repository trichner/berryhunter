"use strict";


const gameObjectClasses = {
	Character,

	RoundTree,
	MarioTree,
	Stone,
	Gold,
	BerryBush,
	Rabbit,
	SaberToothCat
};

function GameMapWithBackend() {
	if (MapEditor.isActive()) {
		let dimmensions = MapEditor.getMapDimensions();
		this.width = dimmensions.width;
		this.height = dimmensions.height;
	} else {
		this.width = 100 * 100;
		this.height = 100 * 100;
	}

	/*
	 * Create map borders
	 */
	// groups.mapBorders.add(
	// 	new Border(0, 0, 'NORTH', this.width),
	// 	new Border(this.width, 0, 'EAST', this.height),
	// 	new Border(0, this.height, 'SOUTH', this.width),
	// 	new Border(0, 0, 'WEST', this.height));

	this.objects = {};

	// console.info('Map is ' + this.width + ' x ' + this.height);
	// console.log(this.objects.length + ' objects generated');
}

GameMapWithBackend.prototype.addOrUpdate = function (entity) {
	let gameObject = this.objects[entity.id];
	if (gameObject) {
		gameObject.setPosition(entity.x, entity.y);
		gameObject.updateAABB(entity.aabb);
	} else {
		if (entity.object === 'Border') {
			let startX = entity.aabb.LowerX;
			let startY = entity.aabb.LowerY;
			let endX = entity.aabb.UpperX;
			let endY = entity.aabb.UpperY;
			let x1, y1, x2, y2;

			if (startX > 0) {
				// Right Border
				x1 = startX;
				y1 = 0;
				x2 = x1;
				y2 = endY + startY;
			} else if (startY > 0) {
				// Bottom Border
				x1 = 0;
				y1 = startY;
				x2 = endX + startX;
				y2 = startY;
			} else if (endX <= 0) {
				// Left Border
				x1 = 0;
				y1 = 0;
				x2 = x1;
				y2 = endY + startY;
			} else if (endY <= 0) {
				// Top Border
				x1 = 0;
				y1 = 0;
				x2 = endX + startX;
				y2 = y1;
			} else {
				throw "Unknown Border orientation " + JSON.stringify(entity.aabb);
			}

			// if (startX <= 0) {
			// 	if (endY <= 0) {
			// 		// Top Border
			// 		x1 = 0;
			// 		y1 = 0;
			// 		x2 = endX + startX;
			// 		y2 = y1;
			// 	} else {
			// 		// Left Border
			// 		x1 = 0;
			// 		y1 = 0;
			// 		x2 = x1;
			// 		y2 = endY + startY;
			// 	}
			// } else {
			// 	if (startY <= 0) {
			// 		// Right Border
			// 		x1 = startX;
			// 		y1 = 0;
			// 		x2 = x1;
			// 		y2 = endY + startY;
			// 	} else {
			// 		// Bottom Border
			// 		x1 = 0;
			// 		y1 = startY;
			// 		x2 = endX + startX;
			// 		y2 = startY;
			// 	}
			// }
			// gameObject = new Border(
			// 	x1 + (endX - startX) / 2,
			// 	y1 + (endY - startY) / 2,
			// 	x2 + (endX - startX) / 2,
			// 	y2 + (endY - startY) / 2);
			gameObject = new Border(x1, y1, x2, y2);
			gameObject.updateAABB(entity.aabb);
		} else {
			gameObject = new gameObjectClasses[entity.object](entity.x, entity.y);
		}
		miniMap.add(gameObject);
		this.objects[entity.id] = gameObject;
	}
};