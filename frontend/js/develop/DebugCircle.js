"use strict";

class DebugCircle extends GameObject {
	constructor(x, y, radius) {
		super(x, y, radius);

		this.timeToLife = 1000;

		two.bind('update', (frameCount, timeDelta) => {
			this.timeToLife-= timeDelta;
			if (this.timeToLife < 0) {
				this.hide();
				delete gameMap.objects[gameMap.id];
			}
		}, this);
	}

	visibleOnMinimap() {
		return false;
	}

	createShape(x, y, radius) {
		let circle = new Two.Ellipse(x, y, radius);
		circle.noFill();
		circle.stroke = Develop.settings.elementColor;
		circle.linewidth = Develop.settings.linewidth;
		return circle;
	}
}