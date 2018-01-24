define([], function () {
	class GroundTexture {
		constructor() {
			this.type = "darkGreenGrass",
				this.size = 200,
				this.rotation = deg2rad(190),
				this.flipped = "horizontal" | "vertical" | "none"
		}
	}

	return GroundTexture;
});