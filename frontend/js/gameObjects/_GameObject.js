"use strict";

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
		if (this.rotateOnPositioning) {
			this.shape.rotation = TwoDimensional.angleBetween(this.getX(), this.getY(), x, y);
		}
		this.shape.translation.set(x, y);
	}

	getPosition() {
		return this.shape.translation;
	}

	getX() {
		return this.shape.translation.x;
	}

	getY() {
		return this.shape.translation.y;
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