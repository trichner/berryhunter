'use strict';

define(['Game', 'InjectedSVG', 'Constants', 'Vector', 'Utils', 'GraphicsConfig', 'gameObjects/StatusEffect'],
	function (Game, InjectedSVG, Constants, Vector, Utils, GraphicsConfig, StatusEffect) {

		let movementInterpolatedObjects = new Set();
		let rotatingObjects = new Set();

		class GameObject {
			constructor(gameLayer, x, y, size, rotation) {
				this.layer = gameLayer;
				this.size = size || Constants.GRAPHIC_BASE_SIZE / 2;
				this.rotation = rotation || 0;
				this.turnRate = Constants.DEFAULT_TURN_RATE;

				this.isMoveable = false;
				this.rotateOnPositioning = false;
				this.visibleOnMinimap = true;

				const args = Array.prototype.splice.call(arguments, 5);
				this.shape = this.initShape.apply(this, [x, y, size, rotation].concat(args));
				this.statusEffects = this.createStatusEffects();
				for (let statusEffect in this.statusEffects) {
					this.statusEffects[statusEffect].id = statusEffect;
				}
				this.activeStatusEffect = null;
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

			createStatusEffects() {
				// Default NOP
				return {};
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
					this.desiredPosition = new Vector(x, y); //.sub(this.shape.position);
					this.desireTimestamp = performance.now();
					movementInterpolatedObjects.add(this);
				} else {
					this.shape.position.set(x, y);
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
				// FIXME necessary?
				return Vector.clone(this.shape.position);
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

				if (Constants.LIMIT_TURN_RATE && this.turnRate > 0) {
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
				this.layer.addChild(this.shape);
			}

			hide() {
				this.layer.removeChild(this.shape);
			}

			updateStatusEffects(newStatusEffects) {
				this.scheduledStatusEffect = null;
				if (!_.isArray(newStatusEffects) || newStatusEffects.length === 0) {
					if (this.activeStatusEffect !== null) {
						this.activeStatusEffect.hide();
						this.activeStatusEffect = null;
					}
				} else {
					newStatusEffects = StatusEffect.sortByPriority(newStatusEffects);
					let newStatusEffect = newStatusEffects.find(function (newStatusEffect) {
						return this.statusEffects.hasOwnProperty(newStatusEffect.id);
					}, this);
					if (Utils.isDefined(newStatusEffect)) {
						if (this.activeStatusEffect === null) {
							// No effect running, run one
							this.activeStatusEffect = this.statusEffects[newStatusEffect.id];
							this.activeStatusEffect.show();
						} else if (this.activeStatusEffect.id !== newStatusEffect.id) {
							this.activeStatusEffect.forceHide();
							this.activeStatusEffect = this.statusEffects[newStatusEffect.id];
							this.activeStatusEffect.show();
						}
					} else {
						console.log(newStatusEffects.map(e => e.id), ' not found in ' + this.constructor.name);
						if (this.activeStatusEffect !== null) {
							this.activeStatusEffect.hide();
							this.activeStatusEffect = null;
						}
					}
				}
			}
		}

		GameObject.setup = function () {
			if (Constants.MOVEMENT_INTERPOLATION) {
				Game.renderer.on('prerender', moveInterpolatedObjects);
			}
			if (Constants.LIMIT_TURN_RATE) {
				Game.renderer.on('prerender', applyTurnRate);
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
						gameObject.shape.position.copy(gameObject.desiredPosition);
						movementInterpolatedObjects.delete(gameObject);
					} else {
						gameObject.shape.position.copy(
							Vector.lerp(
								gameObject.shape.position,
								gameObject.desiredPosition,
								elapsedTimePortion));
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

					if ((rotationDifference >= 0 && currentRotation + rotationDifference >= desiredRotation) ||
						(rotationDifference < 0 && currentRotation + rotationDifference <= desiredRotation)) {
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
