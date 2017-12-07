define([
	'Game',
	'GameObject',
	'Two',
	'Preloading',
	'Utils',
	'InjectedSVG'], function (Game, GameObject, Two, Preloading, Utils, InjectedSVG) {

	class Resource extends GameObject {
		constructor(gameLayer, x, y, size) {
			super(gameLayer, x, y, size, Utils.random(0, Math.PI * 2));

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
		constructor(x, y, size) {
			super(Game.layers.resources.trees, x, y, size);

			this.depletionTexture = new InjectedSVG(Tree.groundTexture.svg, x, y, this.size, this.rotation);
			Game.layers.terrain.textures.add(this.depletionTexture);
		}

		onStockChange(newStock, oldStock) {
			this.shape.scale = newStock / this.capacity;
		}

		createMinimapIcon() {
			let shape = new Two.Ellipse(0, 0, this.size * 0.6);
			shape.noStroke();
			shape.fill = 'rgba(31, 91, 11, 0.8)';

			return shape;
		}

		hide() {
			this.depletionTexture.remove();
			Resource.prototype.hide.apply(this, arguments);
		}
	}

	Tree.groundTexture = {};
	Preloading.registerGameObjectSVG(Tree.groundTexture, 'img/treeSpot.svg');

	class RoundTree extends Tree {
		constructor(x, y, size) {
			super(x, y, size);
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
			super(x, y, size);
		}

		createShape(x, y) {
			this.size = this.size / 2;
			let shape = new Two.Group();
			shape.translation.set(x, y);
			for (let i = 0; i < 5; i++) {
				let circle = new Two.Ellipse(
					(Math.cos(Math.PI * 2 / 5 * i) * this.size),
					(Math.sin(Math.PI * 2 / 5 * i) * this.size),
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

	class Mineral extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.minerals, x, y, size);

			this.depletionTexture = new InjectedSVG(Mineral.groundTexture.svg, x, y, this.size, this.rotation);
			Game.layers.terrain.textures.add(this.depletionTexture);
		}

		onStockChange(newStock, oldStock) {
			this.shape.scale = newStock / this.capacity;
		}

		hide() {
			this.depletionTexture.remove();
			Resource.prototype.hide.apply(this, arguments);
		}
	}

	Mineral.groundTexture = {};
	Preloading.registerGameObjectSVG(Mineral.groundTexture, 'img/stoneSpot.svg');

	class Stone extends Mineral {
		constructor(x, y, size) {
			super(x, y, size);
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
			let shape = new Two.Polygon(0, 0, this.size, 6);
			shape.fill = '#737373';
			shape.noStroke();
			shape.rotation = this.rotation;

			return shape;
		}
	}

	Preloading.registerGameObjectSVG(Stone, 'img/stone.svg');

	class Bronze extends Mineral {
		constructor(x, y, size) {
			super(x, y, size);
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
			let shape = new Two.Polygon(0, 0, this.size, 5);
			shape.fill = '#b57844';
			// shape.fill = '#d0c8a8';
			shape.noStroke();
			shape.rotation = this.rotation;

			return shape;
		}
	}

	Preloading.registerGameObjectSVG(Bronze, 'img/bronze.svg');

	class Iron extends Mineral {
		constructor(x, y, size) {
			super(x, y, size);
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
			let shape = new Two.Polygon(0, 0, this.size, 6);
			shape.fill = '#a46262';
			shape.noStroke();
			shape.rotation = this.rotation;

			return shape;
		}
	}

	Preloading.registerGameObjectSVG(Iron, 'img/iron.svg');

	class BerryBush extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.berryBush, x, y, size);
		}

		initShape(x, y, size, rotation) {
			let group = new Two.Group();
			group.translation.set(x, y);

			this.actualShape = super.initShape(0, 0, size, rotation);
			group.add(this.actualShape);

			return group;
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
				circle.fill = '#c20071';
				circle.noStroke();
			}

			return shape;
		}

		createMinimapIcon() {
			let shape = new Two.Ellipse(0, 0, this.size * 1.2);
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
				circle.fill = '#c20071';
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
		Mineral: Mineral,
		Stone: Stone,
		Bronze: Bronze,
		Iron: Iron,
		BerryBush: BerryBush
	}
});