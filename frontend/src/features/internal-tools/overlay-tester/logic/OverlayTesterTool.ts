import {BasicConfig as Constants} from '../../../../client-data/BasicConfig';
import {isFunction} from "../../../../old-structure/Utils";
import {VitalSigns} from "../../../vital-signs/logic/VitalSigns";
import {GraphicsConfig} from "../../../../client-data/Graphics";
import * as Console from '../../console/logic/Console';

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

    import('../../../core/logic/Game').then(Game => {
        let game = Game.instance;
        updateVitalSignsFn = game.player.vitalSigns.updateFromBackend.bind(game.player.vitalSigns);
        game.player.vitalSigns.updateFromBackend = () => {
        };
    });
}

export function stop() {
    clearInterval(intervalID);
    intervalID = 0;

    if (isFunction(updateVitalSignsFn)) {
        import('../../../core/logic/Game').then(Game => {
            Game.instance.player.vitalSigns.updateFromBackend = updateVitalSignsFn;
        });
    }
}

export function toggle() {
    if (intervalID == 0) {
        stop();
        start();
    } else {
        stop();
    }
}

export function hideAll() {
    showPercentage(100);
}

export function showPercentage(percent) {
    stop();

    import('../../../core/logic/Game').then(Game => {
        let game = Game.instance;
        updateVitalSignsFn = game.player.vitalSigns.updateFromBackend.bind(game.player.vitalSigns);
        game.player.vitalSigns.updateFromBackend = () => {
        };

        let backendValues = {};
        ['satiety', 'bodyHeat'].forEach((vitalSign) => {
            backendValues[vitalSign] = VitalSigns.MAXIMUM_VALUES[vitalSign] * percent / 100;
        });

        updateVitalSignsFn(backendValues);
    });
}

function update() {
    let backendValues = {};

    ['satiety', 'bodyHeat'].forEach((vitalSign) => {
        backendValues[vitalSign] = VitalSigns.MAXIMUM_VALUES[vitalSign] * currentValue;
    });

    updateVitalSignsFn(backendValues);
    currentValue -= 0.001;
    if (currentValue < 0) {
        currentValue = GraphicsConfig.vitalSigns.overlayThreshold + 0.001;
    }
}

function handleConsoleCommands(parameters: string[]): void {
    let subCommand = 'toggle';

    if (parameters.length >= 1) {
        subCommand = parameters[0].toLowerCase();
    }

    switch (subCommand) {
        case 'toggle':
            toggle();
            break;
        case 'hide':
            hideAll();
            break;
        default:
            if (subCommand.match(/^\d+$/)) {
                let percent = parseInt(subCommand);
                showPercentage(percent);
                break;
            }
            Console.logError('Unknown overlay command "' + subCommand + '"');
    }
}

Console.registerLocalCommandHandler('overlays', handleConsoleCommands);
