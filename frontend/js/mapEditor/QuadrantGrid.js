"use strict";

class QuadrantGrid {
	constructor(width, height) {
		this.gridLines = new Two.Group();
		groups.mapBorders.add(this.gridLines);

		this.xIndices = new Two.Group();
		this.yIndices = new Two.Group();
		groups.overlay.add(this.xIndices, this.yIndices);

		this.xIndices.translation.subSelf(playerCam.translation);
		this.xIndices.translation.y = 0;
		if (groups.mapBorders.translation.y > 0){
			this.xIndices.translation.y = groups.mapBorders.translation.y;
		}

		this.yIndices.translation.subSelf(playerCam.translation);
		this.yIndices.translation.x = 0;
		if (groups.mapBorders.translation.x > 0){
			this.yIndices.translation.x = groups.mapBorders.translation.x;
		}

		let index = 1;
		const gridSpacing = Constants.GRID_SPACING;
		for (var x = gridSpacing; x <= width; x += gridSpacing) {
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
		for (var y = gridSpacing; y <= height; y += gridSpacing) {
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

	cameraUpdate(deltaV) {
		this.xIndices.translation.subSelf(new Two.Vector(deltaV.x, 0));
		if (groups.mapBorders.translation.y > 0){
			this.xIndices.translation.y = groups.mapBorders.translation.y;
		}

		this.yIndices.translation.subSelf(new Two.Vector(0, deltaV.y));
		if (groups.mapBorders.translation.x > 0){
			this.yIndices.translation.x = groups.mapBorders.translation.x;
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