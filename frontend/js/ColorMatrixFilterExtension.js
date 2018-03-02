'use strict';

/**
 * Adds presets to PIXI.filters.ColorMatrixFilter
 */
define(['PIXI'], function (PIXI) {
	/**
	 *
	 * @param greyscale 0 = full color, 1 = full grey
	 * @param multiply
	 */
	PIXI.filters.ColorMatrixFilter.prototype.lumaGreyscale = function (greyscale, multiply) {
		const lumR = 0.2126;
		const lumG = 0.7152;
		const lumB = 0.0722;

		let s = (1 - greyscale);
		let sr = greyscale * lumR;
		let sg = greyscale * lumG;
		let sb = greyscale * lumB;

		let matrix = [sr + s, sg, sb, 0, 0,
			sr, sg + s, sb, 0, 0,
			sr, sg, sb + s, 0, 0,
			0, 0, 0, 1, 0];

		this._loadMatrix(matrix, multiply);
	};

	/**
	 * Conforms svg feFlood filter.
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood
	 */
	PIXI.filters.ColorMatrixFilter.prototype.flood = function (red, green, blue, floodOpacity, multiply) {
		floodOpacity = floodOpacity || 0;
		let floodTransparency = (1 - floodOpacity);

		function colorOpacity(value) {
			return (value + (255 - value) * floodTransparency) / 255;
		}

		let matrix =
			[colorOpacity(107), 0, 0, 0, 0,
				0, colorOpacity(131), 0, 0, 0,
				0, 0, colorOpacity(185), 0, 0,
				0, 0, 0, 1, 0,];

		this._loadMatrix(matrix, multiply);
	}
});