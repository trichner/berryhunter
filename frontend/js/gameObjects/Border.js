'use strict';

define(['Game', 'GameObject', 'PIXI'], function (Game, GameObject, PIXI) {
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

			let shape = new PIXI.Graphics();
			shape.lineColor = 0xFFFF00;
			shape.moveTo(x, y);
			shape.lineTo(x2, y2);
			return shape;
		}

		show() {
			Game.layers.mapBorders.addChild(this.shape);
		}

		hide() {
			Game.layers.mapBorders.removeChild(this.shape);
		}
	}

	return Border;
});