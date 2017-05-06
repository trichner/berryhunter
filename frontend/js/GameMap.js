"use strict";

function GameMap() {
	if (MapEditor.isActive()) {
		let dimmensions = MapEditor.getMapDimensions();
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

/**
 * Returns an array of game objects that are currently within the given area.
 * @param startX
 * @param startY
 * @param endX
 * @param endY
 * @return Array
 */
GameMap.prototype.getObjects = function (startX, startY, endX, endY) {
	const containedObjects = this.objects.filter(function (object) {
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