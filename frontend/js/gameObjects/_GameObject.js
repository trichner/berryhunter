"use strict";

define(['Game', 'InjectedSVG', 'Constants', 'Two', 'Utils'], function (Game, InjectedSVG, Constants, Two, Utils) {

	let movementInterpolatedObjects = new Set();
	let rotatingObjects = new Set();

	class GameObject {
		constructor(gameLayer, x, y, size, rotation) {
			this.layer = gameLayer;
			this.size = size || Constants.GRID_SPACING / 2;
			this.rotation = rotation || 0;
			this.turnRate = Constants.DEFAULT_TURN_RATE;

			this.isMoveable = false;
			this.rotateOnPositioning = false;
			this.visibleOnMinimap = true;

			const args = Array.prototype.splice.call(arguments, 5);
			this.shape = this.initShape.apply(this, [x, y, size, rotation].concat(args));
			this.show();
		}

		initShape(x, y, size, rotation) {
			if (this.constructor.svg) {
				return new InjectedSVG(this.constructor.svg, x, y, this.size, this.rotation);
			} else {
				const args = Array.prototype.splice.call(arguments, 2);
				return this.createShape.apply(this, [x, y].concat(args));
			}
		}

		/**
		 * Fallback method if there is no SVG bound to this gameObject class.
		 * @param x
		 * @param y
		 */
		createShape(x, y) {
			console.error('createShape not implemented for ' + this.constructor.name);
		}

		createMinimapIcon() {
			console.error('createMinimapIcon not implemented for ' + this.constructor.name);
		}

		setPosition(x, y) {
			if (Utils.isUndefined(x)) {
				throw "x has to be defined.";
			}
			if (Utils.isUndefined(y)) {
				throw "y has to be defined.";
			}

			if (Utils.isDefined(this.desiredPosition) && //
				Utils.nearlyEqual(this.desiredPosition.x, x, 0.01) && //
				Utils.nearlyEqual(this.desiredPosition.y, y, 0.01)) {
				return false;
			}

			if (this.rotateOnPositioning) {
				this.setRotation(Utils.TwoDimensional.angleBetween(this.getX(), this.getY(), x, y));
			}

			if (Constants.MOVEMENT_INTERPOLATION) {
				this.desiredPosition = new Two.Vector(x, y); //.subSelf(this.shape.translation);
				this.desireTimestamp = performance.now();
				movementInterpolatedObjects.add(this);
			} else {
				this.shape.translation.set(x, y);
			}

			return true;
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
			if (Utils.isUndefined(rotation)) {
				return;
			}

			rotation %= 2 * Math.PI;

			if (Constants.LIMIT_TURN_RATE) {
				this.desiredRotation = rotation;
				this.desiredRotationTimestamp = performance.now();
				rotatingObjects.add(this);
			} else {
				this.getRotationShape().rotation = rotation;
			}
		}

		getRotation() {
			return this.getRotationShape().rotation;
		}

		getRotationShape() {
			return this.shape;
		}

		show() {
			this.layer.add(this.shape);
		}

		hide() {
			this.layer.remove(this.shape);
		}
	}

	GameObject.setup = function () {
		if (Constants.MOVEMENT_INTERPOLATION) {
			Game.two.bind('update', moveInterpolatedObjects);
		}
		if (Constants.LIMIT_TURN_RATE) {
			Game.two.bind('update', applyTurnRate);
		}
	};

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
					gameObject.shape.translation.copy(gameObject.desiredPosition);
					movementInterpolatedObjects.delete(gameObject);
				} else {
					gameObject.shape.translation.lerp(gameObject.desiredPosition, elapsedTimePortion);
				}
			});
	}

	function applyTurnRate() {
		let now = performance.now();

		rotatingObjects.forEach(
			/**
			 *
			 * @param {GameObject} gameObject
			 */
			function (gameObject) {
				let elapsedTime = now - gameObject.desiredRotationTimestamp;
				let rotationDifference = elapsedTime * gameObject.turnRate;
				let rotationShape = gameObject.getRotationShape();
				let currentRotation = rotationShape.rotation;
				let desiredRotation = gameObject.desiredRotation;
				// Choose direction of turning by applying a sign to rotationDifference
				if (currentRotation < desiredRotation) {
					if (Math.abs(currentRotation - desiredRotation) >= Math.PI) {
						rotationDifference = -rotationDifference;
					}
				} else {
					if (Math.abs(currentRotation - desiredRotation) < Math.PI) {
						rotationDifference = -rotationDifference;
					}
				}

				if ((rotationDifference >= 0 &&  currentRotation + rotationDifference >= desiredRotation) ||
					(rotationDifference < 0 &&  currentRotation + rotationDifference <= desiredRotation)) {
					rotationShape.rotation = desiredRotation;
					rotatingObjects.delete(gameObject);
				} else {
					rotationShape.rotation += rotationDifference;
				}

				gameObject.desiredRotationTimestamp = now;
			});
	}

	return GameObject;
});
