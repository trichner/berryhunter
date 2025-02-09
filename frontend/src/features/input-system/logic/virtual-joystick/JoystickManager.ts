import * as nipplejs from '../../../../libraries/nipplejs/types/index';
import nipple from '../../../../libraries/nipplejs/src/index';

export class JoystickManager {
    manager: nipplejs.JoystickManager;

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
        this.manager.on('move',  (data : nipplejs.EventData, output : nipplejs.JoystickOutputData) => {

            console.log('Joystick move.', data, output);

            // // get the force and don't let it be greater than 1
            // let force : number = Math.min(output.force, 1);
            //
            // // get the angle, in radians
            // let angle : number = output.angle.radian;
            //
            // // determine the speed, according to force and player speed
            // let speed : number = GameOptions.playerSpeed * force;
            //
            // // set player velocity using trigonometry
            // this.player.setVelocity(speed * Math.cos(angle), speed * Math.sin(angle) * -1);
        });

        // listener to be triggered when the joystick stops moving
        this.manager.on('end',  () => {

            console.log('Joystick end.');

            // stop the player
            // this.player.setVelocity(0, 0);
        })
    }
}
