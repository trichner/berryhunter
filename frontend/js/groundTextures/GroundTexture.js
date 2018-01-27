define(['InjectedSVG'], function (InjectedSVG) {
	class GroundTexture {
		constructor(parameters) {

			this.graphic = new InjectedSVG(
				parameters.type.svg,
				parameters.x,
				parameters.y,
				parameters.size,
				parameters.rotation);

			this.parameters = parameters;
		}

		addToMap(){
			let self = this;
			require(['Game'], function (Game) {
				Game.layers.terrain.textures.addChild(self.graphic);
			});
		}
	}

	return GroundTexture;
});