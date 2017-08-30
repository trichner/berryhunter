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

		let r = new Two.Vector();
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

		// let farthestCorner = 0;
		// for (let i = 1; i < cornerDistances.length; ++i) {
		// 	if (cornerDistances[i] > cornerDistances[farthestCorner]) {
		// 		farthestCorner = i;
		// 	}
		// }
		//
		// let overlap = Math.sqrt(cornerDistances[farthestCorner]) - Game.map.radius - Camera.extraBoundary;
		// if (overlap > 0) {
		// 	let corner;
		// 	switch (farthestCorner) {
		// 		case 0:
		// 			corner = topLeftCorner;
		// 			break;
		// 		case 1:
		// 			corner = topRightCorner;
		// 			break;
		// 		case 2:
		// 			corner = bottomRightCorner;
		// 			break;
		// 		case 3:
		// 			corner = bottomLeftCorner;
		// 			break;
		// 	}
		// 	let angle = Math.atan2(corner.y, corner.x);
		//
		// 	// vehicle.position.multiplyScalar(1 - Math.sqrt(overlap / vehicle.position.lengthSquared()));
		// 	// overlap = Math.sqrt(overlap);
		// 	vehicle.position.subSelf({
		// 		x: overlap * Math.cos(angle),
		// 		y: overlap * Math.sin(angle),
		// 	});
		// 	console.log("Overlap " + overlap + " in " + (angle * 180 / Math.PI));
		// } else {
		// 	console.log("No overlap");
		// }

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
