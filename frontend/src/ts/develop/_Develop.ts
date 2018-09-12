'use strict';

import * as Game from '../Game';
import * as AABBs from './AABBs';
import * as Fps from './Fps';
import * as Preloading from '../Preloading';
import {getUrlParameter, htmlToElement, isDefined, isUndefined, rad2deg} from '../Utils';
import * as MapEditor from '../mapEditor/_MapEditor';
import * as Console from '../Console';
import {ItemType} from '../items/ItemType';
import {BasicConfig as Constants} from '../../config/Basic';
import {Items} from '../items/Items';
import {BerryhunterApi} from '../backend/BerryhunterApi';


let active = false;
export let settings = {
    showAABBs: false,
    cameraBoundaries: true,
    elementColor: 0xFF0000,
    linewidth: 2,
    /**
     * Aus wievielen Werten wird maximal der Durchschnitt und die
     * mittlere absolute Abweichung gebildet
     */
    measurementSampleRate: 20,
};

export function isActive() {
    return active;
}


const logs = {
    fps: [],
    serverTickRate: [],
    clientTickRate: [],
};

export function setup() {
    active = true;
    AABBs.setup();

    setupDevelopPanel();
}

export function setupDevelopPanel() {
    Preloading.registerPartial('partials/developPanel.html')
        .then(function () {
            let developPanel = document.getElementById('developPanel');
            // Capture inputs to prevent game actions while acting in develop panel
            ['click', 'pointerdown', 'mousedown', 'keyup', 'keydown']
                .forEach(function (eventName) {
                    developPanel.addEventListener(eventName, function (event) {
                        event.stopPropagation();
                    })
                });

            setupToggleButtons();

            setupItemAdding();

            setupTickSampler();

            setupChart();
        });
}

export function setupToggleButtons() {
    let buttons = document.querySelectorAll('#developPanel .toggleButton');

    /**
     *
     * @param {Element} button
     * @param {boolean} state
     */
    function setButtonState(button, state) {

        if (state) {
            button.querySelector('span.state').textContent = 'On';
            button.classList.add('on');
            button.classList.remove('off');
        } else {
            button.querySelector('span.state').textContent = 'Off';
            button.classList.add('off');
            button.classList.remove('on');
        }
    }

    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i];
        setButtonState(button, settings[button.getAttribute('data-setting')]);
        button.addEventListener('click', function () {
            let setting = button.getAttribute('data-setting');
            let newValue = !settings[setting];
            settings[setting] = newValue;
            setButtonState(button, newValue);
            onSettingToggle(setting, newValue);
        });
    }
}

export function setupItemAdding() {
    let select = document.getElementById('develop_itemSelect');

    let optionGroups = {};
    for (let itemType in ItemType) {
        optionGroups[itemType] = htmlToElement('<optgroup label="' + itemType + '"></optgroup>');
        select.appendChild(optionGroups[itemType]);
    }

    for (let item in Items) {
        if (!Items.hasOwnProperty(item)) {
            continue;
        }
        if (!Items[item].icon) {
            continue;
        }
        if (!Items[item].icon.file) {
            continue;
        }
        if (Items[item].graphic && !Items[item].graphic.file) {
            continue;
        }

        optionGroups[Items[item].type].appendChild(htmlToElement('<option value="' + item + '">' + item + '</option>'));
    }

    let itemAdd = document.getElementById('develop_itemAdd');
    let itemCount = document.getElementById('develop_itemCount') as HTMLInputElement;
    itemCount.addEventListener('input', function () {
        itemCount.style.width = Math.max(1.6, (1 + (itemCount.value.length * 0.6))) + 'em';
        let step;
        if (parseInt(itemCount.value, 10) < 10) {
            step = 1;
        } else {
            step = Math.pow(10, itemCount.value.length - 2) * 5;
        }
        itemCount.setAttribute('step', step);
        itemCount.setAttribute('min', step); // otherwise steps will be 11, 16, ...

        itemAdd.classList.toggle('plural', itemCount.value !== '1');
    });
    itemCount.style.width = (1 + (itemCount.value.length * 0.6)) + 'em';


    itemAdd.addEventListener('click', function () {
        let item = (document.getElementById('develop_itemSelect') as HTMLInputElement).value;
        let count = itemCount.value;
        if (MapEditor.isActive()) {
            Game.player.inventory.addItem(
                Items[item],
                parseInt(count),
            );
        } else {
            Console.run('GIVE ' + item + ' ' + count);
        }
    });
}

function onSettingToggle(setting, newValue) {
    switch (setting) {
        case 'showAABBs':
            Object.values(Game.map.objects)
                .forEach(function (gameObject: AABBs.hasAABB) {
                    if (newValue) {
                        gameObject.showAABB();
                        if (isDefined(Game.player)) {
                            Game.player.character.showAABB();
                        }
                    } else {
                        gameObject.hideAABB();
                        if (isDefined(Game.player)) {
                            Game.player.character.hideAABB();
                        }
                    }
                });
            Game.render();
    }
}

let showNextGameState = false;

function setupTickSampler() {
    let showServerTick = document.getElementById('develop_showServerTick');

    if (MapEditor.isActive()) {
        showServerTick.style.display = 'none';
        return;
    }

    showServerTick.addEventListener('click', function () {
        let serverTickPopup = document.getElementById('serverTickPopup');
        serverTickPopup.classList.remove('hidden');
        showNextGameState = true;
    });

    let closeServerTick = document.getElementById('develop_closeServerTickPopup');
    closeServerTick.addEventListener('click', function () {
        let serverTickPopup = document.getElementById('serverTickPopup');
        serverTickPopup.classList.add('hidden');
    });
}

function setupChart() {

}

export function afterSetup() {
    Fps.setup();
}

export function logValue(name, value) {
    document.getElementById('develop_' + name).textContent = value;
}

export function logSampledValue(name, logArray, value, unit?) {
    if (isUndefined(unit)) {
        unit = '';
    } else {
        unit = ' ' + unit;
    }
    logArray.push(value);
    if (logArray.length > settings.measurementSampleRate) {
        let average = 0;
        let min = 10000;
        let max = 0;
        logArray.forEach(function (value) {
            average += value;
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
        });
        average /= logArray.length;

        let abweichung = 0;
        logArray.forEach(function (value) {
            abweichung += Math.abs(value - average);
        });
        abweichung /= logArray.length;

        let output = min.toFixed(0);
        output += '/';
        output += average.toFixed(0);
        output += '/';
        output += max.toFixed(0);
        output += unit;
        logValue(name, output);

        logArray.length = 0;
    }
}

export function logFPS(fps) {
    logSampledValue('fps', logs.fps, fps);
}

export function logServerMessage(message, messageType, timeSinceLast) {
    console.info('Received ' + messageType + ' message.');

    logSampledValue('serverTickRate', logs.serverTickRate, timeSinceLast, 'ms');
    if (showNextGameState) {
        document.getElementById('serverTickOutput').textContent = JSON.stringify(message, null, 2);
        showNextGameState = false;
    }
}

export function logServerTick(gameState, timeSinceLast) {
    logValue('serverTick', gameState.tick);
    logSampledValue('serverTickRate', logs.serverTickRate, timeSinceLast, 'ms');
    if (showNextGameState) {
        document.getElementById('serverTickOutput').textContent = JSON.stringify(gameState, serverTickReplacer, 2);
        showNextGameState = false;
    }
}

export function logTimeOfDay(formattedTimeOfDay) {
    document.getElementById('develop_timeOfDay').textContent = formattedTimeOfDay;
}

export function serverTickReplacer(key, value) {
    switch (key) {
        case 'item':
        case 'type':
            return value.name;
        case 'equipment':
            return value.map(entry => {
                return entry.name;
            });
        case 'x':
        case 'y':
        case 'LowerX':
        case 'LowerY':
        case 'UpperX':
        case 'UpperY':
            return Math.round(value * 100) / 100;
        case 'rotation':
            return rad2deg(value) + 'deg';
    }

    return value;
}

export function logClientTick(inputObj) {
    logValue('clientTick', inputObj.tick);

    let movementStr = '';
    if (isDefined(inputObj.movement)) {
        switch (inputObj.movement.x) {
            case 1:
                switch (inputObj.movement.y) {
                    case 1:
                        movementStr = '\u2198️'; // ↘
                        break;
                    case 0:
                        movementStr = '\u27A1'; // ➡
                        break;
                    case -1:
                        movementStr = '\u2197'; // ↗
                        break;
                }
                break;
            case 0:
                switch (inputObj.movement.y) {
                    case 1:
                        movementStr = '\u2b07'; // ⬇
                        break;
                    case 0:
                        // movementStr = '\u26d4'; // ---
                        break;
                    case -1:
                        movementStr = '\u2b06'; // ⬆
                        break;
                }
                break;
            case -1:
                switch (inputObj.movement.y) {
                    case 1:
                        movementStr = '\u2199'; // ↙
                        break;
                    case 0:
                        movementStr = '\u2b05'; // ⬅
                        break;
                    case -1:
                        movementStr = '\u2196'; // ↖
                        break;
                }
                break;
        }
    } else {
        // movementStr = '\u26d4'; // ---
    }

    document.getElementById('develop_input_movement').textContent = movementStr;

    if (isDefined(inputObj.rotation)) {
        document.getElementById('develop_input_rotation').textContent = (inputObj.rotation * (180 / Math.PI)).toFixed(0);
    } else {
        document.getElementById('develop_input_rotation').textContent = '';
    }

    if (isDefined(inputObj.action)) {
        if (inputObj.action.item === null) {
            document.getElementById('develop_input_action_item').textContent = 'None';
        } else {
            document.getElementById('develop_input_action_item').textContent = inputObj.action.item.name;
        }
        let actionType;
        let actionTypeId = ' [' + inputObj.action.actionType + ']';
        switch (inputObj.action.actionType) {
            case BerryhunterApi.ActionType.Primary:
                actionType = 'Primary' + actionTypeId + ' with';
                break;
            case BerryhunterApi.ActionType.CraftItem:
                actionType = 'Craft' + actionTypeId;
                break;
            case BerryhunterApi.ActionType.EquipItem:
                actionType = 'Equip' + actionTypeId;
                break;
            case BerryhunterApi.ActionType.UnequipItem:
                actionType = 'Unequip' + actionTypeId;
                break;
            case BerryhunterApi.ActionType.DropItem:
                actionType = 'Drop' + actionTypeId;
                break;
            case BerryhunterApi.ActionType.PlaceItem:
                actionType = 'Place' + actionTypeId;
                break;
            case BerryhunterApi.ActionType.ConsumeItem:
                actionType = 'Consume' + actionTypeId;
                break;
            default:
                actionType = 'Unmapped' + actionTypeId;
                break;
        }
        document.getElementById('develop_input_action_type').textContent = actionType;
    } else {
        document.getElementById('develop_input_action_item').textContent = '';
        document.getElementById('develop_input_action_type').textContent = '';
    }
}

export function logClientTickRate(timeSinceLast) {
    logSampledValue('clientTickRate', logs.clientTickRate, timeSinceLast, 'ms');
}

export function logWebsocketStatus(text, status) {
    let webSocketCell = document.getElementById('develop_webSocket');
    if (webSocketCell === null) {
        return;
    }
    webSocketCell.textContent = text;
    webSocketCell.classList.remove('neutral');
    webSocketCell.classList.remove('good');
    webSocketCell.classList.remove('bad');

    webSocketCell.classList.add(status);
}

if (getUrlParameter(Constants.MODE_PARAMETERS.DEVELOPMENT)) {
    setup();
}
