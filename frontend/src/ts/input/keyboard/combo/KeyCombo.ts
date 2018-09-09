import ProcessKeyCombo from './ProcessKeyCombo';
import ResetKeyCombo from './ResetKeyCombo';
//  Keys can be either:
//
//  A string (ATARI)
//  An array of either integers (key codes) or strings, or a mixture of both
//  An array of objects (such as Key objects) with a public 'keyCode' property
export default class KeyCombo {
    manager;
    enabled;
    keyCodes;
    current;
    index;
    size;
    timeLastMatched;
    matched;
    timeMatched;
    resetOnWrongKey;
    maxKeyDelay;
    resetOnMatch;
    deleteOnMatch;
    onKeyDown;

    constructor(keyboardManager, keys, config) {
        if (config === undefined) {
            config = {};
        }

        //  Can't have a zero or single length combo (string or array based)
        if (keys.length < 2) {
            return;
        }

        this.manager = keyboardManager;

        this.enabled = true;

        this.keyCodes = [];

        //  if 'keys' is a string we need to get the keycode of each character in it

        for (let i = 0; i < keys.length; i++) {
            let char = keys[i];

            if (typeof char === 'string') {
                this.keyCodes.push(char.toUpperCase().charCodeAt(0));
            }
            else if (typeof char === 'number') {
                this.keyCodes.push(char);
            }
            else if (char.hasOwnProperty('keyCode')) {
                this.keyCodes.push(char.keyCode);
            }
        }

        //  The current keyCode the combo is waiting for
        this.current = this.keyCodes[0];

        //  The current index of the key being waited for in the 'keys' string
        this.index = 0;

        //  The length of this combo (in keycodes)
        this.size = this.keyCodes.length;

        //  The time the previous key in the combo was matched
        this.timeLastMatched = 0;

        //  Has this Key Combo been matched yet?
        this.matched = false;

        //  The time the entire combo was matched
        this.timeMatched = 0;

        //  Custom options ...

        //  If they press the wrong key do we reset the combo?
        this.resetOnWrongKey = true;

        //  The max delay in ms between each key press. Above this the combo is reset. 0 means disabled.
        this.maxKeyDelay = 0;

        //  If previously matched and they press Key 1 again, will it reset?
        this.resetOnMatch = false;

        //  If the combo matches, will it delete itself?
        this.deleteOnMatch = false;

        let _this = this;

        let onKeyDownHandler = function (event) {
            if (_this.matched || !_this.enabled) {
                return;
            }

            let matched = ProcessKeyCombo(event.data, _this);

            if (matched) {
                _this.manager.emit('keycombomatch', _this, event);

                if (_this.resetOnMatch) {
                    ResetKeyCombo(_this);
                }
                else if (_this.deleteOnMatch) {
                    _this.destroy();
                }
            }
        };

        this.onKeyDown = onKeyDownHandler;

        this.manager.on('keydown', onKeyDownHandler);
    }

    //  How far complete is this combo? A value between 0 and 1.
    progress() {

        return this.index / this.size;
    }

    destroy() {
        this.enabled = false;
        this.keyCodes = [];

        this.manager.off('keydown', this.onKeyDown);
        this.manager = undefined;
    }

}
