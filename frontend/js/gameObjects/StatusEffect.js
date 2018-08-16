'use strict';

define(['PIXI', 'pixi-ease', 'Events', 'Game', 'underscore'], function (PIXI, Ease, Events, Game, _) {

	class StatusEffect {
		constructor(gameObjectShape, red, green, blue, startAlpha, endAlpha) {
			this.showing = false;

			this.colorMatrix = new PIXI.filters.ColorMatrixFilter();
			this.colorMatrix.flood(red, green, blue, 1);
			this.colorMatrix.alpha = startAlpha;
			this.colorMatrix.enabled = false;

			this.startAlpha = startAlpha;
			this.endAlpha = endAlpha;

			if (_.isArray(gameObjectShape.filters)) {
				// filters are returned as copy
				let filters = gameObjectShape.filters;
				// so we modify the copy
				filters.push(this.colorMatrix);
				// and replace the filters with the modified copy
				gameObjectShape.filters = filters;
			} else {
				gameObjectShape.filters = [this.colorMatrix];
			}
		}

		static forDamaged(gameObjectShape) {
			// #BF153A old Health Bar dark red?
			return new StatusEffect(gameObjectShape, 191, 21, 58, 0.8, 0.0);
		}

		static forDamagedOverTime(gameObjectShape) {
			// #BF153A old Health Bar dark red?
			return new StatusEffect(gameObjectShape, 191, 21, 58, 0.8, 0.2);
		}

		static forFreezing(gameObjectShape) {
			// #1E7A1E
			return new StatusEffect(gameObjectShape, 18, 87, 153, 0.4, 0.8);
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

			this.colorMatrix.enabled = true;
			this.colorMatrix.alpha = this.startAlpha;
			
			let animation = new Ease.list({noTicker: true});
			const ticker = PIXI.ticker.shared;
			this.updateFn = function () {
				animation.update(ticker.deltaTime * 16.66);
			};
			ticker.add(this.updateFn);
			let to = animation.to(
				this.colorMatrix,
				{alpha: this.endAlpha},
				500,
				{
					repeat: true,
					reverse: true,
					ease: 'easeInOutCubic'
				}
			);

			// If the startAlpha is lower, we want the animation to end on the start
			// in the opposite case, the animation should end on the end (without reversing)
			let isReverse = (this.startAlpha > this.endAlpha);
			to.on('loop', function () {
				isReverse = !isReverse;
				// The effect was scheduled to be removed - remove the update function from the global ticker
				// the rest will be cleaned up by the GC
				if (!this.showing && !isReverse) {
					this.forceHide();
				}
			}, this);
		}

		hide() {
			this.showing = false;
		}

		forceHide() {
			this.showing = false;
			PIXI.ticker.shared.remove(this.updateFn);
			this.colorMatrix.enabled = false;
		}
	}

	StatusEffect.Damaged = {id: 'Damaged', priority: 1};
	StatusEffect.DamagedAmbient = {id: 'DamagedAmbient', priority: 2};
	StatusEffect.Yielded = {id: 'Yielded', priority: 3};
	StatusEffect.Freezing = {id: 'Freezing', priority: 4};
	StatusEffect.Starving = {id: 'Starving', priority: 5};
	StatusEffect.Regenerating = {id: 'Regenerating', priority: 6};

	StatusEffect.sortByPriority = function (statusEffects) {
		return statusEffects.sort(function (a, b) {
			return a.priority - b.priority;
		});
	};

	return StatusEffect;
});