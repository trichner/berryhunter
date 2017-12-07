"use strict";

define([
	'Game',
	'natureOfCode/arrive/vehicle',
	'Develop',
], function (Game, Vehicle, Develop, Vector) {
	class Camera {

		/**
		 *
		 * @param {Character} character the Character to follow
		 */
		constructor(character) {
			this.character = character;

			this.offset = new Vector(Game.centerX, Game.centerY);
			this.vehicle = new Vehicle(
				character.getX(),
				character.getY());

			this.vehicle.setMaxSpeed(character.movementSpeed * 2);

			/**
			 * @type {Vector}
			 */
			this.translation = this.vehicle.position;

			this.updateListener = this.update.bind(this);
			Game.renderer.on('prerender', this.updateListener);
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

		update() {
			this.vehicle.arrive(this.character.getPosition());
			this.vehicle.update();

			if (!Develop.isActive() ||
				(Develop.isActive() && Develop.settings.cameraBoundaries)) {
				keepWithinMapBoundaries(this.vehicle);
			}

			let translation = this.translation.clone();
			translation.negate();
			translation.addSelf(this.offset);
			Game.cameraGroup.translation.copy(translation);

			if (typeof this.onUpdate === 'function') {
				this.onUpdate(translation);
			}
		}

		destroy() {
			Game.renderer.off('update', this.updateListener);
		}
	}

	let Corners = [];
	let extraBoundary;

	Camera.setup = function () {
		extraBoundary = Math.min(Game.width, Game.height) / 2;

		for (let x = -1; x <= 1; x += 2) {
			for (let y = -1; y <= 1; y += 2) {
				Corners.push({x: x * Game.width / 2, y: y * Game.height / 2});
			}
		}
	};


	function keepWithinMapBoundaries(vehicle) {
		let corners = Corners.map(function (corner) {
			return vehicle.position.clone().addSelf(corner);
		});

		let r = new Vector();
		corners.forEach(function (corner) {
			let length = corner.length();
			let d = length - extraBoundary - Game.map.radius;
			if (d < 0) {
				return;
			}

			corner.divideScalar(length).multiplyScalar(-d);

			r.addSelf(corner);
		});

		vehicle.position.addSelf(r);
	}

	return Camera;
});
