define(['./keyboard/KeyboardManager', './mouse/MouseManager', './Pointer'], function (Keyboard, Mouse, Pointer) {

//  Phaser.Input.InputManager

	class InputManager {


		/**
		 * [description]
		 *
		 * @class InputManager
		 * @memberOf Phaser.Input
		 * @constructor
		 * @since 3.0.0
		 *
		 * @param {Phaser.Game} game - [description]
		 * @param {object} config - [description]
		 */
		constructor(game, config) {
			/**
			 * [description]
			 *
			 * @property {[type]} game
			 * @since 3.0.0
			 */
			this.game = game;

			/**
			 * [description]
			 *
			 * @property {object} config
			 * @since 3.0.0
			 */
			this.config = config;

			/**
			 * [description]
			 *
			 * @property {boolean} enabled
			 * @default true
			 * @since 3.0.0
			 */
			this.enabled = true;

			/**
			 * Standard FIFO queue.
			 *
			 * @property {array} queue
			 * @default []
			 * @since 3.0.0
			 */
			this.queue = [];

			/**
			 * [description]
			 *
			 * @property {Phaser.Input.Keyboard.KeyboardManager} keyboard
			 * @since 3.0.0
			 */
			this.keyboard = new Keyboard(this);

			/**
			 * [description]
			 *
			 * @property {Phaser.Input.Mouse.MouseManager} mouse
			 * @since 3.0.0
			 */
			this.mouse = new Mouse(this);

			// /**
			//  * [description]
			//  *
			//  * @property {Phaser.Input.Touch.TouchManager} touch
			//  * @since 3.0.0
			//  */
			// this.touch = new Touch(this);
			//
			// /**
			//  * [description]
			//  *
			//  * @property {Phaser.Input.Gamepad.GamepadManager} gamepad
			//  * @since 3.0.0
			//  */
			// this.gamepad = new Gamepad(this);

			/**
			 * [description]
			 *
			 * @property {[type]} activePointer
			 * @since 3.0.0
			 */
			this.activePointer = new Pointer(this, 0);

		}

		/**
		 * The Boot handler is called by Phaser.Game when it first starts up.
		 * The renderer is available by now.
		 *
		 * @method Phaser.Input.InputManager#boot
		 * @since 3.0.0
		 */
		boot() {
			this.keyboard.boot();
			this.mouse.boot();
			// this.touch.boot();
			// this.gamepad.boot();
		}

		/**
		 * [description]
		 *
		 * @method Phaser.Input.InputManager#update
		 * @since 3.0.0
		 *
		 * @param {[type]} time - [description]
		 */
		update(time) {
			this.keyboard.update();
			// this.gamepad.update();

			var len = this.queue.length;

			//  Currently just 1 pointer supported
			var pointer = this.activePointer;

			pointer.reset();

			if (!this.enabled || len === 0) {
				return;
			}

			//  Clears the queue array, and also means we don't work on array data that could potentially
			//  be modified during the processing phase
			var queue = this.queue.splice(0, len);

			//  Process the event queue, dispatching all of the events that have stored up
			for (var i = 0; i < len; i++) {
				var event = queue[i];

				//  TODO: Move to CONSTs so we can do integer comparisons instead of strings.
				switch (event.type) {
					case 'mousemove':

						pointer.move(event, time);
						break;

					case 'mousedown':

						pointer.down(event, time);
						break;

					case 'mouseup':

						pointer.up(event, time);
						break;

					case 'touchmove':

						pointer.touchmove(event, time);
						break;

					case 'touchstart':

						pointer.touchstart(event, time);
						break;

					case 'touchend':

						pointer.touchend(event, time);
						break;
				}
			}
		}
	}

	return InputManager;

});