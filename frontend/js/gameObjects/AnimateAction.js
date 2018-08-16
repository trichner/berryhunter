'use strict';

define(['Utils', 'GraphicsConfig', 'pixi-ease'], function (Utils, GraphicsConfig, Ease) {

	const animationCfg = GraphicsConfig.character.actionAnimation;

	const types = {};

	function animateAction(hand, type, animationFrame) {
		if (Utils.isUndefined(animationFrame)) {
			animationFrame = animationCfg.backendTicks;
		}
		let slowmo = 1;
		let overallDuration = animationCfg.duration * slowmo;
		let forwardDuration = overallDuration * animationCfg.relativeDurationForward;
		let start = overallDuration * (1 - animationFrame / animationCfg.backendTicks);
		console.log("Forward start at", start / slowmo);
		types[type].call(this, hand, overallDuration, forwardDuration, start);
	}

	types.swing = function (hand, overallDuration, forwardDuration, start) {
		let animation = new Ease.list();
		animation.to(
			hand,
			{
				x: hand.originalTranslation.x + this.size * 0.6,
			},
			forwardDuration,
			{
				ease: 'easeOutCirc',
			},
		).time = start;
		animation.to(
			hand,
			{
				y: hand.originalTranslation.y - this.size * 0.6,
			},
			forwardDuration,
			{
				ease: 'easeInCirc',
			},
		).time = start;
		animation.to(
			hand,
			{
				rotation: Utils.deg2rad(-45),
			},
			forwardDuration,
			{
				ease: 'linear',
			},
		).time = start;

		animation.on('done', function () {
			let animation = new Ease.list();
			let duration = overallDuration - forwardDuration;
			start = Math.max(0, start - forwardDuration);
			console.log("Backward start at", start);
			animation.to(
				hand,
				{
					x: hand.originalTranslation.x,
				},
				duration,
				{
					ease: 'easeInCirc',
				},
			).time = start;
			animation.to(
				hand,
				{
					y: hand.originalTranslation.y,
				},
				duration,
				{
					ease: 'easeOutCirc',
				},
			).time = start;
			animation.to(
				hand,
				{
					rotation: 0,
				},
				duration,
				{
					ease: 'linear',
				},
			).time = start;

			animation.on('done', function () {
				console.log('All done');
			});
		});
	};

	types.stab = function (hand, overallDuration, forwardDuration, start) {
		let animation = new Ease.list();
		animation.to(
			hand,
			{
				x: hand.originalTranslation.x + this.size * 0.4,
			},
			forwardDuration,
			{
				ease: 'easeInOutQuad',
			},
		).time = start;

		animation.on('done', function () {
			let animation = new Ease.list();
			let duration = overallDuration - forwardDuration;
			start = Math.max(0, start - forwardDuration);
			console.log("Backward start at", start);
			animation.to(
				hand,
				{
					x: hand.originalTranslation.x,
				},
				duration,
				{
					ease: 'linear',
				},
			).time = start;

			animation.on('done', function () {
				console.log('All done');
			});
		});
	};

	return animateAction;
});