"use strict";

define(['Preloading', 'NameGenerator'], function (Preloading, NameGenerator) {
	const StartScreen = {};

	const playerNameMaxLength = 20;

	function onDomReady() {
		StartScreen.rootElement = document.getElementById('startScreen');
		StartScreen.playerNameInput = StartScreen.rootElement
			.getElementsByClassName('playerNameInput').item(0);
		StartScreen.playerNameInput.setAttribute('placeholder', NameGenerator.generate());
		StartScreen.playerNameInput.setAttribute('maxlength', playerNameMaxLength);
		StartScreen.playerNameInput.focus();

		document.getElementById('startForm').addEventListener('submit', onSubmit);
	}

	function onSubmit(event) {
		event.preventDefault();

		let name = StartScreen.playerNameInput.value;
		if (!name) {
			name = StartScreen.playerNameInput.getAttribute('placeholder');
		}
		name = name.substr(0, playerNameMaxLength);

		require(['backend/Backend'], function (Backend) {
			Backend.sendJoin({
				playerName: name
			});

			StartScreen.hide();
			UserInterface.show();
		});
	}

	Preloading.registerPartial('partials/startScreen.html')
		.then(() => {
			onDomReady();
		});

	StartScreen.show = function () {
		this.rootElement.classList.remove('hidden');
	};

	StartScreen.hide = function () {
		this.rootElement.classList.add('hidden');
	};

	return StartScreen;
});