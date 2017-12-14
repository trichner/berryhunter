"use strict";

define([
	'Game',
	'natureOfCode/arrive/vehicle',
	'Develop',
	'Vector',
	'Utils',
], function (Game, Vehicle, Develop, Vector, Utils) {
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
			this.position = this.vehicle.position;

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
			return this.position.x;
		}

		getY() {
			return this.position.y;
		}

		update() {
			this.vehicle.arrive(this.character.getPosition());
			this.vehicle.update();

			if (!Develop.isActive() ||
				(Develop.isActive() && Develop.settings.cameraBoundaries)) {
				keepWithinMapBoundaries(this.vehicle);
			}

			let position = Vector.clone(this.position);
			position.negate();
			position.add(this.offset);
			Game.cameraGroup.position.copy(position);

			if (Utils.isFunction(this.onUpdate)) {
				this.onUpdate(position);
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
			return vehicle.position.clone().add(corner);
		});

		let r = new Vector();
		corners.forEach(function (corner) {
			let length = corner.length();
			let d = length - extraBoundary - Game.map.radius;
			if (d < 0) {
				return;
			}

			corner.divideScalar(length).multiplyScalar(-d);

			r.add(corner);
		});

		vehicle.position.add(r);
	}

	return Camera;
});
