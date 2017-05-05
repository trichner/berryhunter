"use strict";

const KeyEvents = {

	setup: function (domElement) {
		domElement.addEventListener('keydown', this._onkeydown.bind(this));
		domElement.addEventListener('keyup', this._onkeyup.bind(this));
		domElement.addEventListener('keypress', this._onkeypress.bind(this));
		domElement.addEventListener('blur', this._onblur.bind(this));

		if (!MapEditor.isActive()) {
			domElement.focus();
		}
	},

	_setProperty: function (prop, value) {
		this[prop] = value;
	},

	/**
	 * Holds the key codes of currently pressed keys.
	 * @private
	 */
	downKeys: {},

	/**
	 * The boolean system variable keyIsPressed is true if any key is pressed
	 * and false if no keys are pressed.
	 *
	 * @property keyIsPressed
	 * @example
	 * <div>
	 * <code>
	 * var value = 0;
	 * function draw() {
 *   if (keyIsPressed === true) {
 *     fill(0);
 *   } else {
 *     fill(255);
 *   }
 *   rect(25, 25, 50, 50);
 * }
	 * </code>
	 * </div>
	 */
	isKeyPressed: false,
	keyIsPressed: false, // khan

	/**
	 * The system variable key always contains the value of the most recent
	 * key on the keyboard that was typed. To get the proper capitalization, it
	 * is best to use it within keyTyped(). For non-ASCII keys, use the keyCode
	 * variable.
	 *
	 * @property key
	 * @example
	 * <div><code>
	 * // Click any key to display it!
	 * // (Not Guaranteed to be Case Sensitive)
	 * function setup() {
 *   fill(245, 123, 158);
 *   textSize(50);
 * }
	 *
	 * function draw() {
 *   background(200);
 *   text(key, 33,65); // Display last key pressed.
 * }
	 * </div></code>
	 */
	key: '',

	/**
	 * The variable keyCode is used to detect special keys such as BACKSPACE,
	 * DELETE, ENTER, RETURN, TAB, ESCAPE, SHIFT, CONTROL, OPTION, ALT, UP_ARROW,
	 * DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW.
	 *
	 * @property keyCode
	 * @example
	 * <div><code>
	 * var fillVal = 126;
	 * function draw() {
 *   fill(fillVal);
 *   rect(25, 25, 50, 50);
 * }
	 *
	 * function keyPressed() {
 *   if (keyCode == UP_ARROW) {
 *     fillVal = 255;
 *   } else if (keyCode == DOWN_ARROW) {
 *     fillVal = 0;
 *   }
 *   return false; // prevent default
 * }
	 * </code></div>
	 */
	keyCode: 0,

	/**
	 * The keyPressed() function is called once every time a key is pressed. The
	 * keyCode for the key that was pressed is stored in the keyCode variable.
	 * <br><br>
	 * For non-ASCII keys, use the keyCode variable. You can check if the keyCode
	 * equals BACKSPACE, DELETE, ENTER, RETURN, TAB, ESCAPE, SHIFT, CONTROL,
	 * OPTION, ALT, UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW.
	 * <br><br>
	 * For ASCII keys that was pressed is stored in the key variable. However, it
	 * does not distinguish between uppercase and lowercase. For this reason, it
	 * is recommended to use keyTyped() to read the key variable, in which the
	 * case of the variable will be distinguished.
	 * <br><br>
	 * Because of how operating systems handle key repeats, holding down a key
	 * may cause multiple calls to keyTyped() (and keyReleased() as well). The
	 * rate of repeat is set by the operating system and how each computer is
	 * configured.<br><br>
	 * Browsers may have different default
	 * behaviors attached to various key events. To prevent any default
	 * behavior for this event, add "return false" to the end of the method.
	 *
	 * @method keyPressed
	 * @example
	 * <div>
	 * <code>
	 * var value = 0;
	 * function draw() {
 *   fill(value);
 *   rect(25, 25, 50, 50);
 * }
	 * function keyPressed() {
 *   if (value === 0) {
 *     value = 255;
 *   } else {
 *     value = 0;
 *   }
 * }
	 * </code>
	 * </div>
	 * <div>
	 * <code>
	 * var value = 0;
	 * function draw() {
 *   fill(value);
 *   rect(25, 25, 50, 50);
 * }
	 * function keyPressed() {
 *   if (keyCode === LEFT_ARROW) {
 *     value = 255;
 *   } else if (keyCode === RIGHT_ARROW) {
 *     value = 0;
 *   }
 * }
	 * </code>
	 * </div>
	 * <div class="norender">
	 * <code>
	 * function keyPressed(){
 *   // Do something
 *   return false; // prevent any default behaviour
 * }
	 * </code>
	 * </div>
	 */
	_onkeydown: function (e) {
		if (this.downKeys[e.which]) { // prevent multiple firings
			return;
		}
		this._setProperty('isKeyPressed', true);
		this._setProperty('keyIsPressed', true);
		this._setProperty('keyCode', e.which);
		this.downKeys[e.which] = true;
		var key = String.fromCharCode(e.which);
		if (!key) {
			key = e.which;
		}
		this._setProperty('key', key);
		var keyPressed = this.keyPressed || window.keyPressed;
		if (typeof keyPressed === 'function' && !e.charCode) {
			var executeDefault = keyPressed(e);
			if (executeDefault === false) {
				e.preventDefault();
			}
		}
	},
	/**
	 * The keyReleased() function is called once every time a key is released.
	 * See key and keyCode for more information.<br><br>
	 * Browsers may have different default
	 * behaviors attached to various key events. To prevent any default
	 * behavior for this event, add "return false" to the end of the method.
	 *
	 * @method keyReleased
	 * @example
	 * <div>
	 * <code>
	 * var value = 0;
	 * function draw() {
 *   fill(value);
 *   rect(25, 25, 50, 50);
 * }
	 * function keyReleased() {
 *   if (value === 0) {
 *     value = 255;
 *   } else {
 *     value = 0;
 *   }
 *   return false; // prevent any default behavior
 * }
	 * </code>
	 * </div>
	 */
	_onkeyup: function (e) {
		var keyReleased = this.keyReleased || window.keyReleased;
		this._setProperty('isKeyPressed', false);
		this._setProperty('keyIsPressed', false);
		this._setProperty('_lastKeyCodeTyped', null);
		this.downKeys[e.which] = false;
		//delete this._downKeys[e.which];
		var key = String.fromCharCode(e.which);
		if (!key) {
			key = e.which;
		}
		this._setProperty('key', key);
		this._setProperty('keyCode', e.which);
		if (typeof keyReleased === 'function') {
			var executeDefault = keyReleased(e);
			if (executeDefault === false) {
				e.preventDefault();
			}
		}
	},

	/**
	 * The keyTyped() function is called once every time a key is pressed, but
	 * action keys such as Ctrl, Shift, and Alt are ignored. The most recent
	 * key pressed will be stored in the key variable.
	 * <br><br>
	 * Because of how operating systems handle key repeats, holding down a key
	 * will cause multiple calls to keyTyped() (and keyReleased() as well). The
	 * rate of repeat is set by the operating system and how each computer is
	 * configured.<br><br>
	 * Browsers may have different default behaviors attached to various key
	 * events. To prevent any default behavior for this event, add "return false"
	 * to the end of the method.
	 *
	 * @method keyTyped
	 * @example
	 * <div>
	 * <code>
	 * var value = 0;
	 * function draw() {
 *   fill(value);
 *   rect(25, 25, 50, 50);
 * }
	 * function keyTyped() {
 *   if (key === 'a') {
 *     value = 255;
 *   } else if (key === 'b') {
 *     value = 0;
 *   }
 *   // uncomment to prevent any default behavior
 *   // return false;
 * }
	 * </code>
	 * </div>
	 */
	_onkeypress: function (e) {
		if (e.which === this._lastKeyCodeTyped) { // prevent multiple firings
			return;
		}
		this._setProperty('keyCode', e.which);
		this._setProperty('_lastKeyCodeTyped', e.which); // track last keyCode
		this._setProperty('key', String.fromCharCode(e.which));
		var keyTyped = this.keyTyped || window.keyTyped;
		if (typeof keyTyped === 'function') {
			var executeDefault = keyTyped(e);
			if (executeDefault === false) {
				e.preventDefault();
			}
		}
	},
	/**
	 * The onblur function is called when the user is no longer focused
	 * on the p5 element. Because the keyup events will not fire if the user is
	 * not focused on the element we must assume all keys currently down have
	 * been released.
	 */
	_onblur: function (e) {
		this.downKeys = {};
	},

	/**
	 * The keyIsDown() function checks if the key is currently down, i.e. pressed.
	 * It can be used if you have an object that moves, and you want several keys
	 * to be able to affect its behaviour simultaneously, such as moving a
	 * sprite diagonally. You can put in any number representing the keyCode of
	 * the key, or use any of the variable keyCode names listed
	 * <a href="http://p5js.org/reference/#p5/keyCode">here</a>.
	 *
	 * @method keyIsDown
	 * @param {Number}          code The key to check for.
	 * @return {Boolean}        whether key is down or not
	 * @example
	 * <div><code>
	 * var x = 100;
	 * var y = 100;
	 *
	 * function setup() {
 *   createCanvas(512, 512);
 * }
	 *
	 * function draw() {
 *   if (keyIsDown(LEFT_ARROW))
 *     x-=5;
 *
 *   if (keyIsDown(RIGHT_ARROW))
 *     x+=5;
 *
 *   if (keyIsDown(UP_ARROW))
 *     y-=5;
 *
 *   if (keyIsDown(DOWN_ARROW))
 *     y+=5;
 *
 *   clear();
 *   fill(255, 0, 0);
 *   ellipse(x, y, 50, 50);
 * }
	 * </code></div>
	 */
	keyIsDown: function (code) {
		return this.downKeys[code];
	}
};
