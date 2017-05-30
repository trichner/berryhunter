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

	getScreenX(mapX) {
		return mapX - this.getX() + this.offset.x;
	}

	getScreenY(mapY) {
		return mapY - this.getY() + this.offset.y;
	}

	getX() {
		return this.translation.x;
	}

	getY() {
		return this.translation.y;
	}

	static keepWithinMapBoundaries(vehicle) {
		if (vehicle.position.x < centerX) {
			vehicle.position.x = centerX;
			vehicle.velocity.x = 0;
			vehicle.acceleration.x = 0;
		} else if (vehicle.position.x > gameMap.width - centerX) {
			vehicle.position.x = gameMap.width - centerX;
			vehicle.velocity.x = 0;
			vehicle.acceleration.x = 0;
		}

		if (vehicle.position.y < centerY) {
			vehicle.position.y = centerY;
			vehicle.velocity.y = 0;
			vehicle.acceleration.y = 0;
		} else if (vehicle.position.y > gameMap.height - centerY) {
			vehicle.position.y = gameMap.height - centerY;
			vehicle.velocity.y = 0;
			vehicle.acceleration.y = 0;
		}
	}

	update() {
		this.vehicle.arrive(this.character.getPosition());
		this.vehicle.update();

		if (!Develop.isActive() ||
			(Develop.isActive() && Develop.settings.cameraBoundaries)) {
			Camera.keepWithinMapBoundaries(this.vehicle);
		}

		let translation = this.translation.clone();
		translation.negate();
		translation.addSelf(this.offset);
		groups.gameObjects.translation.copy(translation);
		groups.mapBorders.translation.copy(translation);
		groups.character.translation.copy(translation);

		if (typeof this.onUpdate === 'function') {
			this.onUpdate(translation);
		}
	}
}