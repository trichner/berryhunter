'use strict';

define(['Preloading', 'PlayerName'], function (Preloading, PlayerName) {
	const EndScreen = {};

	function onDomReady() {
		this.rootElement = document.getElementById('endScreen');
		this.playerNameInput = this.rootElement
			.getElementsByClassName('playerNameInput').item(0);

		PlayerName.prepareForm(document.getElementById('endForm'), this.playerNameInput);
	}

	Preloading.registerPartial('partials/endScreen.html')
		.then(() => {
			onDomReady.call(EndScreen);
		});

	EndScreen.show = function () {
		PlayerName.fillInput(this.playerNameInput);

		this.rootElement.classList.add('showing');
	};

	EndScreen.hide = function () {
		this.rootElement.classList.remove('showing');
	};

	return EndScreen;
});