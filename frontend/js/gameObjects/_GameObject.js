"use strict";

var movementInterpolatedObjects = new Set();

class GameObject {
	constructor(x, y, size, rotation) {
		this.size = size || Constants.GRID_SPACING / 2;
		this.rotation = rotation || 0;

		this.isMoveable = false;
		this.rotateOnPositioning = false;

		if (this.constructor.svg) {
			this.shape = new InjectedSVG(this.constructor.svg, x, y, this.size, this.rotation);
		} else {
			const args = Array.prototype.splice.call(arguments, 2);
			this.shape = this.createShape.apply(this, [x, y].concat(args));
		}

		this.show();
	}

	/**
	 * Fallback method if there is no SVG bound to this gameObject class.
	 * @param x
	 * @param y
	 */
	createShape(x, y) {
		console.error('createShape not implemented for ' + this.constructor.name);
	}

	visibleOnMinimap() {
		return true;
	}

	createMinimapIcon(x, y, sizeFactor) {
		console.error('createMinimapIcon not implemented for ' + this.constructor.name);
	}

	setPosition(x, y) {
		if (isDefined(this.desiredPosition) &&
			this.desiredPosition.x > (x - 0.2) && this.desiredPosition.x < (x + 0.2) &&
			this.desiredPosition.y > (y - 0.2) && this.desiredPosition.y < (y + 0.2)) {
			return;
		}

		if (this.rotateOnPositioning) {
			this.setRotation(TwoDimensional.angleBetween(this.getX(), this.getY(), x, y));
		}

		if (Constants.MOVEMENT_INTERPOLATION) {
			this.desiredPosition = new Two.Vector(x, y); //.subSelf(this.shape.translation);
			this.desireTimestamp = performance.now();
			movementInterpolatedObjects.add(this);
		} else {
			this.shape.translation.set(x, y);
		}
	}

	movePosition(deltaX, deltaY) {
		if (arguments.length === 1) {
			// Seems to be a vector
			deltaY = deltaX.y;
			deltaX = deltaX.x;
		}

		this.setPosition(
			this.getX() + deltaX,
			this.getY() + deltaY
		);
	}

	getPosition() {
		// Defensive copy
		return this.shape.translation.clone();
	}

	getX() {
		return this.getPosition().x;
	}

	getY() {
		return this.getPosition().y;
	}

	setRotation(rotation) {
		this.shape.rotation = rotation;
	}

	show() {
		groups.gameObjects.add(this.shape);
	}

	hide() {
		groups.gameObjects.remove(this.shape);
	}
}

function moveInterpolatedObjects() {
	let now = performance.now();

	movementInterpolatedObjects.forEach(
		/**
		 *
		 * @param {GameObject} gameObject
		 */
		function (gameObject) {
			let elapsedTimePortion = (now - gameObject.desireTimestamp) / Constants.SERVER_TICKRATE;
			if (elapsedTimePortion >= 1) {
				// console.log('Last Interpolation length',
				// gameObject.shape.translation.distanceTo(gameObject.desiredPosition));
				gameObject.shape.translation.copy(gameObject.desiredPosition);
				movementInterpolatedObjects.delete(gameObject);
			} else {
				// let prevPos = gameObject.shape.translation.clone();
				gameObject.shape.translation.lerp(gameObject.desiredPosition, elapsedTimePortion);
				// console.log('Interpolation length', prevPos.distanceTo(gameObject.shape.translation));
			}
		});
}