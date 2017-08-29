"use strict";

define([
	'Game',
	'Two',
	'natureOfCode/arrive/vehicle',
	'Develop',
	'Utils',
], function (Game, Two, Vehicle, Develop, Utils) {
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
			const xBoundary = 700;
			const yBoundary = 300;
			let angle = Utils.TwoDimensional.angleBetween(0, 0, vehicle.position.x, vehicle.position.y);
			angle += Math.PI / 4;
			let boundary = Math.abs(Math.sin(angle)) * yBoundary + Math.abs(Math.cos(angle)) * xBoundary;
			console.log(boundary);

			let r = Game.map.radius - boundary;
			// distance of centers
			let v = vehicle.position.clone().negate();
			let abs = v.length();
			// diff to allowed distance
			let d = abs - r;
			if (d <= 0) {
				return;
			}

			// normalize
			let n = v.divideScalar(abs);
			vehicle.position.addSelf(n.multiplyScalar(d));
			// vehicle.velocity.multiplyScalar(0);
			// vehicle.acceleration.multiplyScalar(0);
		}

		update() {
			this.vehicle.arrive(this.character.getPosition());
			this.vehicle.update();

			// if (!Develop.isActive() ||
			// 	(Develop.isActive() && Develop.settings.cameraBoundaries)) {
			// 	Camera.keepWithinMapBoundaries(this.vehicle);
			// }

			let translation = this.translation.clone();
			translation.negate();
			translation.addSelf(this.offset);
			Game.cameraGroup.translation.copy(translation);

			if (typeof this.onUpdate === 'function') {
				this.onUpdate(translation);
			}
		}
	}

	Camera.extraBoundary = 200;

	return Camera;
});
