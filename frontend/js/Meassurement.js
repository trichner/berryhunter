"use strict";

var Relativity = {
	NONE: "NONE",
	WIDTH: "WIDTH",
	HEIGHT: "HEIGHT"
};

class Measurement {

	/**
	 * Internal constructor - use static factory methods instead
	 */
	constructor() {
	}

	static relative(percentage) {
		return Measurement.relativeX(percentage);
	}

	static relativeX(percentage) {
		let measurement = new Measurement();
		measurement.setPixel(Relative.width(percentage));
		measurement.relativeTo = Relativity.WIDTH;
		return measurement;
	}

	static relativeY(percentage) {
		let measurement = new Measurement();
		measurement.setPixel(Relative.relative(percentage));
		measurement.relativeTo = Relativity.HEIGHT;
		return measurement;
	}

	static fromPixel(pixel) {
		let measurement = new Measurement();
		measurement.setPixel(pixel);
		return measurement;
	}

	static fromMetres(metres) {
		let measurement = new Measurement();
		measurement.setMetres(metres);
		return measurement;
	}

	setPixel(pixel) {
		this.pixel = pixel;
		this.metres = pixel / Constants.PIXEL_PER_METRE;
	}

	setMetres(metres) {
		this.metres = metres;
		this.pixel = metres * Constants.PIXEL_PER_METRE;
	}
}