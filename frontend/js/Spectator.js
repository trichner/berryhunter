'use strict';

define(['Game', 'Vector', 'Camera'], function (Game, Vector, Camera) {
	class Spectator {
		constructor(x, y) {
			this.position = new Vector(x, y);
			this.movementSpeed = Math.max(Game.width, Game.height);
			this.camera = new Camera(this);
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
			this.camera.destroy();
		}
	}

	return Spectator;
});