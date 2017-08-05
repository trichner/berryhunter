"use strict";

define(['GameObject', 'Two', 'Preloading', 'Utils'], function (GameObject, Two, Preloading, Utils) {
	class Mob extends GameObject {
		constructor(x, y, size, rotation) {
			super(x, y, size, rotation);
			this.rotateOnPositioning = false;
			this.isMoveable = true;
			this.visibleOnMinimap = false;
		}
	}

	class Dodo extends Mob {
		constructor(x, y) {
			super(x, y)
		}
	}
	Preloading.registerGameObjectSVG(Dodo, 'img/dodo.svg');

	class SaberToothCat extends Mob {

		constructor(x, y) {
			super(x, y, Utils.randomInt(30, 50));
		}
	}
	Preloading.registerGameObjectSVG(SaberToothCat, 'img/saberToothCat.svg');

	class Mammoth extends Mob {

		constructor(x, y) {
			super(x, y, Utils.randomInt(60, 90));
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