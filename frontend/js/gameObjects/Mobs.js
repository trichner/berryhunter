"use strict";

define(['Game', 'GameObject', 'Two', 'Preloading', 'Utils'], function (Game, GameObject, Two, Preloading, Utils) {
	class Mob extends GameObject {
		constructor(gameLayer, x, y, size, rotation) {
			super(gameLayer, x, y, size, rotation);
			this.rotateOnPositioning = false;
			this.isMoveable = true;
			this.visibleOnMinimap = false;
		}
	}

	class Dodo extends Mob {
		constructor(x, y) {
			super(Game.layers.mobs.dodo, x, y)
		}
	}
	Preloading.registerGameObjectSVG(Dodo, 'img/dodo.svg');

	class SaberToothCat extends Mob {
		constructor(x, y) {
			super(Game.layers.mobs.saberToothCat, x, y, Utils.randomInt(30, 50));
		}
	}
	Preloading.registerGameObjectSVG(SaberToothCat, 'img/saberToothCat.svg');

	class Mammoth extends Mob {
		constructor(x, y) {
			super(Game.layers.mobs.mammoth, x, y, Utils.randomInt(60, 90));
		}
	}
	Preloading.registerGameObjectSVG(Mammoth, 'img/mammoth.svg');

	return {
		Mob: Mob,
		Dodo: Dodo,
		SaberToothCat: SaberToothCat,
		Mammoth: Mammoth
	}
});