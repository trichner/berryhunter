'use strict';

define(['Game'], function (Game) {

	//noinspection UnnecessaryLocalVariableJS
	let Fps = {
		setup: function () {
			Game.renderer.on('prerender', this.update.bind(this));
		},

		update: function () {
			require(['Develop'], function (Develop) {
				Develop.logFPS(1000 / Game.timeDelta);
			})
		}
	};

	return Fps;
});
