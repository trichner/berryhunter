class Tree extends GameObject {
	constructor(x, y, size, rotation) {
		super(x, y, size, rotation);
	}

	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Ellipse(x, y, this.size * sizeFactor);
		shape.stroke = 'green';
		shape.linewidth = 1;
		shape.noFill();

		return shape;
	}
}

class RoundTree extends Tree {
	constructor(x, y, size) {
		super(x, y, size || randomInt(50, 150));
	}

	createShape(x, y) {
		let shape = new Two.Ellipse(x, y, this.size);
		shape.fill = 'green';
		shape.stroke = 'darkgreen';
		shape.linewidth = 2;

		return shape;
	}
}

registerGameObjectSVG(RoundTree, 'img/roundTree.svg');

class MarioTree extends Tree {
	constructor(x, y, size) {
		super(x, y, size || randomInt(50, 150));
	}

	createShape(x, y) {
		this.size = this.size / 2;
		let shape = new Two.Group();
		shape.translation.set(x, y);
		for (let i = 0; i < 5; i++) {
			let circle = new Two.Ellipse(
				(Math.cos(Math.PI * 2 / 5 * i) * this.size ),
				(Math.sin(Math.PI * 2 / 5 * i) * this.size ),
				this.size);
			shape.add(circle)
		}
		shape.fill = 'green';
		shape.stroke = 'darkgreen';
		shape.linewidth = 2;
		shape.rotation = random(0, Math.PI * 2);

		let ellipse = new Two.Ellipse(0, 0, this.size * 1.6);
		shape.add(ellipse);
		ellipse.fill = 'green';
		ellipse.noStroke();

		return shape;
	}
}

registerGameObjectSVG(MarioTree, 'img/deciduousTree.svg');

class Stone extends GameObject {
	constructor(x, y, size) {
		super(x, y,
			size || randomInt(30, 90),
			random(0, Math.PI * 2)
		);
	}

	createShape(x, y) {
		let shape = new Two.Polygon(x, y, this.size, 6);
		shape.fill = 'darkgray';
		shape.stroke = 'dimgray';
		shape.linewidth = 2;
		shape.rotation = random(0, Math.PI * 2);

		return shape;
	}

	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Polygon(x, y, this.size * 2 * sizeFactor, 6);
		shape.fill = 'dimgray';
		shape.noStroke();

		return shape;
	}
}

registerGameObjectSVG(Stone, 'img/stone.svg');

class Bronze extends GameObject {
	constructor(x, y, size) {
		super(x, y, size || randomInt(30, 70));
	}

	createShape(x, y) {
		this.sides = 5;
		if (this.size > 60) {
			this.sides += 2;
		}

		let shape = new Two.Polygon(x, y, this.size, this.sides);
		shape.fill = 'gold';
		shape.stroke = 'goldenrod';
		shape.linewidth = 2;
		shape.rotation = random(0, Math.PI * 2);

		return shape;
	}

	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Polygon(x, y, this.size * 2 * sizeFactor, this.sides);
		shape.fill = 'gold';
		shape.noStroke();

		return shape;
	}
}

registerGameObjectSVG(Bronze, 'img/bronze.svg');

class BerryBush extends GameObject {
	constructor(x, y, size) {
		super(x, y, size || randomInt(20, 45));

	}

	createShape(x, y) {
		let shape = new Two.Group();
		shape.translation.set(x, y);
		shape.rotation = random(0, Math.PI * 2);

		let bush = new Two.Star(0, 0, this.size, this.size * 0.7, 5 + randomInt(1, 3) * 2);
		shape.add(bush);
		bush.fill = 'seagreen';
		bush.stroke = 'darkslategray';
		bush.linewidth = 2;


		let numberOfBerries = 3;
		if (this.size >= 37) {
			numberOfBerries++;
		}
		if (this.size >= 45) {
			numberOfBerries++;
		}
		for (let i = 0; i < numberOfBerries; i++) {
			let circle = new Two.Ellipse(
				(Math.cos(Math.PI * 2 / numberOfBerries * i) * this.size * 0.3),
				(Math.sin(Math.PI * 2 / numberOfBerries * i) * this.size * 0.3),
				5);
			shape.add(circle);
			circle.fill = 'purple';
			circle.noStroke();
		}

		return shape;
	}

	createMinimapIcon(x, y, sizeFactor) {
		let shape = new Two.Ellipse(x, y, this.size * 3 * sizeFactor);
		shape.fill = 'purple';
		shape.noStroke();

		return shape;
	}
}

registerGameObjectSVG(BerryBush, 'img/berryBush.svg');