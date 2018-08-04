'use strict';

define(['PIXI', 'Game', 'GameObject', 'Utils', 'InjectedSVG', 'GraphicsConfig'], function (PIXI, Game, GameObject, Utils, InjectedSVG, GraphicsConfig) {
	class Placeable extends GameObject {
		constructor(placeableItem, x, y) {
			super(placeableItem.placeable.layer,
				x, y,
				placeableItem.graphic.size,
				Utils.randomRotation(placeableItem.placeable.directions),
				placeableItem.graphic.svg);

			this.item = placeableItem;
			this.visibleOnMinimap = placeableItem.placeable.visibleOnMinimap;
		}

		createShape(x, y, size, rotation, svg) {
			return new InjectedSVG(svg, x, y, size, rotation);
		}

		is(placeableItem) {
			if (typeof placeableItem === 'string') {
				return this.item.name = placeableItem;
			}
			return this.item === placeableItem;
		}

		createMinimapIcon() {
			let shape = new PIXI.Graphics();
			let miniMapCfg = GraphicsConfig.miniMap.icons[this.item.name];
			shape.beginFill(miniMapCfg.color, miniMapCfg.alpha);
			shape.drawCircle(0, 0, this.size * miniMapCfg.sizeFactor);

			return shape;
		}
	}

	return Placeable;
});