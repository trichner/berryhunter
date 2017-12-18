"use strict";

define(['Preloading', 'PlayerName'], function (Preloading, PlayerName) {
	const StartScreen = {};

	const playerNameMaxLength = 20;

	function onDomReady() {
		StartScreen.rootElement = document.getElementById('startScreen');
		StartScreen.playerNameInput = StartScreen.rootElement
			.getElementsByClassName('playerNameInput').item(0);

		let playerName = PlayerName.get();
		StartScreen.playerNameInput.setAttribute('placeholder', playerName.suggestion);
		if (playerName.fromStorage) {
			StartScreen.playerNameInput.setAttribute('value', playerName.name);
		}

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

		PlayerName.set(name);

		require(['backend/Backend'], function (Backend) {
			Backend.sendJoin({
				playerName: name
			});
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