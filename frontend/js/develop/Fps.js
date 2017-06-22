"use strict";

define(['Develop'], function (Develop) {

	let Fps = {
		setup: function () {
			two.bind('update', this.update.bind(this));
		},

		update: function () {
			Develop.logFPS(1000 / two.timeDelta);
		}
	};

	return Fps;
});
