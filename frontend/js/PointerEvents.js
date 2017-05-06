"use strict";

let PointerEvents = {
	x: 0,
	y: 0,

	setup: function (domElement) {
		// domElement.addEventListener('pointerup', function (event) {
		// 	console.log("pointerup", event);
		// });
		// domElement.addEventListener('pointerdown', function (event) {
		// 	console.log("pointerdown", event);
		// });
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