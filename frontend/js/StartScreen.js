'use strict';

define(['Preloading', 'PlayerName'], function (Preloading, PlayerName) {
	const StartScreen = {};

	function onDomReady() {
		this.rootElement = document.getElementById('startScreen');
		this.playerNameInput = this.rootElement
			.getElementsByClassName('playerNameInput').item(0);

		PlayerName.prepareForm(document.getElementById('startForm'), this.playerNameInput);
		PlayerName.fillInput(this.playerNameInput);
	}

	Preloading.registerPartial('partials/startScreen.html')
		.then(() => {
			onDomReady.call(StartScreen);
		});

	StartScreen.show = function () {
		this.rootElement.classList.remove('hidden');
	};

	StartScreen.hide = function () {
		this.rootElement.classList.add('hidden');
	};

	return StartScreen;
});