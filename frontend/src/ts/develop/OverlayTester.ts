'use strict';

import {BasicConfig as Constants} from '../../config/Basic';
import {random} from "../Utils";
import {VitalSigns} from "../VitalSigns";
import {GraphicsConfig} from "../../config/Graphics";
import * as Console from '../Console';

let currentValue = GraphicsConfig.vitalSigns.overlayThreshold;
let intervalID: number = 0;
let updateVitalSignsFn;

export function start() {
    Console.run('GOD');
    // Simulate server
    intervalID = window.setInterval(
        update,
        Constants.SERVER_TICKRATE
    );

    import('../Game').then(Game => {

        updateVitalSignsFn = Game.player.vitalSigns.updateFromBackend.bind(Game.player.vitalSigns);
        Game.player.vitalSigns.updateFromBackend = () => {};
    });
}

export function stop() {
    clearInterval(intervalID);
    intervalID = 0;
    import('../Game').then(Game => {

        Game.player.vitalSigns.updateFromBackend = updateVitalSignsFn;
    });
}

export function toggle() {
    if (intervalID == 0) {
        start();
    } else {
        stop();
    }
}

export function hideAll() {
    stop();

    import('../Game').then(Game => {
        Game.player.vitalSigns.hideIndicator('hunger');
        Game.player.vitalSigns.hideIndicator('coldness');
    });
}

function update() {
    // import('../Game').then(Game => {
    let backendValues = {};

    ['satiety', 'bodyHeat'].forEach((vitalSign) => {
        backendValues[vitalSign] = VitalSigns.MAXIMUM_VALUES[vitalSign] * currentValue;
    });

    updateVitalSignsFn(backendValues);
    // currentValue -= random(0.001, 0.01);
    currentValue -= 0.001;
    if (currentValue < 0) {
        currentValue = GraphicsConfig.vitalSigns.overlayThreshold + 0.001;
    }
    // });
}
