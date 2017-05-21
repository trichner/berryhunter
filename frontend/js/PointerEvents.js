"use strict";

const PointerType = {
	LEFT: 'LEFT',
	RIGHT: 'RIGHT'
};

let PointerEvents = {
	x: 0,
	y: 0,
	/*
	 * @type PointerType
	 */
	pointerDown: false,

	setup: function (domElement) {
		domElement.addEventListener('pointerup', function () {
			this.pointerDown = false;
		}.bind(this));

		domElement.addEventListener('pointerdown', function (event) {
			switch (event.button) {
				case 0:
					this.pointerDown = PointerType.LEFT;
					break;
				case 2:
					this.pointerDown = PointerType.RIGHT;
					break;
			}
		}.bind(this));

		domElement.addEventListener('mousemove', function (event) {
			this.x = event.clientX;
			this.y = event.clientY;
			this.moved = true;
		}.bind(this));
	}

	// getScreenX: function () {
	// 	return this.x;
	// },
	//
	// getScreenY: function () {
	// 	return this.y;
	// },
	//
	// getWorldX: function () {
	// 	return this.x + (playerCam ? playerCam.getX() : 0);
	// },
	//
	// getWorldY: function () {
	// 	return this.y + (playerCam ? playerCam.getY() : 0);
	// }
};