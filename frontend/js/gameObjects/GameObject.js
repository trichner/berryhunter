"use strict";

class GameObject {
	constructor(x, y) {
		var args = Array.prototype.splice.call(arguments, 2);
		this.shape = this.createShape.apply(this, [x, y].concat(args));
		this.show();
	}

	createShape(x, y) {
		console.error('createShape not implemented for ' + this.constructor.name);
	}

	visibleOnMinimap() {
		return true;
	}

	createMinimapIcon(x, y, sizeFactor) {
		console.error('createMinimapIcon not implemented for ' + this.constructor.name);
	}

	setX(x) {
		this.shape.translation.x = x;
	}

	getX() {
		return this.shape.translation.x;
	}

	setY(y) {
		this.shape.translation.y = y;
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
	constructor(x, y) {
		super(x, y)
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
		super(x, y)
	}

	createShape(x, y) {
		this.diameter = randomInt(25, 75);
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

class Stone extends GameObject {
	constructor(x, y) {
		super(x, y)
	}

	createShape(x, y) {
		this.diameter = randomInt(30, 90);
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

class Gold extends GameObject {
	constructor(x, y) {
		super(x, y)
	}

	createShape(x, y) {
		this.diameter = randomInt(30, 90);
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

class BerryBush extends GameObject {
	constructor(x, y) {
		super(x, y)
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