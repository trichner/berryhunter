'use strict';

define(['Events', 'Utils'], function (Events, Utils) {
	const HighScores = {};

	HighScores.isRendered = false;

	HighScores.categories = [
		'alltime',
		'monthly',
		'weekly',
		'daily',
		'current',
	];

	HighScores.updateFromBackend = function (highScores) {
		if (Utils.isUndefined(this.startScreenElement)) {
			// Start screen is not yet loaded - ignore high scores
			return;
		}

		if (!this.isRendered) {
			this.isRendered = true;
			this.show();
		}

		this.categories.forEach(function (category) {
			if (!highScores.hasOwnProperty(category)) {
				return;
			}

			let highScore = highScores[category][0];
			this.elements[category].playerName.textContent = highScore.playerName;
			this.elements[category].score.textContent = highScore.score;
		}, this);
	};

	HighScores.show = function () {
		this.rootElement = document.getElementById('highScores');
		this.rootElement.classList.add('loaded');

		this.elements = {};
		this.categories.forEach(function (category) {
			this.elements[category] = {
				playerName: this.rootElement.querySelector('.highscore.' + category + ' > .playerName'),
				score: this.rootElement.querySelector('.highscore.' + category + ' > .value'),
			}
		}, this);
	};

	Events.on('startScreen.domReady', function (startScreenElement) {
		HighScores.startScreenElement = startScreenElement;
	});

	let mockHighScores = {};
	require(['NameGenerator'], function (NameGenerator) {
		let absoluteHighScore = Utils.randomInt(60000, 300000);

		HighScores.categories.forEach(function (category) {

			mockHighScores[category] = [{
				playerName: NameGenerator.generate(),
				score: absoluteHighScore
			}];

			absoluteHighScore *= Utils.random(0.5, 0.8);
			absoluteHighScore = Math.round(absoluteHighScore);
		});

		setInterval(function () {
			HighScores.updateFromBackend(mockHighScores);

			HighScores.categories.forEach(function (category) {
				mockHighScores[category][0].score += Utils.randomInt(1, 18);
			});
		}, 500);
	});

	return HighScores;
});