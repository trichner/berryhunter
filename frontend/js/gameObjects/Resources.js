define([
	'Game',
	'GameObject',
	'PIXI',
	'Preloading',
	'Utils',
	'InjectedSVG'], function (Game, GameObject, PIXI, Preloading, Utils, InjectedSVG) {

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
			Game.layers.terrain.textures.addChild(this.depletionTexture);
		}

		onStockChange(newStock, oldStock) {
			this.shape.scale = newStock / this.capacity;
		}

		createMinimapIcon() {
			let shape = new PIXI.Graphics();
			shape.beginFill(0x1F5B0B, 0.8);
			shape.drawCircle(0, 0, this.size * 0.6);

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
	}

	Preloading.registerGameObjectSVG(RoundTree, 'img/roundTree.svg');

	class MarioTree extends Tree {
		constructor(x, y, size) {
			super(x, y, size);
		}
	}

	Preloading.registerGameObjectSVG(MarioTree, 'img/deciduousTree.svg');

	class Mineral extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.minerals, x, y, size);

			this.depletionTexture = new InjectedSVG(Mineral.groundTexture.svg, x, y, this.size, this.rotation);
			Game.layers.terrain.textures.addChild(this.depletionTexture);
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

		createMinimapIcon() {
			let shape = new PIXI.Graphics();
			shape.beginFill(0x737373);
			shape.rotation = this.rotation;
			shape.drawPolygon(Utils.TwoDimensional.makePolygon(this.size, 6, true));

			return shape;
		}
	}

	Preloading.registerGameObjectSVG(Stone, 'img/stone.svg');

	class Bronze extends Mineral {
		constructor(x, y, size) {
			super(x, y, size);
		}

		createMinimapIcon() {
			let shape = new PIXI.Graphics();
			shape.beginFill(0xb57844);
			shape.rotation = this.rotation;
			shape.drawPolygon(Utils.TwoDimensional.makePolygon(this.size, 5, true));

			return shape;
		}
	}

	Preloading.registerGameObjectSVG(Bronze, 'img/bronze.svg');

	class Iron extends Mineral {
		constructor(x, y, size) {
			super(x, y, size);
		}

		createMinimapIcon() {
			let shape = new PIXI.Graphics();
			shape.beginFill(0xa46262);
			shape.rotation = this.rotation;
			shape.drawPolygon(Utils.TwoDimensional.makePolygon(this.size, 6, true));

			return shape;
		}
	}

	Preloading.registerGameObjectSVG(Iron, 'img/iron.svg');

	class BerryBush extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.berryBush, x, y, size);
		}

		initShape(x, y, size, rotation) {
			let group = new PIXI.Container();
			group.position.set(x, y);

			this.actualShape = super.initShape(0, 0, size, rotation);
			group.addChild(this.actualShape);

			return group;
		}

		createMinimapIcon() {
			let shape = new PIXI.Graphics();
			shape.beginFill(0xc20071);
			shape.drawCircle(0, 0, this.size * 1.2);
			
			return shape;
		}

		onStockChange(numberOfBerries) {
			if (Utils.isDefined(this.berries)) {
				this.berries.remove();
			}

			this.berries = new PIXI.Container();
			this.shape.addChild(this.berries);

			for (let i = 0; i < this.capacity; i++) {
				if (i >= numberOfBerries) {
					break;
				}

				let circle = new PIXI.Graphics();
				this.berries.addChild(circle);
				circle.beginFill(0xc20071);
				circle.drawCircle(
					(Math.cos(Math.PI * 2 / this.capacity * i) * this.size * 0.3),
					(Math.sin(Math.PI * 2 / this.capacity * i) * this.size * 0.3),
					5
				);
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