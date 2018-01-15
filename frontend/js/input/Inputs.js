"use strict";

define(['underscore'], function (_) {
	const Inputs = {};

	Inputs.Buttons = {
		LEFT: 0,
		MIDDLE: 1,
		RIGHT: 2
	};

	/**
	 * Holds the key codes of currently pressed keys.
	 */
	let downKeys = {};
	let downButtons = {};

	/*
	 * Maps to hold keys that have been release by the user and will be flushed.
	 */
	let upKeys = {};
	let upButtons = {};

	/**
	 * If true, ALL inputs will be reset with the next flush.
	 * @type {boolean}
	 */
	let dropped = false;

	function printDownKeys() {
		let keys = [];
		for (let [key, value] of Object.entries(downKeys)) {
			if (value) {
				keys.push(key);
			}
		}
		if (keys.length === 0) {
			console.log('No keys down.')
		} else {
			console.log('Keys down', keys);
		}
	}

	function onKeyDown(event) {
		if (downKeys[event.which]) { // prevent multiple firings
			return;
		}

		downKeys[event.which] = true;

		// console.log('Key down:', event.which);
		// printDownKeys();
	}

	function onKeyUp(event) {
		upKeys[event.which] = false;
		// console.log('Key up:', event.which);
	}

	function mapMouseButton(button) {
		switch (button) {
			case 0:
				return 'left';
			case 1:
				return 'middle';
			case 2:
				return 'right';
		}
	}

	function onMouseDown(event) {
		// downButtons[mapMouseButton(event.button)] = true;
		downButtons[event.button] = true;
		// console.log('Mouse down: ' + mapMouseButton(event.button));
	}

	function onMouseUp(event) {
		upButtons[event.button] = false;
		// upButtons[mapMouseButton(event.button)] = false;
		// console.log('Mouse up: ' + mapMouseButton(event.button));
	}

	function onMouseMove(event) {
		this.mouseX = event.clientX;
		this.mouseY = event.clientY;
		this.mouseMoved = true;
	}

	function onBlur() {
		dropInputs();
		// console.log('Blur - clear out keys and mouse buttons?');
	}

	function onMouseLeave() {
		dropInputs();
		// console.log('Mouse leave - clear out keys and mouse buttons?');
	}

	function dropInputs() {
		dropped = true;
	}

	Inputs.setup = function () {
		document.addEventListener('keydown', onKeyDown.bind(this));
		document.addEventListener('keyup', onKeyUp.bind(this));
		window.addEventListener('blur', onBlur.bind(this));
		document.addEventListener('mousedown', onMouseDown.bind(this));
		document.addEventListener('mouseup', onMouseUp.bind(this));
		document.addEventListener('mousemove', onMouseMove.bind(this));
		document.addEventListener('mouseleave', onMouseLeave.bind(this));

		this.mouseMoved = false;

		// let lastMouseX = undefined;
		// let lastMouseY = undefined;
		// setInterval(function () {
		// 	if (lastMouseX !== this.mouseX || lastMouseY !== this.mouseY) {
		// 		console.log('Mouse move: [' + this.mouseX + '/' + this.mouseY + ']');
		// 		lastMouseX = this.mouseX;
		// 		lastMouseY = this.mouseY;
		// 	}
		//
		// 	this.flush();
		// }.bind(this), 1000);
	};

	Inputs.drop = dropInputs;

	/**
	 * Method removes released buttons from pressed buttons. This useful for sampled inputs
	 * to capture short clicks and key presses that would otherwise get lost.
	 *
	 * Also handöes dropping of inputs, in case the browser loses focus.
	 */
	Inputs.flush = function () {
		if (dropped) {
			// if (Object.values(downKeys).length > 0 ||
			// 	downButtons.left ||
			// 	downButtons.middle ||
			// 	downButtons.right) {
			// 	console.log('Dropped inputs during flush.')
			// }
			downKeys = {};
			downButtons = {};

			upKeys = {};
			upButtons = {};

			dropped = false;
		} else {
			if (Object.values(upKeys).length > 0) {
				// console.log('Flush keys: ', Object.keys(upKeys));
				downKeys = _.extend(downKeys, upKeys);
				upKeys = {};
			}

			if (Object.values(upButtons).length > 0) {
				// console.log('Flush buttons: ', Object.keys(upButtons));
				downButtons = _.extend(downButtons, upButtons);
				upButtons = {};
			}
		}
		this.mouseMoved = false;
	};

	Inputs.isKeyPressed = function (keyCode) {
		return downKeys[keyCode] === true;
	};

	Inputs.isAnyKeyPressed = function (keyCodes) {
		return keyCodes.some(this.isKeyPressed);
	};

	/**
	 * @param button one of Inputs.Buttons
	 * @return {boolean}
	 */
	Inputs.isButtonPressed = function (button) {
		return downButtons[button] === true;
	};

	/**
	 * @param buttons array of values of Inputs.Buttons
	 * @return {boolean|*}
	 */
	Inputs.isAnyButtonPressed = function (buttons) {
		return buttons.some(this.isButtonPressed);
	};

	return Inputs;
});