"use strict";

define(['Vector', 'Camera'], function (Vector, Camera) {
	class Spectator {
		constructor(x, y) {
			this.position = new Vector(x, y);
			this.camera = new Camera(this);
			this.movementSpeed = Math.max(Game.width, Game.height);
		}

		getPosition() {
			return this.position;
		}

		getX() {
			return this.position.x;
		}

		getY() {
			return this.position.y;
		}

		remove() {
			// TODO remove camera etc
		}
	}

	return Spectator;
});