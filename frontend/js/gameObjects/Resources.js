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
		super(x, y, randomInt(50, 150));
	}

	createShape(x, y) {
		this.diameter = this.size;
		let shape = new Two.Ellipse(x, y, this.diameter);
		shape.fill = 'green';
		shape.stroke = 'darkgreen';
		shape.linewidth = 2;

		return shape;
	}
}

registerGameObjectSVG(RoundTree, 'img/roundTree.svg');

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

		return shape;
	}

	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Polygon(x, y, this.diameter * 2 * sizeFactor, 6);
		shape.fill = 'dimgray';
		shape.noStroke();

		return shape;
	}
}

registerGameObjectSVG(Stone, 'img/stone.svg');

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

		return shape;
	}

	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Polygon(x, y, this.diameter * 2 * sizeFactor, this.sides);
		shape.fill = 'gold';
		shape.noStroke();

		return shape;
	}
}

registerGameObjectSVG(Gold, 'img/bronze.svg');

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