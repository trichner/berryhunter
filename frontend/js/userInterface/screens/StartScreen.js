'use strict';

define([], function () {
	const StartScreen = {};

	StartScreen.htmlFile = 'partials/startScreen.html';
	let progress = 0;
	let loadingBar = false;
	Object.defineProperty(StartScreen, 'progress', {
		set: function (value) {
			progress = value;
			if (loadingBar) {
				loadingBar.style.width = (progress * 100) + '%';
				if (progress >= 1) {
					let loadingScreenElement = document.getElementById('loadingScreen');
					if (loadingScreenElement === null) {
						// Element was already removed
						return;
					}
					loadingScreenElement.classList.add('finished');

					loadingScreenElement.addEventListener('animationend', function () {
						if (this.parentNode === null) {
							// Element was already removed
							return;
						}
						this.parentNode.removeChild(loadingScreenElement);
					});
				}
			}
		},

		get: function () {
			return progress;
		},
	});

	StartScreen.onDomReady = function () {
		this.rootElement = document.getElementById('startScreen');
		this.playerNameInput = this.rootElement
			.getElementsByClassName('playerNameInput').item(0);

		loadingBar = document.getElementById('loadingBar');
		// re-set progress to ensure the loading bar is synced.
		this.progress = progress;

		require(['PlayerName'], function (PlayerName) {
			PlayerName.prepareForm(document.getElementById('startForm'), StartScreen.playerNameInput);
			PlayerName.fillInput(StartScreen.playerNameInput);
		});
	};

	StartScreen.show = function () {
		this.rootElement.classList.remove('hidden');
	};

	StartScreen.hide = function () {
		this.rootElement.classList.add('hidden');
	};

	return StartScreen;
});