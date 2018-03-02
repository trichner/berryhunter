'use strict';

/**
 * FIXME this class hasn't been updated for quite a while
 */
define(['Game', 'PIXI', 'Constants'], function (Game, PIXI, Constants) {
	class QuadrantGrid {
		constructor(width, height) {
			this.gridLines = new PIXI.Container();
			Game.layers.mapBorders.addChild(this.gridLines);

			this.xIndices = new PIXI.Container();
			this.yIndices = new PIXI.Container();
			Game.layers.overlay.addChild(this.xIndices, this.yIndices);

			let index = 1;
			const gridSpacing = Constants.mapEditor.GRID_SPACING;
			for (let x = gridSpacing; x <= width; x += gridSpacing) {
				if (x < width) {
					this.gridLines.addChild(QuadrantGrid.createGridLine(false, x, 0, x, height));
				}
				this.xIndices.addChild(QuadrantGrid.createIndex(index, x - gridSpacing / 2, 20));
				index++;
				if (index > Constants.mapEditor.FIELDS_IN_QUADRANT) {
					index = 1;
				}
			}

			index = 1;
			for (let y = gridSpacing; y <= height; y += gridSpacing) {
				if (y < height) {
					this.gridLines.addChild(QuadrantGrid.createGridLine(true, 0, y, width, y));
				}
				this.yIndices.addChild(QuadrantGrid.createIndex(index, 20, y - gridSpacing / 2));
				index++;
				if (index > Constants.mapEditor.FIELDS_IN_QUADRANT) {
					index = 1;
				}
			}
		}

		cameraUpdate(position) {
			this.xIndices.position.set(position.x, 0);
			if (Game.layers.mapBorders.position.y > 0) {
				this.xIndices.position.y = Game.layers.mapBorders.position.y;
			}

			this.yIndices.position.set(0, position.y);
			if (Game.layers.mapBorders.position.x > 0) {
				this.yIndices.position.x = Game.layers.mapBorders.position.x;
			}
		}

		static createGridLine(horizontal, x1, y1, x2, y2) {
			let shape = new Two.Line(x1, y1, x2, y2);
			shape.stroke = 'lightyellow';

			let coord = horizontal ? y1 : x1;
			if (coord % QuadrantGrid.QUADRANT_SIZE === 0) {
				shape.linewidth = 2;
			} else {
				shape.linewidth = 1;
			}
			shape.noFill();

			return shape;
		}

		static createIndex(index, x, y) {
			let text = new Two.Text("" + index, x, y);
			text.fill = 'lightyellow';
			text.noStroke();
			return text;
		}
	}

	QuadrantGrid.QUADRANT_SIZE = Constants.GRID_SPACING * Constants.FIELDS_IN_QUADRANT;

	return QuadrantGrid;
});