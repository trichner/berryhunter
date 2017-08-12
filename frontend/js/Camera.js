"use strict";

define(['Game', 'Two', 'natureOfCode/arrive/vehicle', 'Develop'], function (Game, Two, Vehicle, Develop) {
	class Camera {
		/**
		 *
		 * @param {Character} character the Character to follow
		 */
		constructor(character) {
			this.character = character;

			this.offset = new Two.Vector(Game.centerX, Game.centerY);
			this.vehicle = new Vehicle(
				character.getX(),
				character.getY());

			this.vehicle.setMaxSpeed(character.movementSpeed * 2);

			/**
			 * @type {Two.Vector}
			 */
			this.translation = this.vehicle.position;

			// this.shownGameObjects = [];

			Game.two.bind('update', this.update.bind(this));
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
			if (vehicle.position.x < Game.centerX - Camera.extraBoundary) {
				vehicle.position.x = Game.centerX - Camera.extraBoundary;
				vehicle.velocity.x = 0;
				vehicle.acceleration.x = 0;
			} else if (vehicle.position.x > Game.map.width - Game.centerX + Camera.extraBoundary) {
				vehicle.position.x = Game.map.width - Game.centerX + Camera.extraBoundary;
				vehicle.velocity.x = 0;
				vehicle.acceleration.x = 0;
			}

			if (vehicle.position.y < Game.centerY - Camera.extraBoundary) {
				vehicle.position.y = Game.centerY - Camera.extraBoundary;
				vehicle.velocity.y = 0;
				vehicle.acceleration.y = 0;
			} else if (vehicle.position.y > Game.map.height - Game.centerY + Camera.extraBoundary) {
				vehicle.position.y = Game.map.height - Game.centerY + Camera.extraBoundary;
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
			Game.layers.gameObjects.translation.copy(translation);
			Game.layers.mapBorders.translation.copy(translation);
			Game.layers.character.translation.copy(translation);

			if (typeof this.onUpdate === 'function') {
				this.onUpdate(translation);
			}
		}
	}

	Camera.extraBoundary = 100;

	return Camera;
});
