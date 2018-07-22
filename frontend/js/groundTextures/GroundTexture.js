'use strict';

define(['InjectedSVG'], function (InjectedSVG) {
	class GroundTexture {
		constructor(parameters) {
			this.parameters = parameters;
		}

		addToMap() {
			this.graphic = new InjectedSVG(
				this.parameters.type.svg,
				this.parameters.x,
				this.parameters.y,
				this.parameters.size,
				this.parameters.rotation);

			switch (this.parameters.flipped.toLowerCase()) {
				case 'horizontal':
					this.graphic.scale.x *= -1;
					break;
				case 'vertical':
					this.graphic.scale.y *= -1;
					break;
			}

			let self = this;
			require(['Game'], function (Game) {
				Game.layers.terrain.textures.addChild(self.graphic);
			});
		}

		remove() {
			this.graphic.parent.removeChild(this.graphic);
		}
	}

	return GroundTexture;
});