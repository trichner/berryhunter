'use strict';

define(['Preloading', 'Utils'], function (Preloading, Utils) {
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
		'Û'.charCodeAt(0),
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

		/*
		 * Disable event propagation for key events to prevent those event defaults
		 * from being prevented globally.
		 */
		function preventInputPropagation(event) {
			if (Console.KEYS.indexOf(event.which) === -1) {
				event.stopPropagation();
			}
		}
		commandInput.addEventListener('keydown', preventInputPropagation);
		commandInput.addEventListener('keydown', preventInputPropagation);

		document.getElementById('console').addEventListener('submit', function (event) {
			event.preventDefault();

			onCommand(commandInput.value);
			commandInput.value = '';
		});

		Console.startTime = Date.now();
	}

	function onCommand(command) {
		Console.log(command);
		if (token) {
			require(['backend/Backend'], function (Backend) {
				Backend.sendCommand({
					command: command,
					token: token,
				});
			});
		} else {
			Console.log('ERROR: URL parameter "token" is not defined!');
		}
	}

	Console.run = function (command) {
		onCommand(command);
	};

	function milliseconds2string(ms) {
		return (ms / 1000).toFixed(2);
	}

	Console.log = function (string) {
		let prefix = milliseconds2string(Date.now() - Console.startTime);
		prefix = '[' + prefix + 's] ';

		if (Console.historyElement.innerHTML.length > 0) {
			Console.historyElement.innerHTML += '<br />';
		}
		Console.historyElement.innerHTML += prefix;
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
		Utils.resetFocus();
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