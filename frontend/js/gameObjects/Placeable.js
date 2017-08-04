"use strict";

define(['GameObject', 'Utils', 'InjectedSVG'], function (GameObject, Utils, InjectedSVG) {
	class Placeable extends GameObject {
		constructor(placeableItem, x, y) {
			super(x, y, placeableItem.graphic.size, Utils.random(0, Math.PI * 2), placeableItem.graphic.svg);

			this.visibleOnMinimap = false;

			this.item = placeableItem;
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
	}

	return Placeable;
});