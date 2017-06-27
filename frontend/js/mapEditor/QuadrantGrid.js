"use strict";

define(['Game', 'Two', 'Constants'], function (Two, Game, Constants) {
	class QuadrantGrid {
		constructor(width, height) {
			this.gridLines = new Two.Group();
			Game.groups.mapBorders.add(this.gridLines);

			this.xIndices = new Two.Group();
			this.yIndices = new Two.Group();
			Game.groups.overlay.add(this.xIndices, this.yIndices);

			let index = 1;
			const gridSpacing = Constants.GRID_SPACING;
			for (let x = gridSpacing; x <= width; x += gridSpacing) {
				if (x < width) {
					this.gridLines.add(QuadrantGrid.createGridLine(false, x, 0, x, height));
				}
				this.xIndices.add(QuadrantGrid.createIndex(index, x - gridSpacing / 2, 20));
				index++;
				if (index > Constants.FIELDS_IN_QUADRANT) {
					index = 1;
				}
			}

			index = 1;
			for (let y = gridSpacing; y <= height; y += gridSpacing) {
				if (y < height) {
					this.gridLines.add(QuadrantGrid.createGridLine(true, 0, y, width, y));
				}
				this.yIndices.add(QuadrantGrid.createIndex(index, 20, y - gridSpacing / 2));
				index++;
				if (index > Constants.FIELDS_IN_QUADRANT) {
					index = 1;
				}
			}
		}

		cameraUpdate(translation) {
			this.xIndices.translation.set(translation.x, 0);
			if (Game.groups.mapBorders.translation.y > 0) {
				this.xIndices.translation.y = Game.groups.mapBorders.translation.y;
			}

			this.yIndices.translation.set(0, translation.y);
			if (Game.groups.mapBorders.translation.x > 0) {
				this.yIndices.translation.x = Game.groups.mapBorders.translation.x;
			}
		}

		static createGridLine(horizontal, x1, y1, x2, y2) {
			let shape = new Two.Line(x1, y1, x2, y2);
			shape.stroke = 'lightyellow';

			let coord = horizontal ? y1 : x1;
			if (coord % Constants.QUADRANT_SIZE === 0) {
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

	return QuadrantGrid;
});