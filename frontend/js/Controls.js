'use strict';

define([
	'Game',
	'input/Inputs',
	'Constants',
	'Develop',
	'MapEditor',
	'items/Equipment',
	'gameObjects/Placeable',
	'backend/Backend',
	'Console',
	'Chat',
	'Utils',
	'../vendor/tock',
	'input/strategies/phaser/keys/KeyCodes',
	'schema_client'
], function (Game, Inputs, Constants, Develop, MapEditor, Equipment, Placeable, Backend, Console, Chat, Utils, Tock, KeyCodes) {
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

	const ACTION_BUTTON = Inputs.Buttons.LEFT;

	const ALT_ACTION_KEYS = [
		'q'.charCodeAt(0),
		'Q'.charCodeAt(0),
		16 // Shift
	];

	const ALT_ACTION_BUTTON = Inputs.Buttons.RIGHT;

	const PAUSE_KEYS = [
		'p'.charCodeAt(0),
		'P'.charCodeAt(0),
	];

	/**
	 * List of key codes that are browser shortcuts that have to be prevented in normal game flow.
	 * @type {Array}
	 */
	const FUNCTION_KEYS = [
		' '.charCodeAt(0) // Space. Browser: Scrolls the window. Game: Action Key
	];

	let consoleCooldown = 0;

	class Keys {
		constructor() {
			this.keys = [];
			for (let i = 0; i < arguments.length; i++) {
				this.keys.push(Game.keyboardManager.addKey(arguments[i]));
			}

			let self = this;
			Object.defineProperty(this, 'isDown', {
				get: function () {
					return self.keys.some(function (key) {
						return key.isDown;
					});
				}
			});
		}
	}

	class Controls {

		/**
		 * @param {Character} character
		 * @param {function} isCraftInProgress Model function. Can be called to determine if a craft is in progress.
		 */
		constructor(character, isCraftInProgress) {
			this.isCraftInProgress = isCraftInProgress;
			this.character = character;

			if (Constants.ALWAYS_VIEW_CURSOR) {
				this.lastX = character.getX();
				this.lastY = character.getY();
			}

			// Inputs.drop();
			// Inputs.flush();
			this.upKeys = new Keys(KeyCodes.W, KeyCodes.UP);
			this.downKeys = new Keys(KeyCodes.S, KeyCodes.DOWN);
			this.leftKeys = new Keys(KeyCodes.A, KeyCodes.LEFT);
			this.rightKeys = new Keys(KeyCodes.D, KeyCodes.RIGHT);
			this.actionKeys = new Keys(KeyCodes.E, KeyCodes.SPACE);
			this.altActionKeys = new Keys(KeyCodes.Q, KeyCodes.SHIFT);
			this.pauseKeys = new Keys(KeyCodes.P);

			this.hitAnimationTick = false;

			this.clock = new Tock({
				interval: Constants.INPUT_TICKRATE,
				callback: this.update.bind(this),
			});

			this.clock.start();

			// Not part of Inputs as its way more complicated to implement desired behavior there.
			window.addEventListener('keydown', Controls.handleFunctionKeys);
		}

		static handleFunctionKeys(event) {
			if (Chat.isOpen()) {
				return;
			}

			if (Console.KEYS.indexOf(event.which) !== -1) {
				if (consoleCooldown > 0) {
					consoleCooldown--;
				} else {
					Console.toggle();
					consoleCooldown = 30;
				}
				event.preventDefault();
				return;
			}
			if (Console.isOpen()) {
				return;
			}


			if (Chat.KEYS.indexOf(event.which) !== -1) {
				Chat.show();
				event.preventDefault();
				return;
			}

			let isFunctionKey = FUNCTION_KEYS.indexOf(event.keyCode) !== -1;
			if (isFunctionKey) {
				event.preventDefault();
			}
		}

		/**
		 * @return {boolean} whether or not the action was allowed. Visuals have to be aligned to this return value
		 */
		onInventoryAction(item, actionType) {
			if (this.isCraftInProgress()) {
				return false;
			}

			this.inventoryAction = {
				item: item,
				actionType: actionType,
			};
			return true;
		}

		update() {
			Game.keyboardManager.update();

			if (Develop.isActive()) {
				if (Utils.isUndefined(this.updateTime)) {
					this.updateTime = this.clock.lap();
					Develop.logClientTickRate(this.updateTime);
				} else {
					let currentTime = this.clock.lap();
					let timeSinceUpdate = currentTime - this.updateTime;
					this.updateTime = currentTime;
					Develop.logClientTickRate(timeSinceUpdate);
				}

				// Pausing is only available in Develop mode
				if (this.pauseKeys.isDown) {
					if (Game.playing) {
						Game.pause();
					} else {
						Game.play();
					}
					return;
				}
			}

			if (consoleCooldown > 0) {
				consoleCooldown--;
			}

			let movement = {
				x: 0,
				y: 0,
			};

			if (this.upKeys.isDown) {
				movement.y -= 1;
			}
			if (this.downKeys.isDown) {
				movement.y += 1;
			}
			if (this.leftKeys.isDown) {
				movement.x -= 1;
			}
			if (this.rightKeys.isDown) {
				movement.x += 1;
			}

			let action = null;
			if (this.hitAnimationTick) {
				// Make sure tick 0 gets passed to the character to finish animation
				this.hitAnimationTick--;
				this.character.progressHitAnimation(this.hitAnimationTick);
			} else {
				if (Utils.isDefined(this.inventoryAction)) {
					action = this.inventoryAction;
					delete this.inventoryAction;
				} else {
					if (this.isCraftInProgress()) {
						// Don't check for actions
					} else if (this.actionKeys.isDown || Inputs.isButtonPressed(ACTION_BUTTON)) {
						this.hitAnimationTick = this.character.action();
						this.character.progressHitAnimation(this.hitAnimationTick);
						switch (this.character.currentAction) {
							case 'MAIN':
								action = {
									item: Game.player.character.getEquippedItem(Equipment.Slots.HAND),
									actionType: BerryhunterApi.ActionType.Primary
								};
								break;
							case 'PLACING':
								let placedItem = this.character.getEquippedItem(Equipment.Slots.PLACEABLE);

								if (!placedItem.multiPlacing) {
									Game.player.inventory.unequipItem(placedItem, Equipment.Slots.PLACEABLE);
								}

								if (MapEditor.isActive()) {
									let placeableGameobject = new Placeable(
										placedItem,
										this.character.getX() + Math.cos(this.character.getRotation()) * Constants.PLACEMENT_RANGE,
										this.character.getY() + Math.sin(this.character.getRotation()) * Constants.PLACEMENT_RANGE,
									);
									Game.map.objects.push(placeableGameobject);
									Game.player.inventory.removeItem(placedItem, 1);
								} else {
									action = {
										item: placedItem,
										actionType: BerryhunterApi.ActionType.PlaceItem
									}
								}
								break;
						}
					} else if (this.altActionKeys.isDown || Inputs.isButtonPressed(ALT_ACTION_BUTTON)) {
						this.hitAnimationTick = this.character.altAction();
						this.character.progressHitAnimation(this.hitAnimationTick);
						action = {
							item: Game.player.character.getEquippedItem(Equipment.Slots.HAND),
							actionType: BerryhunterApi.ActionType.Primary
						};
					}
				}
			}

			let input = {};
			let hasInput = false;

			if (Constants.ALWAYS_VIEW_CURSOR) {
				if (Inputs.mouseMoved ||
					this.lastX !== this.character.getX() ||
					this.lastY !== this.character.getY()) {

					input.rotation = this.adjustCharacterRotation();
					hasInput = true;
					this.lastX = this.character.getX();
					this.lastY = this.character.getY();
				}
			} else if (Input.mouseMoved) {
				input.rotation = this.adjustCharacterRotation();
				hasInput = true;
			}

			if (movement.x !== 0 || movement.y !== 0) {
				input.movement = movement;
				this.character.move(movement);
				hasInput = true;
			}

			if (action !== null) {
				input.action = action;
				hasInput = true;
			}

			if (hasInput) {
				if (Utils.isUndefined(input.rotation)) {
					// Just send the current character rotation to not confuse the server
					input.rotation = this.character.getRotation();
				}

				Backend.sendInputTick(input);
			}

			Inputs.flush();
		}

		adjustCharacterRotation() {
			if (Utils.isDefined(Game.player)) {
				let characterX = Game.player.camera.getScreenX(this.character.getX());
				let characterY = Game.player.camera.getScreenY(this.character.getY());

				let rotation = Utils.TwoDimensional.angleBetween(
					Inputs.mouseX,
					Inputs.mouseY,
					characterX,
					characterY,
				);

				this.character.setRotation(rotation);

				return rotation;
			}

			return this.character.shape.rotation;
		}

		destroy() {
			this.clock.stop();
			window.removeEventListener('keydown', Controls.handleFunctionKeys);
		}
	}

	return Controls;
});