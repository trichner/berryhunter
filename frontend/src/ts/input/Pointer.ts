import {Vector} from '../Vector';


// DOM event button value:
// A number representing a given button:
// 0: Main button pressed, usually the left button or the un-initialized state
// 1: Auxiliary button pressed, usually the wheel button or the middle button (if present)
// 2: Secondary button pressed, usually the right button
// 3: Fourth button, typically the Browser Back button
// 4: Fifth button, typically the Browser Forward button
// For a mouse configured for left-handed use, the button actions are reversed. In this case, the values are read from
// right to left.

export class Pointer {

    /**
     * [description]
     *
     * @property {Phaser.Input.InputManager} manager
     * @since 3.0.0
     */
    manager;

    /**
     * [description]
     *
     * @property {integer} id
     * @since 3.0.0
     */
    id;

    /**
     * [description]
     *
     * @property {null} event
     * @since 3.0.0
     */
    event;

    /**
     * 0: No button or un-initialized
     * 1: Left button
     * 2: Right button
     * 4: Wheel button or middle button
     * 8: 4th button (typically the "Browser Back" button)
     * 16: 5th button (typically the "Browser Forward" button)
     *
     * @property {number} buttons
     * @default 0
     * @since 3.0.0
     */
    buttons = 0;

    /**
     * [description]
     *
     * @property {Phaser.Math.Vector2} position
     * @since 3.0.0
     */
    position = new Vector();

    /**
     * X coordinate of the Pointer when Button 1 (left button), or Touch, was pressed, used for dragging
     * objects.
     *
     * @property {number} downX
     * @default 0
     * @since 3.0.0
     */
    downX = 0;

    /**
     * Y coordinate of the Pointer when Button 1 (left button), or Touch, was pressed, used for dragging
     * objects.
     *
     * @property {number} downY
     * @default 0
     * @since 3.0.0
     */
    downY = 0;

    /**
     * Time when Button 1 (left button), or Touch, was pressed, used for dragging objects.
     *
     * @property {number} downTime
     * @default 0
     * @since 3.0.0
     */
    downTime = 0;

    /**
     * X coordinate of the Pointer when Button 1 (left button), or Touch, was released, used for dragging
     * objects.
     *
     * @property {number} upX
     * @default 0
     * @since 3.0.0
     */
    upX = 0;

    /**
     * Y coordinate of the Pointer when Button 1 (left button), or Touch, was released, used for dragging
     * objects.
     *
     * @property {number} upY
     * @default 0
     * @since 3.0.0
     */
    upY = 0;

    /**
     * Time when Button 1 (left button), or Touch, was released, used for dragging objects.
     *
     * @property {number} upTime
     * @default 0
     * @since 3.0.0
     */
    upTime = 0;

    /**
     * Is the primary button down? (usually button 0, the left mouse button)
     *
     * @property {boolean} primaryDown
     * @default false
     * @since 3.0.0
     */
    primaryDown = false;


    /**
     * The Drag State of the Pointer:
     *
     * 0 = Not dragging anything
     * 1 = Being checked if dragging
     * 2 = Dragging something
     *
     * @property {number} dragState
     * @default 0
     * @since 3.0.0
     */
    dragState = 0;

    /**
     * Is _any_ button on this pointer considered as being down?
     *
     * @property {boolean} isDown
     * @default false
     * @since 3.0.0
     */
    isDown = false;

    /**
     * [description]
     *
     * @property {boolean} dirty
     * @default false
     * @since 3.0.0
     */
    dirty = false;

    /**
     * [description]
     *
     * @property {boolean} justDown
     * @default false
     * @since 3.0.0
     */
    justDown = false;

    /**
     * [description]
     *
     * @property {boolean} justUp
     * @default false
     * @since 3.0.0
     */
    justUp = false;

    /**
     * [description]
     *
     * @property {boolean} justMoved
     * @default false
     * @since 3.0.0
     */
    justMoved = false;

    /**
     * Did the previous input event come from a Touch input (true) or Mouse? (false)
     *
     * @property {boolean} wasTouch
     * @default false
     * @since 3.0.0
     */
    wasTouch = false;

    /**
     * If the mouse is locked, the horizontal relative movement of the Pointer in pixels since last frame.
     *
     * @property {number} movementX
     * @default 0
     * @since 3.0.0
     */
    movementX = 0;

    /**
     * If the mouse is locked, the vertical relative movement of the Pointer in pixels since last frame.
     *
     * @property {number} movementY
     * @default 0
     * @since 3.0.0
     */
    movementY = 0;

    /**
     * [description]
     *
     * @class Pointer
     * @memberOf Phaser.Input
     * @constructor
     * @since 3.0.0
     *
     * @param {Phaser.Input.InputManager} manager - [description]
     * @param {integer} id - [description]
     */
    constructor(manager, id) {
        this.manager = manager;
        this.id = id;

        Object.defineProperties(this, {});
    }

    /**
     * [description]
     *
     * @name Phaser.Input.Pointer#x
     * @property {number} x
     * @since 3.0.0
     */

    get x() {
        return this.position.x;
    }

    set x(value) {
        this.position.x = value;
    }


    /**
     * [description]
     *
     * @name Phaser.Input.Pointer#y
     * @property {number} y
     * @since 3.0.0
     */

    get y() {
        return this.position.y;
    }

    set y(value) {
        this.position.y = value;
    }


    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#reset
     * @since 3.0.0
     */
    reset() {
        // this.buttons = 0;

        this.dirty = false;

        this.justDown = false;
        this.justUp = false;
        this.justMoved = false;

        this.movementX = 0;
        this.movementY = 0;
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#touchmove
     * @since 3.0.0
     *
     * @param {[type]} event - [description]
     * @param {[type]} time - [description]
     */
    touchmove(event, time) {
        this.event = event;

        this.x = event.changedTouches[0].pageX;
        this.y = event.changedTouches[0].pageY;

        this.justMoved = true;

        this.dirty = true;

        this.wasTouch = true;
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#move
     * @since 3.0.0
     *
     * @param {[type]} event - [description]
     * @param {[type]} time - [description]
     */
    move(event, time) {
        if (event.buttons) {
            this.buttons = event.buttons;
        }

        this.event = event;

        this.x = event.pageX;
        this.y = event.pageY;

        if (this.manager.mouse.locked) {
            // Multiple DOM events may occur within one frame, but only one Phaser event will fire
            this.movementX += event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            this.movementY += event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        }

        this.justMoved = true;

        this.dirty = true;

        this.wasTouch = false;
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#down
     * @since 3.0.0
     *
     * @param {[type]} event - [description]
     * @param {[type]} time - [description]
     */
    down(event, time) {
        // if (event.buttons) {
        this.buttons = event.buttons;
        // }

        this.event = event;

        this.x = event.pageX;
        this.y = event.pageY;

        //  0: Main button pressed, usually the left button or the un-initialized state
        if (event.button === 0) {
            this.primaryDown = true;
            this.downX = this.x;
            this.downY = this.y;
            this.downTime = time;
        }

        this.justDown = true;
        this.isDown = true;

        this.dirty = true;

        this.wasTouch = false;
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#touchstart
     * @since 3.0.0
     *
     * @param {[type]} event - [description]
     * @param {[type]} time - [description]
     */
    touchstart(event, time) {
        this.buttons = 1;

        this.event = event;

        this.x = event.changedTouches[0].pageX;
        this.y = event.changedTouches[0].pageY;

        this.primaryDown = true;
        this.downX = this.x;
        this.downY = this.y;
        this.downTime = time;

        this.justDown = true;
        this.isDown = true;

        this.dirty = true;

        this.wasTouch = true;
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#up
     * @since 3.0.0
     *
     * @param {[type]} event - [description]
     * @param {[type]} time - [description]
     */
    up(event, time) {
        // if (event.buttons) {
        this.buttons = event.buttons;
        // }

        this.event = event;

        this.x = event.pageX;
        this.y = event.pageY;

        //  0: Main button pressed, usually the left button or the un-initialized state
        if (event.button === 0) {
            this.primaryDown = false;
            this.upX = this.x;
            this.upY = this.y;
            this.upTime = time;
        }

        this.justUp = true;
        this.isDown = false;

        this.dirty = true;

        this.wasTouch = false;
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#touchend
     * @since 3.0.0
     *
     * @param {[type]} event - [description]
     * @param {[type]} time - [description]
     */
    touchend(event, time) {
        this.buttons = 0;

        this.event = event;

        this.x = event.changedTouches[0].pageX;
        this.y = event.changedTouches[0].pageY;

        this.primaryDown = false;
        this.upX = this.x;
        this.upY = this.y;
        this.upTime = time;

        this.justUp = true;
        this.isDown = false;

        this.dirty = true;

        this.wasTouch = true;
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#noButtonDown
     * @since 3.0.0
     *
     * @return {boolean} [description]
     */
    noButtonDown() {
        return (this.buttons === 0);
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#leftButtonDown
     * @since 3.0.0
     *
     * @return {boolean} [description]
     */
    leftButtonDown() {
        return (this.buttons & 1);
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#rightButtonDown
     * @since 3.0.0
     *
     * @return {boolean} [description]
     */
    rightButtonDown() {
        return (this.buttons & 2);
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#middleButtonDown
     * @since 3.0.0
     *
     * @return {boolean} [description]
     */
    middleButtonDown() {
        return (this.buttons & 4);
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#backButtonDown
     * @since 3.0.0
     *
     * @return {boolean} [description]
     */
    backButtonDown() {
        return (this.buttons & 8);
    }

    /**
     * [description]
     *
     * @method Phaser.Input.Pointer#forwardButtonDown
     * @since 3.0.0
     *
     * @return {boolean} [description]
     */
    forwardButtonDown() {
        return (this.buttons & 16);
    }

}
