'use strict';

define(['Preloading', 'PlayerName', 'Console', 'Utils'], function (Preloading, PlayerName, Console, Utils) {
	const EndScreen = {};

	function onDomReady() {
		this.rootElement = document.getElementById('endScreen');
		this.playerNameInput = this.rootElement
			.getElementsByClassName('playerNameInput').item(0);

		PlayerName.prepareForm(document.getElementById('endForm'), this.playerNameInput);

		Utils.preventInputPropagation(this.rootElement);

		this.rootElement.getElementsByClassName('playerForm').item(0)
			.addEventListener('animationend', function () {
				// As soon as the form is faded in, focus the input field
				this.playerNameInput.focus();
			}.bind(this));
	}

	Preloading.registerPartial('partials/endScreen.html')
		.then(() => {
			onDomReady.call(EndScreen);
		});

	EndScreen.show = function () {
		PlayerName.fillInput(this.playerNameInput);
		Console.hide();

		this.rootElement.classList.add('showing');
	};

	EndScreen.hide = function () {
		this.rootElement.classList.remove('showing');
	};

	return EndScreen;
});