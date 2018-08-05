'use strict';

define(['PIXI', 'pixi-ease', 'Events', 'Game', 'underscore'], function (PIXI, Ease, Events, Game, _) {

	class StatusEffect {
		constructor(gameObjectShape, red, green, blue, minAlpha, maxAlpha) {
			this.showing = false;

			this.colorMatrix = new PIXI.filters.ColorMatrixFilter();
			this.colorMatrix.flood(red, green, blue, 1);

			this.maxAlpha = maxAlpha;

			let filterIndex;
			if (_.isArray(gameObjectShape.filters)) {
				let filters = gameObjectShape.filters;
				filterIndex = filters.push(this.colorMatrix) - 1;
				gameObjectShape.filters = filters;
			} else {
				gameObjectShape.filters = [this.colorMatrix];
				filterIndex = 0;
			}

			// Bug in pixi.js? Our filter reference gets messed up the first time it is rendered
			Game.renderer.once('prerender', function () {
				this.colorMatrix = gameObjectShape.filters[filterIndex];
				this.colorMatrix.alpha = minAlpha;
				this.colorMatrix.enabled = false;
			}, this);
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
			let animation = new Ease.list({noTicker: false});
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

			to.on('loop', function () {
				// The effect was scheduled to be removed - remove the update function from the global ticker
				// the rest will be cleaned up by the GC
				if (!this.showing) {
					ticker.remove(updateFn);
					this.colorMatrix.enabled = false;
				}
			}, this);
		}

		hide() {
			this.showing = false;
		}
	}

	StatusEffect.Damaged = 'Damaged';
	StatusEffect.DamagedOverTime = 'DamagedOverTime';
	StatusEffect.Yielded = 'Yielded';
	StatusEffect.Freezing = 'Freezing';
	StatusEffect.Starving = 'Starving';
	StatusEffect.Regenerating = 'Regenerating';


	function statusEffectFilter() {
		let colorMatrix = new PIXI.filters.ColorMatrixFilter();
		let opacity = 0;
		// #BF153A
		colorMatrix.flood(
			191, 21, 58,
			1
		);
		colorMatrix.alpha = opacity;

		// let animation = new Ease.list();
		// let to = animation.to(colorMatrix, {alpha: 0.2}, 500, {
		// 	repeat: true,
		// 	reverse: true,
		// 	ease: 'easeInOutCubic'
		// });

		return [colorMatrix];
	}

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

	// FIXME THIS IS THE FUCKING "BUG" DESCRIBED ABOVE AHHHHHHHHHHH
	Events.on('game.playing', function (Game) {
		Game.player.character.actualShape.filters = statusEffectFilter();
	});

	return StatusEffect;
});