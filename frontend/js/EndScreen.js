"use strict";

define(['Preloading', 'Game', 'NameGenerator'], function (Preloading, Game, NameGenerator) {
	const EndScreen = {};

	const playerNameMaxLength = 20;

	function onDomReady() {
		EndScreen.rootElement = document.getElementById('endScreen');
		EndScreen.playerNameInput = EndScreen.rootElement
			.getElementsByClassName('playerNameInput').item(0);
		EndScreen.playerNameInput.setAttribute('maxlength', playerNameMaxLength);

		document.getElementById('endForm').addEventListener('submit', onSubmit);
	}

	function onSubmit(event) {
		event.preventDefault();

		let name = EndScreen.playerNameInput.value;
		if (!name) {
			name = EndScreen.playerNameInput.getAttribute('placeholder');
		}
		name = name.substr(0, playerNameMaxLength);


		require(['backend/Backend'], function (Backend) {
			Backend.sendJoin({
				playerName: name
			});
		});
	}

	Preloading.registerPartial('partials/endScreen.html')
		.then(() => {
			onDomReady();
		});

	EndScreen.show = function () {
		EndScreen.playerNameInput.setAttribute('placeholder', NameGenerator.generate());
		EndScreen.playerNameInput.value = Game.player.character.name;
		this.rootElement.classList.add('showing');
	};

	EndScreen.hide = function () {
		this.rootElement.classList.remove('showing');
	};

	return EndScreen;
});