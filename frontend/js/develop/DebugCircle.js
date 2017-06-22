"use strict";

define(['GameObject', 'Develop', 'Two'], function (GameObject, Develop, Two) {

	class DebugCircle extends GameObject {
		constructor(x, y, radius) {
			super(x, y, radius);

			this.timeToLife = 60;

			two.bind('update', (frameCount, timeDelta) => {
				this.timeToLife -= timeDelta;
				if (this.timeToLife < 0) {
					this.hide();
					// FIXME
					delete gameMap.objects[gameMap.id];
					this.aabb.remove();
					this.aabbConnector.remove();
				}
			}, this);
		}

		visibleOnMinimap() {
			return false;
		}

		createShape(x, y, radius) {
			let circle = new Two.Ellipse(x, y, radius / 2);
			circle.noFill();
			circle.stroke = 'yellow';
			circle.linewidth = Develop.settings.linewidth;
			return circle;
		}
	}

	return DebugCircle;
});