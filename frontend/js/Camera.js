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
			Game.cameraGroup.translation.copy(translation);

			if (typeof this.onUpdate === 'function') {
				this.onUpdate(translation);
			}
		}
	}

	Camera.extraBoundary = 200;

	let Corners;

	function keepWithinMapBoundaries(vehicle) {
		if (Utils.isUndefined(Corners)){
			Corners = {
				topLeft: {
					offset: {x: -Game.width/2, y: -Game.height/2}
				},
				topRight: {
					offset: {x: Game.width/2, y: -Game.height/2}
				},
				bottomRight: {
					offset: {x: Game.width/2, y: Game.height/2}
				},
				bottomLeft: {
					offset: {x: -Game.width/2, y: Game.height/2}
				}
			};
			Corners.topLeft.angle = Math.atan2(Corners.topLeft.offset);
			Corners.topRight.angle = Math.atan2(Corners.topRight.offset);
			Corners.bottomRight.angle = Math.atan2(Corners.bottomRight.offset);
			Corners.bottomLeft.angle = Math.atan2(Corners.bottomLeft.offset);
		}

		let topLeftDistance = vehicle.position.clone().addSelf(Corners.topLeft.offset).lengthSquared();
		let topRightDistance = vehicle.position.clone().addSelf(Corners.topRight.offset).lengthSquared();
		let bottomRightDistance = vehicle.position.clone().addSelf(Corners.bottomRight.offset).lengthSquared();
		let bottomLeftDistance = vehicle.position.clone().addSelf(Corners.bottomLeft.offset).lengthSquared();
		let cornerDistances = [
			topLeftDistance, topRightDistance, bottomRightDistance, bottomLeftDistance
		];

		let farthestCorner = 0;
		for (let i = 1; i < cornerDistances.length; ++i){
			if (cornerDistances[i] > cornerDistances[farthestCorner]){
				farthestCorner = i;
			}
		}

		let overlap = cornerDistances[farthestCorner] - Math.pow(Game.map.radius + Camera.extraBoundary, 2);
		if (overlap > 0) {
			vehicle.position.multiplyScalar(1 - Math.sqrt(overlap / vehicle.position.lengthSquared()));
		}

		// const xBoundary = 700;
		// const yBoundary = 300;
		// let angle = Utils.TwoDimensional.angleBetween(0, 0, vehicle.position.x, vehicle.position.y);
		// angle += Math.PI / 4;
		// let boundary = Math.abs(Math.sin(angle)) * yBoundary + Math.abs(Math.cos(angle)) * xBoundary;
		// console.log(boundary);
		//
		// let r = Game.map.radius - boundary;
		// // distance of centers
		// let v = vehicle.position.clone().negate();
		// let abs = v.length();
		// // diff to allowed distance
		// let d = abs - r;
		// if (d <= 0) {
		// 	return;
		// }
		//
		// // normalize
		// let n = v.divideScalar(abs);
		// vehicle.position.addSelf(n.multiplyScalar(d));
		// // vehicle.velocity.multiplyScalar(0);
		// // vehicle.acceleration.multiplyScalar(0);
	}

	return Camera;
});
