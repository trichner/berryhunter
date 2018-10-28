//  Phaser.Input.Keyboard.Key

//  A generic Key object which can be passed to the Process functions (and so on)
//  keycode must be an integer
export class Key {

    //  @property {integer} keyCode - The keycode of this key.
    keyCode;

    //  @property {KeyboardEvent} originalEvent - The original DOM event.
    originalEvent = undefined;

    //  @property {boolean} preventDefault - Should this Key prevent event propagation?
    //  @default
    preventDefault = true;

    //  @property {boolean} enabled - Can this Key be processed?
    //  @default
    enabled = true;

    //  @property {boolean} isDown - The "down" state of the key. This will remain `true` for as long as the keyboard thinks this key is held down.
    //  @default
    isDown = false;

    //  @property {boolean} isUp - The "up" state of the key. This will remain `true` for as long as the keyboard thinks this key is up.
    //  @default
    isUp = true;

    //  @property {boolean} altKey - The down state of the ALT key, if pressed at the same time as this key.
    //  @default
    altKey = false;

    //  @property {boolean} ctrlKey - The down state of the CTRL key, if pressed at the same time as this key.
    //  @default
    ctrlKey = false;

    //  @property {boolean} shiftKey - The down state of the SHIFT key, if pressed at the same time as this key.
    //  @default
    shiftKey = false;

    //  @property {integer} location - The location of the modifier key. 0 for standard (or unknown), 1 for left, 2 for right, 3 for numpad.
    //  @default
    location = 0;

    //  @property {number} timeDown - The timestamp when the key was last pressed down. This is based on Game.time.now.
    timeDown = 0;

    //  If the key is down this value holds the duration of that key press and is constantly updated.
    //  If the key is up it holds the duration of the previous down session.
    //  @property {number} duration - The number of milliseconds this key has been held down for.
    //  @default
    duration = 0;

    //  @property {number} timeUp - The timestamp when the key was last released. This is based on Game.time.now.
    //  @default
    timeUp = 0;

    //  @property {number} repeats - If a key is held down this holds down the number of times the key has 'repeated'.
    //  @default
    repeats = 0;

    // @property {boolean} _justDown - True if the key has just been pressed (NOTE: requires to be reset, see justDown getter)
    // @private
    _justDown = false;

    // @property {boolean} _justUp - True if the key has just been pressed (NOTE: requires to be reset, see justDown getter)
    // @private
    _justUp = false;

    constructor(keyCode) {
        this.keyCode = keyCode;
    }
}
