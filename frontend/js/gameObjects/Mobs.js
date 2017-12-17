"use strict";

define(['Game', 'GameObject', 'Preloading', 'Utils'], function (Game, GameObject, Preloading, Utils) {
	class Mob extends GameObject {
		constructor(gameLayer, x, y, size, rotation) {
			super(gameLayer, x, y, size, rotation);
			this.rotateOnPositioning = true;
			this.isMoveable = true;
			this.visibleOnMinimap = false;
		}

		// FIXME remove this method once https://trello.com/c/ykYuFHGU/114-animals-bekommen-keine-sinnvolle-rotation-mitgeschickt is implemented in the backend
		setRotation(rotation) {
			if (Utils.isUndefined(rotation)) {
				return;
			}

			// Subtract the default rotation offset of all animal graphics
			GameObject.prototype.setRotation.call(this, rotation + Math.PI / 2);
		}
	}

	class Dodo extends Mob {
		constructor(x, y) {
			super(Game.layers.mobs.dodo, x, y, Utils.randomInt(30, 45))
		}
	}

	Preloading.registerGameObjectSVG(Dodo, 'img/dodo.svg', 30);

	class SaberToothCat extends Mob {
		constructor(x, y) {
			super(Game.layers.mobs.saberToothCat, x, y, Utils.randomInt(40, 60));
		}
	}

	Preloading.registerGameObjectSVG(SaberToothCat, 'img/saberToothCat.svg', 60);

	class Mammoth extends Mob {
		constructor(x, y) {
			super(Game.layers.mobs.mammoth, x, y, Utils.randomInt(70, 100));
		}
	}

	Preloading.registerGameObjectSVG(Mammoth, 'img/mammoth.svg', 100);

	return {
		Mob: Mob,
		Dodo: Dodo,
		SaberToothCat: SaberToothCat,
		Mammoth: Mammoth
	}
});