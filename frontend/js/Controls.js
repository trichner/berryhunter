/**
 * Created by raoulzander on 25.04.17.
 */

const UP_KEYS = [
	'w'.charCodeAt(0),
	'W'.charCodeAt(0),
	38 // Up Arrow
];

const DOWN_KEYS = [
	's'.charCodeAt(0),
	'S'.charCodeAt(0),
	40 // Down Arrow
];

const LEFT_KEYS = [
	'a'.charCodeAt(0),
	'A'.charCodeAt(0),
	37 // Left Arrow
];

const RIGHT_KEYS = [
	'd'.charCodeAt(0),
	'D'.charCodeAt(0),
	39 // Right Arrow
];

const ACTION_KEYS = [
	'e'.charCodeAt(0),
	'E'.charCodeAt(0),
	' '.charCodeAt(0) // Space
];

const ACTION_BUTTON = PointerType.LEFT;

const ALT_ACTION_KEYS = [
	'q'.charCodeAt(0),
	'Q'.charCodeAt(0),
	16 // Shift
];

const ALT_ACTION_BUTTON = PointerType.RIGHT;

const PAUSE_KEYS = [
	'p'.charCodeAt(0),
	'P'.charCodeAt(0)
];

/**
 * List of key codes that are browser shortcuts that have to be prevented in normal game flow.
 * @type {Array}
 */
const FUNCTION_KEYS = [
	' '.charCodeAt(0) // Space. Browser: Scrolls the window. Game: Action Key
];

function anyKeyIsPressed(keyList) {
	return keyList.some(function (keyCode) {
		return KeyEvents.keyIsDown(keyCode);
	});
}

class Controls {
	/**
	 *
	 * @param {Character} character
	 */
	constructor(character) {
		this.chararacter = character;
		this.playerId = character.id;

		this.hitAnimationTick = false;

		this.clock = new Tock({
			interval: Constants.INPUT_TICKRATE,
			callback: this.update.bind(this)
		});

		this.clock.start();

		// Not part of KeyEvents as its way more complicated to implement desired behavior there.
		window.addEventListener('keydown', this.handleFunctionKeys.bind(this));
	}

	handleFunctionKeys(event) {
		// TODO check if in chat mode
		let isFunctionKey = FUNCTION_KEYS.indexOf(event.keyCode) !== -1;
		if (isFunctionKey) {
			event.preventDefault();
		}
	}

	update() {
		if (Develop.isActive()){
			if (typeof this.updateTime === 'undefined'){
				this.updateTime = this.clock.lap();
				Develop.logClientTickRate(this.updateTime);
			} else {
				let currentTime = this.clock.lap();
				let timeSinceUpdate = currentTime - this.updateTime;
				this.updateTime = currentTime;
				Develop.logClientTickRate(timeSinceUpdate);
			}
		}

		if (anyKeyIsPressed(PAUSE_KEYS)) {
			if (two.playing) {
				two.pause();
			} else {
				two.play();
			}
			return;
		}

		let movement = {
			x: 0,
			y: 0
		};

		if (anyKeyIsPressed(UP_KEYS)) {
			movement.y -= 1;
		}
		if (anyKeyIsPressed(DOWN_KEYS)) {
			movement.y += 1;
		}
		if (anyKeyIsPressed(LEFT_KEYS)) {
			movement.x -= 1;
		}
		if (anyKeyIsPressed(RIGHT_KEYS)) {
			movement.x += 1;
		}

		let action = null;
		if (this.hitAnimationTick) {
			// Make sure tick 0 gets passed to the character to finish animation
			this.hitAnimationTick--;
			this.chararacter.progressHitAnimation(this.hitAnimationTick);
		} else {
			if (anyKeyIsPressed(ACTION_KEYS) || PointerEvents.pointerDown === ACTION_BUTTON) {
				this.hitAnimationTick = Character.hitAnimationFrameDuration;
				this.chararacter.action();
				this.chararacter.progressHitAnimation(this.hitAnimationTick);
				action = {
					// TODO aktives Item eintragen
					item: "fist",
					alt: false
				};
			}
			if (anyKeyIsPressed(ALT_ACTION_KEYS) || PointerEvents.pointerDown === ALT_ACTION_BUTTON) {
				this.hitAnimationTick = Character.hitAnimationFrameDuration;
				this.chararacter.altAction();
				this.chararacter.progressHitAnimation(this.hitAnimationTick);
				action = {
					// TODO aktives Item eintragen
					item: "fist",
					alt: true
				};
			}
		}

		// FIXME backend crashes when we send actions
		action = null;

		if (
			movement.x === 0 &&
			movement.y === 0 &&
			action === null) {
			this.adjustCharacterRotation();
			return;
		}

		this.chararacter.move(movement);

		let input = {
			"movement": movement,
			"rotation": this.adjustCharacterRotation(),
			"action": action
		};

		Backend.sendInputTick(input);
	}

	adjustCharacterRotation() {
		if (PointerEvents.moved) {
			let rotation = TwoDimensional.angleBetween(
				PointerEvents.x,
				PointerEvents.y,
				centerX,
				centerY
			);
			// let rotation = TwoDimensional.angleBetween(
			// 	centerX,
			// 	centerY,
			// 	PointerEvents.x,
			// 	PointerEvents.y
			// );
			this.chararacter.shape.rotation = rotation;

			PointerEvents.moved = false;

			return rotation;
		}

		return this.chararacter.shape.rotation;
	}
}
