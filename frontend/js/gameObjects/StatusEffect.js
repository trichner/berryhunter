'use strict';

define(['PIXI', 'pixi-ease', 'Events', 'Game', 'underscore'], function (PIXI, Ease, Events, Game, _) {

	class StatusEffect {
		constructor(gameObjectShape, red, green, blue, minAlpha, maxAlpha) {
			this.showing = false;

			this.colorMatrix = new PIXI.filters.ColorMatrixFilter();
			this.colorMatrix.flood(red, green, blue, 1);
			this.colorMatrix.alpha = minAlpha;
			this.colorMatrix.enabled = false;

			this.maxAlpha = maxAlpha;

			if (_.isArray(gameObjectShape.filters)) {
				gameObjectShape.filters.push(this.colorMatrix);
			} else {
				gameObjectShape.filters = [this.colorMatrix];
			}
		}

		static forDamagedOverTime(gameObjectShape) {
			// #BF153A old Health Bar dark red?
			return new StatusEffect(gameObjectShape, 191, 21, 58, 0.2, 0.8);
		}

		static forFreezing(gameObjectShape) {
			// #1E7A1E
			return new StatusEffect(gameObjectShape, 18, 87, 153, 0.2, 0.8);
		}

		static forStarving(gameObjectShape) {
			// #125799
			return new StatusEffect(gameObjectShape, 30, 120, 30, 0.2, 0.8);
		}

		show() {
			if (this.showing) {
				// Nothing to do, Effect is already showing
				return;
			}

			this.showing = true;
			let animation = new Ease.list({noTicker: true});
			const ticker = PIXI.ticker.shared;
			let updateFn = function () {
				animation.update(ticker.deltaTime * 16.66);
			};
			ticker.add(updateFn);
			let to = animation.to(
				this.colorMatrix,
				{alpha: this.maxAlpha},
				500,
				{
					repeat: true,
					reverse: true,
					ease: 'easeInOutCubic'
				}
			);

			this.colorMatrix.enabled = true;

			let isReverse = false;
			to.on('loop', function () {
				isReverse = !isReverse;
				// The effect was scheduled to be removed - remove the update function from the global ticker
				// the rest will be cleaned up by the GC
				if (!this.showing && !isReverse) {
					ticker.remove(updateFn);
					this.colorMatrix.enabled = false;
					this.colorMatrix.alpha = 0.2;
				}
			}, this);
		}

		hide() {
			this.showing = false;
		}
	}

	StatusEffect.Damaged = 'Damaged';
	StatusEffect.DamagedAmbient = 'DamagedAmbient';
	StatusEffect.Yielded = 'Yielded';
	StatusEffect.Freezing = 'Freezing';
	StatusEffect.Starving = 'Starving';
	StatusEffect.Regenerating = 'Regenerating';

	window.hit = function () {
		let colorMatrix = Game.player.character.actualShape.filters[0];

		let animation = new Ease.list();
		let to = animation.to(colorMatrix, {alpha: 0.8}, 0.01, {
			ease: 'easeOutCubic'
		});
		to.on('done', function () {
			animation = new Ease.list();
			let to2 = animation.to(colorMatrix, {alpha: 0}, 300, {
				ease: 'easeInCubic'
			});
			to2.on('done', function () {
				console.log('both done');
			});
		});
	};

	window.toggleHit = function () {
		let statusEffect = Game.player.character.statusEffect;
		if (statusEffect.showing) {
			statusEffect.hide();
		} else {
			statusEffect.show();
		}
	};

	return StatusEffect;
});