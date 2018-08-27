'use strict';

define(['PlayerName', 'Utils', 'Events', 'vendor/detect-browser'], function (PlayerName, Utils, Events, DetectBrowser) {
	const StartScreen = {};

	StartScreen.htmlFile = 'partials/startScreen.html';
	StartScreen.isDomReady = false;
	let progress = 0;
	let loadingBar = null;
	Object.defineProperty(StartScreen, 'progress', {
		set: function (value) {
			// Prevent the progress from going backwards
			if (value <= progress) {
				return;
			}
			progress = value;
			if (this.isDomReady) {
				loadingBar.style.width = (progress * 100) + '%';
				if (progress >= 1) {
					let self = this;
					Events.on('firstGameStateRendered', function () {
						self.rootElement.classList.remove('loading');
						self.rootElement.classList.add('finished');
						// let loadingScreenElement = document.getElementById('loadingScreen');
						// if (loadingScreenElement === null) {
						// 	// Element was already removed
						// 	return;
						// }
						self.rootElement.getElementsByClassName('playerNameSubmit').item(0).value = "Play";
					})

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

		Utils.preventInputPropagation(this.rootElement);

		this.playerNameInput = this.rootElement
			.getElementsByClassName('playerNameInput').item(0);
		this.rootElement.getElementsByClassName('playerNameSubmit').item(0).disabled = false;

		loadingBar = document.getElementById('loadingBar');

		this.isDomReady = true;

		let startForm = document.getElementById('startForm');
		PlayerName.prepareForm(startForm, StartScreen.playerNameInput);
		PlayerName.fillInput(StartScreen.playerNameInput);

		// re-set progress to ensure the loading bar is synced.
		this.progress = progress;

		this.chromeWarning = document.getElementById('chromeWarning');

		let browser = DetectBrowser.detect();
		if (browser.name !== 'chrome') {
			this.chromeWarning.classList.remove('hidden');
			startForm.classList.add('hidden');
			document.getElementById('continueAnywayButton').addEventListener('click', function (event) {
				event.preventDefault();
				this.chromeWarning.classList.add('hidden');
				startForm.classList.remove('hidden');
			}.bind(this));
		}
	};

	StartScreen.show = function () {
		this.rootElement.classList.remove('hidden');
	};

	StartScreen.hide = function () {
		this.rootElement.classList.add('hidden');
	};

	return StartScreen;
});