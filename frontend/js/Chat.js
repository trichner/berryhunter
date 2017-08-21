"use strict";

define(['Utils', 'UserInterface'], function (Utils, UserInterface) {
	const Chat = {};

	Chat.KEYS = [
		13 // ENTER key
	];

	require(['Game', 'backend/Backend'], function (Game, Backend) {
		Chat.setup = function () {
			Chat.rootElement = UserInterface.getChat();
			let inputElement = Chat.rootElement.querySelector('#chatInput');
			Chat.inputElement = inputElement;

			inputElement.addEventListener('keydown', function (event) {
				if (Chat.KEYS.indexOf(event.which) !== -1) {
					Backend.sendChatMessage({
						message: inputElement.textContent
					});
					Game.player.character.say(inputElement.textContent);
					inputElement.textContent = '';
					Chat.hide();
					Game.two.renderer.domElement.focus();
					event.preventDefault();
					event.stopPropagation();
				}
			});
		};

		Chat.showMessage = function (entityId, message) {
			let gameObject = Game.map.getObject(entityId);
			if (Utils.isFunction(gameObject.say)) {
				gameObject.say(message);
			}
		};
	});

	let isOpen = false;

	Chat.show = function () {
		this.rootElement.classList.remove('hidden');
		this.inputElement.focus();
		isOpen = true;
	};

	Chat.hide = function () {
		this.rootElement.classList.add('hidden');
		isOpen = false;
	};

	Chat.isOpen = function () {
		return isOpen;
	};

	return Chat;
});