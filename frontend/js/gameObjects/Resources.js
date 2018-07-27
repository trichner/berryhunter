'use strict';

define(['Game', 'GameObject', 'PIXI', 'Preloading', 'Utils', 'InjectedSVG', 'Constants', 'GraphicsConfig'],
	function (Game, GameObject, PIXI, Preloading, Utils, InjectedSVG, Constants, GraphicsConfig) {

		class Resource extends GameObject {
			constructor(gameLayer, x, y, size, rotation) {
				super(gameLayer, x, y, size, rotation);

				this.capacity = undefined;
				let stock = undefined;

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
				super(Game.layers.resources.trees, x, y, size + GraphicsConfig.character.size, Utils.randomRotation());

				this.resourceSpotTexture = new InjectedSVG(Tree.resourceSpot.svg, x, y, this.size, this.rotation);
				Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
			}

			createMinimapIcon() {
				let shape = new PIXI.Graphics();
				let miniMapCfg = GraphicsConfig.miniMap.icons.tree;
				shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
				shape.drawCircle(0, 0, this.size * miniMapCfg.sizeFactor);

				return shape;
			}

			hide() {
				this.resourceSpotTexture.parent.removeChild(this.resourceSpotTexture);
				Resource.prototype.hide.apply(this, arguments);
			}
		}

		Tree.resourceSpot = {};
		let treeCfg = GraphicsConfig.resources.tree;
		Preloading.registerGameObjectSVG(Tree.resourceSpot, treeCfg.spotFile, treeCfg.maxSize);

		class RoundTree extends Tree {
			constructor(x, y, size) {
				super(x, y, size);
			}
		}

		Preloading.registerGameObjectSVG(RoundTree, treeCfg.roundTreeFile, treeCfg.maxSize);

		class MarioTree extends Tree {
			constructor(x, y, size) {
				super(x, y, size);
			}
		}

		Preloading.registerGameObjectSVG(MarioTree, treeCfg.deciduousTreeFile, treeCfg.maxSize);

		class Mineral extends Resource {
			constructor(x, y, size) {
				// Due to the shadow in the mineral graphics, those should not be randomly rotated
				super(Game.layers.resources.minerals, x, y, size, 0);

				this.resourceSpotTexture = new InjectedSVG(Mineral.resourceSpot.svg, x, y, this.size, this.rotation);
				Game.layers.terrain.resourceSpots.addChild(this.resourceSpotTexture);
			}

			hide() {
				this.resourceSpotTexture.parent.removeChild(this.resourceSpotTexture);
				Resource.prototype.hide.apply(this, arguments);
			}
		}

		Mineral.resourceSpot = {};
		let mineralCfg = GraphicsConfig.resources.mineral;
		Preloading.registerGameObjectSVG(Mineral.resourceSpot, mineralCfg.spotFile, mineralCfg.maxSize);

		class Stone extends Mineral {
			constructor(x, y, size) {
				super(x, y, size);
			}

			createMinimapIcon() {
				let shape = new PIXI.Graphics();
				let miniMapCfg = GraphicsConfig.miniMap.icons.stone;
				shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
				shape.rotation = this.rotation;
				shape.drawPolygon(Utils.TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 6, true));

				return shape;
			}
		}

		Preloading.registerGameObjectSVG(Stone, mineralCfg.stoneFile, mineralCfg.maxSize);

		class Bronze extends Mineral {
			constructor(x, y, size) {
				super(x, y, size);
			}

			createMinimapIcon() {
				let shape = new PIXI.Graphics();
				let miniMapCfg = GraphicsConfig.miniMap.icons.bronze;
				shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
				shape.rotation = this.rotation;
				shape.drawPolygon(Utils.TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 5, true));

				return shape;
			}
		}

		Preloading.registerGameObjectSVG(Bronze, mineralCfg.bronzeFile, mineralCfg.maxSize);

		class Iron extends Mineral {
			constructor(x, y, size) {
				super(x, y, size);
			}

			createMinimapIcon() {
				let shape = new PIXI.Graphics();
				let miniMapCfg = GraphicsConfig.miniMap.icons.iron;
				shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
				shape.rotation = this.rotation;
				shape.drawPolygon(Utils.TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 6, true));

				return shape;
			}
		}

		Preloading.registerGameObjectSVG(Iron, mineralCfg.ironFile, mineralCfg.maxSize);

		class Titanium extends Mineral {
			constructor(x, y, size) {
				super(x, y, size);
			}

			createMinimapIcon() {
				let shape = new PIXI.Graphics();
				let miniMapCfg = GraphicsConfig.miniMap.icons.titanium;
				shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
				shape.rotation = this.rotation;
				shape.drawPolygon(Utils.TwoDimensional.makePolygon(this.size * miniMapCfg.sizeFactor, 4, true));

				return shape;
			}
		}

		Preloading.registerGameObjectSVG(Titanium, mineralCfg.titaniumFile, mineralCfg.maxSize);

		let berryBushCfg = GraphicsConfig.resources.berryBush;

		class BerryBush extends Resource {
			constructor(x, y, size) {
				super(Game.layers.resources.berryBush, x, y, size, Utils.randomRotation());
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
				let miniMapCfg = GraphicsConfig.miniMap.icons.berryBush;
				shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
				shape.drawCircle(0, 0, this.size * miniMapCfg.sizeFactor);

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
						berryBushCfg.berrySize
					);
					this.berries.addChild(berry);
				}
			}
		}

		Preloading.registerGameObjectSVG(BerryBush, berryBushCfg.bushfile, berryBushCfg.maxSize);
		BerryBush.berry = {};
		Preloading.registerGameObjectSVG(BerryBush.berry, berryBushCfg.berryFile, berryBushCfg.berrySize);

		let flowerCfg = GraphicsConfig.resources.flower;

		class Flower extends Resource {
			constructor(x, y, size) {
				super(Game.layers.resources.berryBush, x, y, size, Utils.deg2rad(0));
				this.visibleOnMinimap = false;
			}
		}

		Preloading.registerGameObjectSVG(Flower, flowerCfg.file, flowerCfg.maxSize);

		return {
			Resource: Resource,
			Tree: Tree,
			RoundTree: RoundTree,
			MarioTree: MarioTree,
			Mineral: Mineral,
			Stone: Stone,
			Bronze: Bronze,
			Iron: Iron,
			Titanium: Titanium,
			BerryBush: BerryBush,
			Flower: Flower
		}
	});