"use strict";

class Camera {
	/**
	 *
	 * @param {Character} character the Character to follow
	 */
	constructor(character) {
		this.character = character;

		this.offset = new Two.Vector(centerX, centerY);
		this.vehicle = new Vehicle(
			character.getX(),
			character.getY());

		this.vehicle.setMaxSpeed(character.movementSpeed * 2);

		/**
		 * @type {Two.Vector}
		 */
		this.translation = this.vehicle.position;

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
		this.vehicle.arrive(this.character.getPosition());
		this.vehicle.update();

		let translation = this.translation.clone();
		translation.negate();
		translation.addSelf(this.offset);
		groups.gameObjects.translation.copy(translation);
		groups.mapBorders.translation.copy(translation);
		groups.character.translation.copy(translation);

		if (typeof this.onUpdate === 'function'){
			this.onUpdate(translation);
		}
	}
}