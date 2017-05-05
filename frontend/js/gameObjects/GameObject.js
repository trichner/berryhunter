"use strict";

class GameObject {
	constructor(x, y, size, rotation) {
		this.size = size || Constants.GRID_SPACING / 2;
		this.rotation = rotation || 0;

		this.isMoveable = false;

		if (this.constructor.svg) {
			this.shape = this.createInjectionGroup(x, y, this.size, this.rotation);

			let callback = function () {
				console.log("Append custom SVG");
				this.injectionGroup._renderer.elem.appendChild(this.constructor.svg.cloneNode(true));
				two.unbind('render', callback);
			}.bind(this);
			two.bind('render', callback);
		} else {
			var args = Array.prototype.splice.call(arguments, 2);
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
		if (this.isMoveable) {
			this.shape.rotation = TwoDimensional.angleBetween(this.getX(), this.getY(), x, y);
		}
		this.shape.translation.set(x, y);
	}

	getPosition() {
		return this.shape.translation;
	}

	setX(x) {
		this.setPosition(x, this.getY());
	}

	getX() {
		return this.shape.translation.x;
	}

	setY(y) {
		this.setPosition(this.getX(), y);
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

class Tree extends GameObject {
	constructor(x, y, size, rotation) {
		super(x, y, size, rotation);
	}

	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Ellipse(x, y, this.diameter * sizeFactor);
		shape.stroke = 'green';
		shape.linewidth = 1;
		shape.noFill();

		return shape;
	}
}

class RoundTree extends Tree {
	constructor(x, y) {
		super(x, y)
	}

	createShape(x, y) {
		this.diameter = randomInt(50, 150);
		let shape = new Two.Ellipse(x, y, this.diameter);
		shape.fill = 'green';
		shape.stroke = 'darkgreen';
		shape.linewidth = 2;

		// physics.registerStatic(x, y, this.diameter);

		return shape;
	}
}

class MarioTree extends Tree {
	constructor(x, y) {
		super(x, y, randomInt(50, 150));
	}

	createShape(x, y) {
		this.diameter = this.size/2;
		let shape = new Two.Group();
		shape.translation.set(x, y);
		for (let i = 0; i < 5; i++) {
			let circle = new Two.Ellipse(
				(Math.cos(Math.PI * 2 / 5 * i) * this.diameter ),
				(Math.sin(Math.PI * 2 / 5 * i) * this.diameter ),
				this.diameter);
			shape.add(circle)
		}
		shape.fill = 'green';
		shape.stroke = 'darkgreen';
		shape.linewidth = 2;
		shape.rotation = random(0, Math.PI * 2);

		let ellipse = new Two.Ellipse(0, 0, this.diameter * 1.6);
		shape.add(ellipse);
		ellipse.fill = 'green';
		ellipse.noStroke();

		// physics.registerStatic(x, y, this.diameter * 2);

		return shape;
	}
}

registerGameObjectSVG(MarioTree, 'img/deciduousTree.svg');

class Stone extends GameObject {
	constructor(x, y) {
		super(x, y,
			randomInt(30, 90),
			random(0, Math.PI * 2)
		);
	}

	createShape(x, y) {
		this.diameter = this.size;
		let shape = new Two.Polygon(x, y, this.diameter, 6);
		shape.fill = 'darkgray';
		shape.stroke = 'dimgray';
		shape.linewidth = 2;
		shape.rotation = random(0, Math.PI * 2);

		// physics.registerStatic(x, y, this.diameter);

		return shape;
	}

	// TODO size modificator
	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Polygon(x, y, this.diameter * 2 * sizeFactor, 6);
		shape.fill = 'dimgray';
		shape.noStroke();

		return shape;
	}
}

registerGameObjectSVG(Stone, 'img/flintStone.svg');

class Gold extends GameObject {
	constructor(x, y) {
		super(x, y, randomInt(30, 70));
	}

	createShape(x, y) {
		this.diameter = this.size;
		this.sides = 5;
		if (this.diameter > 60) {
			this.sides += 2;
		}

		let shape = new Two.Polygon(x, y, this.diameter, this.sides);
		shape.fill = 'gold';
		shape.stroke = 'goldenrod';
		shape.linewidth = 2;
		shape.rotation = random(0, Math.PI * 2);

		// physics.registerStatic(x, y, this.diameter);

		return shape;
	}

	// TODO size modificator
	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Polygon(x, y, this.diameter * 2 * sizeFactor, this.sides);
		shape.fill = 'gold';
		shape.noStroke();

		return shape;
	}
}

registerGameObjectSVG(Gold, 'img/bronceStone.svg');

class BerryBush extends GameObject {
	constructor(x, y) {
		super(x, y, randomInt(20, 45));

	}

	createShape(x, y) {
		let shape = new Two.Group();
		shape.translation.set(x, y);
		shape.rotation = random(0, Math.PI * 2);

		this.diameter = randomInt(30, 50);
		let bush = new Two.Star(0, 0, this.diameter, this.diameter * 0.7, 5 + randomInt(1, 3) * 2);
		shape.add(bush);
		bush.fill = 'seagreen';
		bush.stroke = 'darkslategray';
		bush.linewidth = 2;


		let numberOfBerries = 3;
		if (this.diameter >= 37) {
			numberOfBerries++;
		}
		if (this.diameter >= 45) {
			numberOfBerries++;
		}
		for (let i = 0; i < numberOfBerries; i++) {
			let circle = new Two.Ellipse(
				(Math.cos(Math.PI * 2 / numberOfBerries * i) * this.diameter * 0.3),
				(Math.sin(Math.PI * 2 / numberOfBerries * i) * this.diameter * 0.3),
				5);
			shape.add(circle);
			circle.fill = 'purple';
			circle.noStroke();
		}

		return shape;
	}

	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Ellipse(x, y, this.diameter * 3 * sizeFactor);
		shape.fill = 'purple';
		shape.noStroke();

		return shape;
	}
}

registerGameObjectSVG(BerryBush, 'img/berryBush.svg');