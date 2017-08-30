define([
	'Game',
	'GameObject',
	'Two',
	'Preloading',
	'Utils'], function (Game, GameObject, Two, Preloading, Utils) {

	class Resource extends GameObject {
		constructor(gameLayer, x, y, size, rotation) {
			super(gameLayer, x, y, size, rotation);

			this.capacity = 0;
			let stock = 0;

			Object.defineProperties(this, {
				'stock': {
					get: function () {
						return stock;
					},
					set: (newStock) => {
						if (stock !== newStock) {
							this.onStockChange(newStock, stock);
							stock = newStock;
						}
					},
				},
			});
		}

		onStockChange(newStock, oldStock) {
			// Default NOP
		}
	}

	class Tree extends Resource {
		constructor(x, y, size, rotation) {
			super(Game.layers.resources.trees, x, y, size, rotation);
		}

		createMinimapIcon() {
			let shape = new Two.Ellipse(0, 0, this.size);
			shape.stroke = 'green';
			shape.linewidth = 1;
			shape.noFill();

			return shape;
		}
	}

	class RoundTree extends Tree {
		constructor(x, y, size) {
			super(x, y, size || Utils.randomInt(50, 150));
		}

		createShape(x, y) {
			let shape = new Two.Ellipse(x, y, this.size);
			shape.fill = 'green';
			shape.stroke = 'darkgreen';
			shape.linewidth = 2;

			return shape;
		}
	}

	Preloading.registerGameObjectSVG(RoundTree, 'img/roundTree.svg');

	class MarioTree extends Tree {
		constructor(x, y, size) {
			super(x, y, size || Utils.randomInt(50, 150));
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
			shape.rotation = Utils.random(0, Math.PI * 2);

			let ellipse = new Two.Ellipse(0, 0, this.size * 1.6);
			shape.add(ellipse);
			ellipse.fill = 'green';
			ellipse.noStroke();

			return shape;
		}
	}
	Preloading.registerGameObjectSVG(MarioTree, 'img/deciduousTree.svg');

	class Stone extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.minerals, x, y,
				size || Utils.randomInt(30, 90),
				Utils.random(0, Math.PI * 2)
			);
		}

		createShape(x, y) {
			let shape = new Two.Polygon(x, y, this.size, 6);
			shape.fill = 'darkgray';
			shape.stroke = 'dimgray';
			shape.linewidth = 2;
			shape.rotation = Utils.random(0, Math.PI * 2);

			return shape;
		}

		createMinimapIcon() {
			let shape = new Two.Polygon(0, 0, this.size * 2, 6);
			shape.fill = 'dimgray';
			shape.noStroke();

			return shape;
		}
	}
	Preloading.registerGameObjectSVG(Stone, 'img/stone.svg');

	class Bronze extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.minerals, x, y, size || Utils.randomInt(30, 70));
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
			shape.rotation = Utils.random(0, Math.PI * 2);

			return shape;
		}

		createMinimapIcon() {
			let shape = new Two.Polygon(0, 0, this.size * 2, this.sides);
			shape.fill = 'gold';
			shape.noStroke();

			return shape;
		}
	}
	Preloading.registerGameObjectSVG(Bronze, 'img/bronze.svg');

	class Iron extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.minerals, x, y,
				size || Utils.randomInt(20, 60),
				Utils.random(0, Math.PI * 2)
			);
		}

		createShape(x, y) {
			let shape = new Two.Polygon(x, y, this.size, 6);
			shape.fill = 'darkgray';
			shape.stroke = 'dimgray';
			shape.linewidth = 2;
			shape.rotation = Utils.random(0, Math.PI * 2);

			return shape;
		}

		createMinimapIcon() {
			let shape = new Two.Polygon(0, 0, this.size * 2, 6);
			shape.fill = 'dimgray';
			// shape.fill = '#a46262';
			shape.noStroke();

			return shape;
		}
	}

	Preloading.registerGameObjectSVG(Iron, 'img/iron.svg');

	class BerryBush extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.berryBush, x, y, size || Utils.randomInt(20, 45));
		}

		createShape(x, y) {
			let shape = new Two.Group();
			shape.translation.set(x, y);
			shape.rotation = Utils.random(0, Math.PI * 2);

			let bush = new Two.Star(0, 0, this.size, this.size * 0.7, 5 + Utils.randomInt(1, 3) * 2);
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

		createMinimapIcon() {
			let shape = new Two.Ellipse(0, 0, this.size * 3);
			shape.fill = 'purple';
			shape.noStroke();

			return shape;
		}

		onStockChange(numberOfBerries) {
			if (Utils.isDefined(this.berries)) {
				this.berries.remove();
			}

			this.berries = new Two.Group();
			this.shape.add(this.berries);

			for (let i = 0; i < this.capacity; i++) {
				if (i >= numberOfBerries) {
					break;
				}
				let circle = new Two.Ellipse(
					(Math.cos(Math.PI * 2 / this.capacity * i) * this.size * 0.3),
					(Math.sin(Math.PI * 2 / this.capacity * i) * this.size * 0.3),
					5);
				this.berries.add(circle);
				circle.fill = 'purple';
				circle.noStroke();

			}
		}
	}

	Preloading.registerGameObjectSVG(BerryBush, 'img/berryBush.svg');

	return {
		Resource: Resource,
		Tree: Tree,
		RoundTree: RoundTree,
		MarioTree: MarioTree,
		Stone: Stone,
		Bronze: Bronze,
		Iron: Iron,
		BerryBush: BerryBush
	}
});