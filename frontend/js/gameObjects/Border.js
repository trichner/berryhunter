class Border extends GameObject {
	constructor(x, y, side, length) {
		super(x, y, side, length);
	}

	createShape(x, y, side, length) {
		let x2, y2;
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

		let shape = new Two.Line(x, y, x2, y2);
		shape.noFill();
		shape.stroke = 'yellow';
		return shape;
	}

	visibleOnMinimap() {
		return false;
	}

	show() {
		groups.mapBorders.add(this.shape);
	}

	hide() {
		groups.mapBorders.remove(this.shape);
	}
}
