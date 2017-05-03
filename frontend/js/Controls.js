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

const ALT_ACTION_KEYS = [
	'q'.charCodeAt(0),
	'Q'.charCodeAt(0),
	16 // Shift
];

const PAUSE_KEYS = [
	'p'.charCodeAt(0),
	'P'.charCodeAt(0)
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

		this.clock = new Tock({
			interval: Constants.INPUT_TICKRATE,
			callback: function () {
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
				if (anyKeyIsPressed(ACTION_KEYS)) {
					// TODO: check action delay
					this.chararacter.action();
					action = {
						// TODO aktives Item eintragen
						item: "fist",
						alt: false
					};
				}
				if (anyKeyIsPressed(ALT_ACTION_KEYS)) {
					// TODO: check action delay
					this.chararacter.altAction();
					action = {
						// TODO aktives Item eintragen
						item: "fist",
						alt: true
					};
				}

				if (
					movement.x === 0 &&
					movement.y === 0 &&
					action === null) {
					this.chararacter.stopMovement();
					return;
				}

				this.chararacter.move(movement);

				let input = {
					"movement": movement,
					"rotation": Math.PI * 1.5,
					"action": action
				};

				Backend.sendInputTick(input);
			}.bind(this)
		});

		this.clock.start();
	}

	update() {
		if (anyKeyIsPressed(PAUSE_KEYS)){
			if (two.playing){
				two.pause();
			} else {
				two.play();
			}
		}
		// TODO bei diagonaler Bewegung darf der Movementspeed nicht überschritten werden
	}
}

