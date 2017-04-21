"use strict";

class Camera {
	/**
	 *
	 * @param character the Character to follow
	 */
	constructor(character) {
		this.character = character;
		this.lastX = character.getX();
		this.lastY = character.getY();
		this.translation = new Two.Vector(0, 0);

		// this.shownGameObjects = [];

		two.bind('update', this.update.bind(this));
	}

	getX() {
		return this.translation.x;
	}

	getY() {
		return this.translation.y;
	}

	update() {
		let deltaX = this.character.getX() - this.lastX;
		let deltaY = this.character.getY() - this.lastY;
		if (deltaX == 0 && deltaY == 0){
			return;
		}

		let deltaV = new Two.Vector(deltaX, deltaY);

		this.translation.addSelf(deltaV);

		groups.gameObjects.translation.subSelf(deltaV);
		groups.mapBorders.translation.subSelf(deltaV);
		this.character.setX(this.lastX);
		this.character.setY(this.lastY);

		// if (deltaX != 0 ||deltaY != 0) {
		// 	let gameObjectsToShow = gameMap.getObjects(
		// 		this.translation.x,
		// 		this.translation.y,
		// 		this.translation.x + width,
		// 		this.translation.y + height);
		//
		// 	gameObjectsToShow.forEach(function (object) {
		// 		object.show();
		// 	});
		// }
	}
}