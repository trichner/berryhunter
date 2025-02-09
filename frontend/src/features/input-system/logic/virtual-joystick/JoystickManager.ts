import * as nipplejs from '../../../../libraries/nipplejs/types/index';
import nipple from '../../../../libraries/nipplejs/src/index';
import {Vector} from '../../../core/logic/Vector';

export class JoystickManager {
    private manager: nipplejs.JoystickManager;

    private lastOutputData: nipplejs.JoystickOutputData = null;

    constructor() {
        this.manager = nipple.create({
            validate: (touch: Touch) => {
                return touch.screenX / window.innerWidth <= 0.5;
            }
        });
        // window.addEventListener('touchstart', () => {
        //     this.setup();
        // }, {once: true});
    }

    setup() {

        // listener to be triggered when the joystick moves
        this.manager.on('move', (data: nipplejs.EventData, output: nipplejs.JoystickOutputData) => {
            this.lastOutputData = output;
        });

        // listener to be triggered when the joystick stops moving
        this.manager.on('end', () => {
            this.lastOutputData = null;
            console.log('Joystick end.');
        })
    }

    get movementVector(): Vector {
        if (this.lastOutputData === null) return null;
        // Define dead-zone
        if (this.lastOutputData.distance <= 3) return null;

        return new Vector(this.lastOutputData.vector.x, -1 * this.lastOutputData.vector.y);
    }
}
