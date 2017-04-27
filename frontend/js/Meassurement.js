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

	static forPixel(pixel) {
		let measurement = new Measurement();
		measurement.setPixel(pixel);
		return measurement;
	}

	static forMetres(metres) {
		let measurement = new Measurement();
		measurement.setMetres(metres);
		return measurement;
	}

	static randomPixel(minPixel, maxPixel) {
		return Measurement.forPixel(randomInt(minPixel, maxPixel));
	}

	static randomMetres(minMetres, maxMetres) {
		return Measurement.forMetres(random(minMetres, maxMetres));
	}

	setPixel(pixel) {
		this.pixel = pixel;
		this.metres = pixel / Constants.PIXEL_PER_METRE;
		// this.validateMetres();
	}

	setMetres(metres) {
		this.metres = metres;
		this.pixel = metres * Constants.PIXEL_PER_METRE;
		// this.validateMetres();
	}

	validateMetres() {
		if (this.metres < 0) {
			throw "Negative measurement can't be interpreted by physics or graphics!";
		}
		if (this.metres < 0.1 || this.metres > 10) {
			console.warn("Measurement should not be smaller than 0.1 metres (" +
				(0.1 * Constants.PIXEL_PER_METRE) +
				" pixels) or bigger than 10 metres (" +
				(10 * Constants.PIXEL_PER_METRE) +
				" pixels), otherwise the physics simulation gets unreliable.")
		}
	}

	getPixel() {
		return this.pixel;
	}

	getMetres() {
		return this.metres;
	}

}