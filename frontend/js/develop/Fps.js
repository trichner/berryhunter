"use strict";

define(['Game', 'Develop'], function (Game, Develop) {

	//noinspection UnnecessaryLocalVariableJS
	let Fps = {
		setup: function () {
			Game.two.bind('update', this.update.bind(this));
		},

		update: function () {
			Develop.logFPS(1000 / Game.two.timeDelta);
		}
	};

	return Fps;
});
