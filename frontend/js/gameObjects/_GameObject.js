"use strict";

class GameObject {
	constructor(x, y, size, rotation) {
		this.size = size || Constants.GRID_SPACING / 2;
		this.rotation = rotation || 0;

		this.rotateOnPositioning = false;

		if (this.constructor.svg) {
			this.shape = this.createInjectionGroup(x, y, this.size, this.rotation);

			let callback = function () {
				this.injectionGroup._renderer.elem.appendChild(this.constructor.svg.cloneNode(true));
				two.unbind('render', callback);
			}.bind(this);
			two.bind('render', callback);
		} else {
			const args = Array.prototype.splice.call(arguments, 2);
			this.shape = this.createShape.apply(this, [x, y].concat(args));
		}

		this.show();
	}

	createInjectionGroup(x, y, size, rotation) {
		let group = new Two.Group();
		group.translation.set(x, y);
		// group.translation.set(x-size, y-size);
		this.injectionGroup = new Two.Group();
		group.add(this.injectionGroup);
		this.injectionGroup.scale = (size / (Constants.GRID_SPACING / 2));
		// this.injectionGroup.rotation = rotation;
		this.injectionGroup.translation.set(-size, -size);
		return group;
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

	show() {
		groups.gameObjects.add(this.shape);
	}

	hide() {
		groups.gameObjects.remove(this.shape);
	}
}