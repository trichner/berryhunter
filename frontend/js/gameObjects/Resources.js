'use strict';

define(['Game', 'GameObject', 'PIXI', 'Preloading', 'Utils', 'InjectedSVG', 'Constants'],
	function (Game, GameObject, PIXI, Preloading, Utils, InjectedSVG, Constants) {

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

			this.baseScale = this.shape.scale.x;
		}

		onStockChange(newStock, oldStock) {
			let scale = newStock / this.capacity;
			this.shape.scale.set(this.baseScale * scale);
		}
	}

	class Tree extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.trees, x, y, size + Constants.CHARACTER_SIZE);

			this.resourceSpotTexture = new InjectedSVG(Tree.resourceSpot.svg, x, y, this.size, this.rotation);
			Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
		}

		createMinimapIcon() {
			let shape = new PIXI.Graphics();
			shape.beginFill(0x1F5B0B, 0.8);
			shape.drawCircle(0, 0, this.size * 0.6);

			return shape;
		}

		hide() {
			this.resourceSpotTexture.parent.removeChild(this.resourceSpotTexture);
			Resource.prototype.hide.apply(this, arguments);
		}
	}

		Tree.resourceSpot = {};
		Preloading.registerGameObjectSVG(Tree.resourceSpot, 'img/treeSpot.svg', 120);

	class RoundTree extends Tree {
		constructor(x, y, size) {
			super(x, y, size);
		}
	}

	Preloading.registerGameObjectSVG(RoundTree, 'img/roundTree.svg', 120);

	class MarioTree extends Tree {
		constructor(x, y, size) {
			super(x, y, size);
		}
	}

	Preloading.registerGameObjectSVG(MarioTree, 'img/deciduousTree.svg', 120);

	class Mineral extends Resource {
		constructor(x, y, size) {
			super(Game.layers.resources.minerals, x, y, size);
			// Due to the shadow in the mineral graphics, those should not be randomly rotated
			this.setRotation(0);

			this.resourceSpotTexture = new InjectedSVG(Mineral.resourceSpot.svg, x, y, this.size, this.rotation);
			Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
		}

		hide() {
			this.resourceSpotTexture.parent.removeChild(this.resourceSpotTexture);
			Resource.prototype.hide.apply(this, arguments);
		}
	}

		Mineral.resourceSpot = {};
		Preloading.registerGameObjectSVG(Mineral.resourceSpot, 'img/stoneSpot.svg', 60);

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

	Preloading.registerGameObjectSVG(Stone, 'img/stone.svg', 60);

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

	Preloading.registerGameObjectSVG(Bronze, 'img/bronze.svg', 60);

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

	Preloading.registerGameObjectSVG(Iron, 'img/iron.svg', 60);

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
				this.berries.parent.removeChild(this.berries);
			}

			this.berries = new PIXI.Container();
			this.shape.addChild(this.berries);

			for (let i = 0; i < this.capacity; i++) {
				if (i >= numberOfBerries) {
					break;
				}

				let berry = new InjectedSVG(
					BerryBush.berry.svg,
					(Math.cos(Math.PI * 2 / this.capacity * i) * this.size * 0.3),
					(Math.sin(Math.PI * 2 / this.capacity * i) * this.size * 0.3),
					5
				);
				this.berries.addChild(berry);
			}
		}
	}

	Preloading.registerGameObjectSVG(BerryBush, 'img/berryBush.svg', 60);
	BerryBush.berry = {};
	Preloading.registerGameObjectSVG(BerryBush.berry, 'img/berry.svg', 5);

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