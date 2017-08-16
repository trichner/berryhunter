"use strict";

define(['Preloading', 'Utils', 'backend/Backend'], function (Preloading, Utils, Backend) {
	const Console = {};

	Console.KEYS = [
		220, // ^ for german keyboards
		192, // ` for US keyboards
	];

	const FILTERED_KEYCODES = [
		'^'.charCodeAt(0),
		'â'.charCodeAt(0),
		'ô'.charCodeAt(0),
		'û'.charCodeAt(0),
		'Â'.charCodeAt(0),
		'Ô'.charCodeAt(0),
		'Û'.charCodeAt(0)
	];

	let token = Utils.getUrlParameter('token');
	let isOpen = false;

	function onDomReady() {
		Console.rootElement = document.getElementById('console');
		let commandInput = document.getElementById('console_command');
		Console.commandInput = commandInput;
		Console.historyElement = document.getElementById('console_history');

		commandInput.addEventListener('keypress', function (event) {
			if (FILTERED_KEYCODES.indexOf(event.which) !== -1) {
				event.preventDefault();
			}
		});

		document.getElementById('console').addEventListener('submit', function (event) {
			event.preventDefault();

			onCommand(commandInput.value);
			commandInput.value = '';
		});
	}

	function onCommand(command) {
		Console.log(command);
		if (token) {
			Backend.sendCommand({
				command: command,
				token: token
			});
		} else {
			Console.log('ERROR: URL parameter "token" is not defined!');
		}
	}

	Console.log = function (string) {
		if (Console.historyElement.innerHTML.length > 0) {
			Console.historyElement.innerHTML += '<br />';
		}
		Console.historyElement.innerHTML += string;
		Console.historyElement.scrollTop = Console.historyElement.scrollHeight;
	};

	Console.show = function () {
		Console.rootElement.classList.add('showing');
		Console.commandInput.focus();
		isOpen = true;
	};

	Console.hide = function () {
		Console.rootElement.classList.remove('showing');
		isOpen = false;
	};

	Console.toggle = function () {
		if (isOpen) {
			Console.hide();
		} else {
			Console.show();
		}
	};

	Console.isOpen = function () {
		return isOpen;
	};

	Preloading.registerPartial('partials/console.html')
		.then(() => {
			onDomReady();
		});

	return Console;
});