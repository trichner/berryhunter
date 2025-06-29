import '../../assets/inputAreas.less';

import * as nipplejs from '../../../../libraries/nipplejs/types/index';
import nipple from '../../../../libraries/nipplejs/src/index';
import {Vector} from '../../../core/logic/Vector';
import {PreloadingStartedEvent} from '../../../core/logic/Events';
import * as Preloading from '../../../core/logic/Preloading';
import * as HUD from '../../../user-interface/HUD/logic/HUD';

export class JoystickManager {
    private manager: nipplejs.JoystickManager;

    private lastOutputData: nipplejs.JoystickOutputData = null;

    private rightSideTouchIsDown = false;

    public get touchActionActive(): boolean {
        return this.rightSideTouchIsDown;
    }

    constructor() {
    }

    setup() {
        this.manager = nipple.create({
            zone: rootElement.querySelector('.left-input-area')
        });

        // listener to be triggered when the joystick moves
        this.manager.on('move', (data: nipplejs.EventData, output: nipplejs.JoystickOutputData) => {
            this.lastOutputData = output;
        });

        // listener to be triggered when the joystick stops moving
        this.manager.on('end', () => {
            this.lastOutputData = null;
            console.log('Joystick end.');
        });

        let rightInputArea = rootElement.querySelector('.right-input-area');
        rightInputArea.addEventListener('touchstart', evt => {
            this.rightSideTouchIsDown = true;
        });

        rightInputArea.addEventListener('touchend', evt => {
            this.rightSideTouchIsDown = false;
        });
    }

    get movementVector(): Vector {
        if (this.lastOutputData === null) return null;
        // Define dead-zone
        if (this.lastOutputData.distance <= 3) return null;

        return new Vector(this.lastOutputData.vector.x, -1 * this.lastOutputData.vector.y);
    }
}

const htmlFile = require('../../assets/inputAreas.html');
let rootElement: HTMLElement;

PreloadingStartedEvent.subscribe(() => {
    Preloading.renderPartial(htmlFile, onDomReady);
});

export function onDomReady() {
    rootElement = document.getElementById('inputAreas');
    // TODO an actual UI system should take care of appropriate layering
    // Move the overlays under the game UI
    rootElement.remove();
    document.body.insertBefore(rootElement, HUD.getRootElement());
}
