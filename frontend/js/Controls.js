/**
 * Created by raoulzander on 25.04.17.
 */



const Command = {
	TOP: 'TOP',
	BOTTOM: 'BOTTOM',
	LEFT: 'LEFT',
	RIGHT: 'RIGHT',
	ACTION: 'ACTION',
	ALT_ACTION: 'ALT_ACTION'
};

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

function anyKeyIsPressed(keyList) {
	return keyList.some(function (keyCode) {
		return KeyEvents.keyIsDown(keyCode);
	});
}

class Controls {
	constructor(character){
		this.chararacter = character;
		this.playerId = character.id;
	}

	update() {
		if (anyKeyIsPressed(UP_KEYS)) {
			this.chararacter.move(Command.TOP);
			Backend.send({
				playerId: this.playerId,
				command: Command.TOP
			});
		}
		if (anyKeyIsPressed(DOWN_KEYS)) {
			this.chararacter.move(Command.BOTTOM);
			Backend.send({
				playerId: this.playerId,
				command: Command.BOTTOM
			});
		}
		if (anyKeyIsPressed(LEFT_KEYS)) {
			this.chararacter.move(Command.LEFT);
			Backend.send({
				playerId: this.playerId,
				command: Command.LEFT
			});
		}
		if (anyKeyIsPressed(RIGHT_KEYS)) {
			this.chararacter.move(Command.RIGHT);
			Backend.send({
				playerId: this.playerId,
				command: Command.RIGHT
			});
		}
		if (anyKeyIsPressed(ACTION_KEYS)) {
			// TODO: check action delay
			this.chararacter.action();
			Backend.send({
				playerId: this.playerId,
				command: Command.ACTION
			});
		}
		if (anyKeyIsPressed(ALT_ACTION_KEYS)) {
			// TODO: check action delay
			this.chararacter.altAction();
			Backend.send({
				playerId: this.playerId,
				command: Command.ACTION
			});
		}
		// TODO bei diagonaler Bewegung darf der Movementspeed nicht überschritten werden
	}
}