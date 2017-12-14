"use strict";

define(['Constants', 'Utils', 'NamedGroup'], function (Constants, Utils, NamedGroup) {


	function InjectedSVG(svgTexture, x, y, size, rotation) {

		size = size || (Constants.GRID_SPACING / 2);
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

	// class InjectedSVG extends NamedGroup {
	// 	constructor(svg, x, y, size, rotation) {
	// 		super('InjectedSVG');
	//
	// 		if (Utils.isUndefined(svg) || typeof svg.cloneNode !== 'function') {
	// 			throw svg + ' is not a valid SVG node';
	// 		}
	//
	// 		this.translation.set(x, y);
	// 		this.rotation = rotation || 0;
	//
	// 		this.size = size || (Constants.GRID_SPACING / 2);
	// 		this.baseScale = size / (Constants.GRID_SPACING / 2);
	// 		this.centerOffsetX = -Constants.GRAPHIC_BASE_SIZE / 2;
	// 		this.centerOffsetY = -Constants.GRAPHIC_BASE_SIZE / 2;
	//
	// 		this._matrix.manual = true;
	//
	// 		this.injected = false;
	// 		this.svg = svg;
	// 	}
	//
	// 	_update() {
	// 		if (this._flagMatrix) {
	// 			this._matrix
	// 				.identity()
	// 				.translate(this.translation.x, this.translation.y)
	// 				.scale(this.baseScale)
	// 				.scale(this.scale)
	// 				.rotate(this.rotation)
	// 				.translate(this.centerOffsetX, this.centerOffsetY)
	// 		}
	//
	// 		if (!this.injected && Utils.isDefined(this._renderer.elem)) {
	// 			this._renderer.elem.appendChild(this.svg.cloneNode(true));
	// 			this.injected = true;
	// 		}
	//
	// 		NamedGroup.prototype._update.apply(this, arguments);
	// 	}
	// }

	return InjectedSVG;
});