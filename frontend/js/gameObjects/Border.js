"use strict";

define(['Game', 'GameObject', 'Two'], function (Game, GameObject, Two) {
	class Border extends GameObject {
		constructor(x, y, side, length) {
			super(x, y, side, length);
			this.visibleOnMinimap = false;
		}

		createShape(x, y, side, length) {
			let x2, y2;
			if (typeof side === 'string') {
				switch (side) {
					case 'NORTH':
						x2 = x + length;
						y2 = y;
						break;
					case 'EAST':
						x2 = x;
						y2 = y + length;
						break;
					case 'SOUTH':
						x2 = x + length;
						y2 = y;
						break;
					case 'WEST':
						x2 = x;
						y2 = y + length;
						break;
				}
			} else {
				x2 = side;
				y2 = length;
			}

			let shape = new Two.Line(x, y, x2, y2);
			shape.noFill();
			shape.stroke = 'yellow';
			return shape;
		}

		show() {
			Game.groups.mapBorders.add(this.shape);
		}

		hide() {
			Game.groups.mapBorders.remove(this.shape);
		}
	}

	return Border;
});