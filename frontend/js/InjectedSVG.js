'use strict';

define(['PIXI', 'Constants'], function (PIXI, Constants) {

	function InjectedSVG(svgTexture, x, y, size, rotation) {
		size = size || (Constants.GRAPHIC_BASE_SIZE / 2);
		size *= 2;

		let sprite = new PIXI.Sprite(svgTexture);
		sprite.anchor.set(0.5, 0.5);
		sprite.x = x;
		sprite.y = y;
		sprite.width = size;
		sprite.height = size;
		sprite.rotation = rotation || 0;

		return sprite;
	}

	return InjectedSVG;
});