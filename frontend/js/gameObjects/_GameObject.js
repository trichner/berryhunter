"use strict";

define(['Game', 'InjectedSVG', 'Constants', 'Vector', 'Utils', 'FilterPool'], function (Game, InjectedSVG, Constants, Vector, Utils, FilterPool) {

	let movementInterpolatedObjects = new Set();
	let rotatingObjects = new Set();
	let hitAnimationFilterPool;
	let hitAnimations = new Set();
	const HIT_ANIMATION_FLOOD_OPACITY = 1;

	class GameObject {
		constructor(gameLayer, x, y, size, rotation) {
			this.layer = gameLayer;
			this.size = size || Constants.GRID_SPACING / 2;
			this.rotation = rotation || 0;
			this.turnRate = Constants.DEFAULT_TURN_RATE;

			this.isMoveable = false;
			this.rotateOnPositioning = false;
			this.visibleOnMinimap = true;

			this.hitAnimation = null;

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
				this.desiredPosition = new Vector(x, y); //.subSelf(this.shape.position);
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
			return this.shape.position.clone();
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
			this.layer.remove(this.shape);
		}

		playHitAnimation() {
			let now = performance.now();
			if (this.hitAnimation === null) {
				this.hitAnimation = {
					filter: hitAnimationFilterPool.getFilter(),
					start: now,
					end: now + 500,
					gameObject: this
				};
				this.getRotationShape()._renderer.elem.setAttribute('filter', 'url(#' + this.hitAnimation.filter.id + ')');
				hitAnimations.add(this.hitAnimation);
			} else {
				// A hit animation already runs - reset it
				this.hitAnimation.start = now;
				this.hitAnimation.end = now + 500;
			}
		}

		removeHitAnimation() {
			this.getRotationShape()._renderer.elem.removeAttribute('filter');
			this.hitAnimation = null;
		}
	}

	GameObject.setup = function (mainSvgElement) {
		if (Constants.MOVEMENT_INTERPOLATION) {
			Game.renderer.on('prerender', moveInterpolatedObjects);
		}
		if (Constants.LIMIT_TURN_RATE) {
			Game.renderer.on('prerender', applyTurnRate);
		}

		//FIXME Hit Animation Filter
		return;
		Game.renderer.on('prerender', animateHits);

		// Create filter for hit animation

		let defContainer = mainSvgElement.getElementsByTagName('defs')[0];

		let hitAnimationFilter = Utils.svgToElement(
			'<filter x="0" y="0" width="1" height="1" ' +
			'color-interpolation-filters="sRGB" id="hitAnimationFilter"></filter>');
		defContainer.appendChild(hitAnimationFilter);

		hitAnimationFilter.appendChild(Utils.svgToElement('<feFlood ' +
			'flood-opacity="' + HIT_ANIMATION_FLOOD_OPACITY + '" ' +
			// Health Bar dark red
			'flood-color="' + '#bf153a' + '" />'));

		hitAnimationFilter.appendChild(Utils.svgToElement('<feBlend ' +
			'in2="SourceGraphic" ' +
			'mode="multiply" />'));
		hitAnimationFilter.appendChild(Utils.svgToElement('<feComposite ' +
			'in2="SourceGraphic" ' +
			'operator="in" />'));

		hitAnimationFilterPool = new FilterPool(hitAnimationFilter, 'feFlood');
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
					gameObject.shape.position.lerp(gameObject.desiredPosition, elapsedTimePortion);
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

	function animateHits() {
		let now = performance.now();

		hitAnimations.forEach(
			/**
			 *
			 * @param {{filter: {id: string, domElement: Element}, start: number, end: number}} hitAnimation
			 */
			function (hitAnimation) {
				let opacity;
				if (now >= hitAnimation.end) {
					opacity = 0;
					hitAnimationFilterPool.freeFilter(hitAnimation.filter);
					hitAnimation.gameObject.removeHitAnimation();
					hitAnimations.delete(hitAnimation);
				} else {
					// opacity = Utils.map(now, HIT_ANIMATION_FLOOD_OPACITY, 0, hitAnimation.start, hitAnimation.end);
					opacity = Utils.map(now, hitAnimation.start, hitAnimation.end, HIT_ANIMATION_FLOOD_OPACITY, 0);
				}
				hitAnimation.filter.domElement.setAttribute('flood-opacity', opacity);
			});
	}

	return GameObject;
});
