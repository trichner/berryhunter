"use strict";

define(['Game'], function (Game) {

	//noinspection UnnecessaryLocalVariableJS
	let Fps = {
		setup: function () {
			Game.two.bind('update', this.update.bind(this));
		},

		update: function () {
			require(['Develop'], function (Develop) {
				Develop.logFPS(1000 / Game.two.timeDelta);
			})
		}
	};

	return Fps;
});
