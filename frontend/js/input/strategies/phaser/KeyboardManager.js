/**
 * The Keyboard class monitors keyboard input and dispatches keyboard events.
 *
 * _Note_: many keyboards are unable to process certain combinations of keys due to hardware limitations known as ghosting.
 * See http://www.html5gamedevs.com/topic/4876-impossible-to-use-more-than-2-keyboard-input-buttons-at-the-same-time/ for more details.
 *
 * Also please be aware that certain browser extensions can disable or override Phaser keyboard handling.
 * For example the Chrome extension vimium is known to disable Phaser from using the D key. And there are others.
 * So please check your extensions before opening Phaser issues.
 */

define(['./keys/Key', './keys/KeyCodes', './combo/KeyCombo', './keys/ProcessKeyDown', './keys/ProcessKeyUp'],
	function (Key, KeyCodes, KeyCombo, ProcessKeyDown, ProcessKeyUp) {
		class KeyboardManager {
			constructor() {
				// EventEmitter.call(this);

				this.enabled = false;

				this.target;

				this.keys = [];

				this.combos = [];

				this.captures = [];

				//   Standard FIFO queue
				this.queue = [];

				this.handler;
			}

			/**
			 * The Boot handler is called by Phaser.Game when it first starts up.
			 * The renderer is available by now.
			 */
			boot() {
				this.enabled = true;
				this.target = window;

				if (this.enabled) {
					this.startListeners();
				}
			}

			startListeners() {
				var queue = this.queue;
				var captures = this.captures;

				var handler = function (event) {
					if (event.defaultPrevented) {
						// Do nothing if event already handled
						return;
					}

					queue.push(event);

					if (captures[event.keyCode]) {
						event.preventDefault();
					}
				};

				this.handler = handler;

				this.target.addEventListener('keydown', handler, false);
				this.target.addEventListener('keyup', handler, false);
			}

			stopListeners() {
				this.target.removeEventListener('keydown', this.handler);
				this.target.removeEventListener('keyup', this.handler);
			}

			/**
			 * Creates and returns an object containing 4 hotkeys for Up, Down, Left and Right and also space and shift.
			 */
			createCursorKeys() {
				return this.addKeys({
					up: KeyCodes.UP,
					down: KeyCodes.DOWN,
					left: KeyCodes.LEFT,
					right: KeyCodes.RIGHT,
					space: KeyCodes.SPACE,
					shift: KeyCodes.SHIFT
				});
			}

			/**
			 * A practical way to create an object containing user selected hotkeys.
			 *
			 * For example,
			 *
			 *     addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );
			 *
			 * would return an object containing properties (`up`, `down`, `left` and `right`) referring to {@link Phaser.Key} object.
			 */
			addKeys(keys) {
				var output = {};

				for (var key in keys) {
					output[key] = this.addKey(keys[key]);
				}

				return output;
			}

			/**
			 * If you need more fine-grained control over a Key you can create a new Phaser.Key object via this method.
			 * The Key object can then be polled, have events attached to it, etc.
			 */
			addKey(keyCode) {
				var keys = this.keys;

				if (!keys[keyCode]) {
					keys[keyCode] = new Key(keyCode);
					this.captures[keyCode] = true;
				}

				return keys[keyCode];
			}

			/**
			 * Removes a Key object from the Keyboard manager.
			 */
			removeKey(keyCode) {
				if (this.keys[keyCode]) {
					this.keys[keyCode] = undefined;
					this.captures[keyCode] = false;
				}
			}

			addKeyCapture(keyCodes) {
				if (!Array.isArray(keyCodes)) {
					keyCodes = [keyCodes];
				}

				for (var i = 0; i < keyCodes.length; i++) {
					this.captures[keyCodes[i]] = true;
				}
			}

			removeKeyCapture(keyCodes) {
				if (!Array.isArray(keyCodes)) {
					keyCodes = [keyCodes];
				}

				for (var i = 0; i < keyCodes.length; i++) {
					this.captures[keyCodes[i]] = false;
				}
			}

			createCombo(keys, config) {
				return new KeyCombo(this, keys, config);
			}

			//  https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent
			//  type = 'keydown', 'keyup'
			//  keyCode = integer

			update() {
				var len = this.queue.length;

				if (!this.enabled || len === 0) {
					return;
				}

				//  Clears the queue array, and also means we don't work on array data that could potentially
				//  be modified during the processing phase
				var queue = this.queue.splice(0, len);

				var keys = this.keys;

				//  Process the event queue, dispatching all of the events that have stored up
				for (var i = 0; i < len; i++) {
					var event = queue[i];

					//  Will emit a keyboard or keyup event
					// this.emit(event.type, event);

					if (event.type === 'keydown') {
						// this.emit('down_' + event.keyCode, event);

						if (keys[event.keyCode]) {
							ProcessKeyDown(keys[event.keyCode], event);
						}
					}
					else {
						// this.emit('up_' + event.keyCode, event);

						if (keys[event.keyCode]) {
							ProcessKeyUp(keys[event.keyCode], event);
						}
					}
				}
			}

			shutdown() {
				this.removeAllListeners();
			}

			destroy() {
				this.stopListeners();

				this.removeAllListeners();

				this.keys = [];
				this.combos = [];
				this.captures = [];
				this.queue = [];
				this.handler = undefined;
			}
		}

		return KeyboardManager;
	});