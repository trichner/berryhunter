'use strict';

define(['Game', 'GameObject', 'Preloading', 'Utils', 'GraphicsConfig', './StatusEffect'], function (Game, GameObject, Preloading, Utils, GraphicsConfig, StatusEffect) {

	function maxSize(mob) {
		return GraphicsConfig.mobs[mob].maxSize;
	}

	function minSize(mob) {
		return GraphicsConfig.mobs[mob].minSize;
	}

	function file(mob) {
		return GraphicsConfig.mobs[mob].file;
	}

	class Mob extends GameObject {
		constructor(gameLayer, x, y, size, rotation) {
			super(gameLayer, x, y, size, rotation);
			this.isMoveable = true;
			this.visibleOnMinimap = false;
		}

		setRotation(rotation) {
			if (Utils.isUndefined(rotation)) {
				return;
			}

			// Subtract the default rotation offset of all animal graphics
			GameObject.prototype.setRotation.call(this, rotation + Math.PI / 2);
		}

		// TODO
		// createStatusEffects(){
		// 	return {
		// 		DamagedOverTime: StatusEffect.forDamagedOverTime(this.shape)
		// 	}
		// }
	}

	class Dodo extends Mob {
		constructor(x, y) {
			super(Game.layers.mobs.dodo, x, y, Utils.randomInt(minSize("dodo"), maxSize("dodo")));
		}
	}

	Preloading.registerGameObjectSVG(Dodo, file("dodo"), maxSize("dodo"));

	class SaberToothCat extends Mob {
		constructor(x, y) {
			super(Game.layers.mobs.saberToothCat, x, y, Utils.randomInt(minSize("saberToothCat"), maxSize("saberToothCat")));

		}
	}

	Preloading.registerGameObjectSVG(SaberToothCat, file("saberToothCat"), maxSize("saberToothCat"));


	class Mammoth extends Mob {
		constructor(x, y) {
			super(Game.layers.mobs.mammoth, x, y, Utils.randomInt(minSize("mammoth"), maxSize("mammoth")));
		}
	}

	Preloading.registerGameObjectSVG(Mammoth, file("mammoth"), maxSize("mammoth"));

	return {
		Mob: Mob,
		Dodo: Dodo,
		SaberToothCat: SaberToothCat,
		Mammoth: Mammoth
	}
});