import Keyboard from './keyboard/KeyboardManager';
import Mouse from './mouse/MouseManager';
import Pointer from './Pointer';

//  Phaser.Input.InputManager

class InputManager {

    /**
     * [description]
     *
     * @property {object} config
     * @since 3.0.0
     */
    config;

    /**
     * [description]
     *
     * @property {boolean} enabled
     * @default true
     * @since 3.0.0
     */
    enabled = true;

    /**
     * Standard FIFO queue.
     *
     * @property {array} queue
     * @default []
     * @since 3.0.0
     */
    queue = [];

    /**
     * [description]
     *
     * @property {Phaser.Input.Keyboard.KeyboardManager} keyboard
     * @since 3.0.0
     */
    keyboard = new Keyboard();

    /**
     * [description]
     *
     * @property {Phaser.Input.Mouse.MouseManager} mouse
     * @since 3.0.0
     */
    mouse = new Mouse(this);

    // /**
    //  * [description]
    //  *
    //  * @property {Phaser.Input.Touch.TouchManager} touch
    //  * @since 3.0.0
    //  */
    // touch = new Touch(this);
    //
    // /**
    //  * [description]
    //  *
    //  * @property {Phaser.Input.Gamepad.GamepadManager} gamepad
    //  * @since 3.0.0
    //  */
    // gamepad = new Gamepad(this);

    /**
     * [description]
     *
     * @property {[type]} activePointer
     * @since 3.0.0
     */
    activePointer = new Pointer(this, 0);

    /**
     * [description]
     *
     * @class InputManager
     * @memberOf Phaser.Input
     * @constructor
     * @since 3.0.0
     *
     * @param {object} config - [description]
     */
    constructor(config) {

        this.config = config;

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

        let len = this.queue.length;

        //  Currently just 1 pointer supported
        let pointer = this.activePointer;

        pointer.reset();

        if (!this.enabled || len === 0) {
            return;
        }

        //  Clears the queue array, and also means we don't work on array data that could potentially
        //  be modified during the processing phase
        let queue = this.queue.splice(0, len);

        //  Process the event queue, dispatching all of the events that have stored up
        for (let i = 0; i < len; i++) {
            let event = queue[i];

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
