"use strict";

class Placeable extends GameObject {
	constructor(placeableItem, x, y) {
		super(x, y, placeableItem.graphic.size, random(0, Math.PI * 2), placeableItem.graphic.svg);

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