'use strict';

define(['PlayerName'], function (PlayerName) {
	const StartScreen = {};

	StartScreen.htmlFile = 'partials/startScreen.html';
	StartScreen.isDomReady = false;
	let progress = 0;
	let loadingBar = null;
	Object.defineProperty(StartScreen, 'progress', {
		set: function (value) {
			progress = value;
			if (this.isDomReady) {
				loadingBar.style.width = (progress * 100) + '%';
				if (progress >= 1) {
					let self = this;
					require(['backend/Backend'], function (Backend) {
						Backend.promise.then(function () {
							self.rootElement.classList.remove('loading');
							self.rootElement.classList.add('finished');
							// let loadingScreenElement = document.getElementById('loadingScreen');
							// if (loadingScreenElement === null) {
							// 	// Element was already removed
							// 	return;
							// }
							self.rootElement.getElementsByClassName('playerNameSubmit').item(0).value = "Play";
						});
					});

					// loadingScreenElement.classList.add('finished');
					//
					// loadingScreenElement.addEventListener('animationend', function () {
					// 	if (this.parentNode === null) {
					// 		// Element was already removed
					// 		return;
					// 	}
					// 	this.parentNode.removeChild(loadingScreenElement);
					// });
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

		this.isDomReady = true;

		PlayerName.prepareForm(document.getElementById('startForm'), StartScreen.playerNameInput);
		PlayerName.fillInput(StartScreen.playerNameInput);

		// re-set progress to ensure the loading bar is synced.
		this.progress = progress;
	};

	StartScreen.show = function () {
		this.rootElement.classList.remove('hidden');
	};

	StartScreen.hide = function () {
		this.rootElement.classList.add('hidden');
	};

	return StartScreen;
});