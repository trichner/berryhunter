'use strict';

define(['NameGenerator'], function (NameGenerator) {
	const PlayerName = {};

	PlayerName.MAX_LENGTH = 20;

	PlayerName.get = function () {
		let playerName = {
			name: localStorage.getItem('playerName'),
			suggestion: NameGenerator.generate(),
			fromStorage: true,
		};
		if (playerName.name === null) {
			playerName.fromStorage = false;
		}

		return playerName;
	};

	PlayerName.set = function (name) {
		localStorage.setItem('playerName', name);
	};

	PlayerName.prepareForm = function (formElement, inputElement) {
		inputElement.setAttribute('maxlength', this.MAX_LENGTH);
		formElement.addEventListener('submit', onSubmit.bind(this, inputElement));
	};

	function onSubmit(inputElement, event) {
		event.preventDefault();

		let name = inputElement.value;
		if (!name) {
			name = inputElement.getAttribute('placeholder');
		} else {
			// Only save the name if its not generated
			this.set(name);
		}
		name = name.substr(0, this.MAX_LENGTH);


		require(['backend/Backend'], function (Backend) {
			Backend.sendJoin({
				playerName: name
			});
		});
	}

	PlayerName.fillInput = function (inputElement) {
		let playerName = this.get();
		inputElement.setAttribute('placeholder', playerName.suggestion);
		if (playerName.fromStorage) {
			inputElement.value = playerName.name;
		}

		inputElement.focus();
	};

	return PlayerName;
});