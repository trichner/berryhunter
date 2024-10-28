import {Items} from '../../items/logic/Items';
import * as Equipment from '../../items/logic/Equipment';
import * as Preloading from '../../core/logic/Preloading';
import {
    deg2rad,
    htmlToElement,
    isUndefined,
    preventShortcutPropagation,
    randomFrom,
    randomInt,
    roundToNearest,
    sortStrings,
} from '../../../old-structure/Utils';
import {BasicConfig as Constants} from '../../../client-data/BasicConfig';
import {GroundTextureType, groundTextureTypes} from './GroundTextureTypes';
import * as GroundTextureManager from './GroundTextureManager';
import {saveAs} from 'file-saver';
import * as Console from '../../internal-tools/console/logic/Console';
import {GameState, IGame} from "../../../old-structure/interfaces/IGame";
import {BackendValidTokenEvent, CharacterEquippedItemEvent, GamePlayingEvent, PrerenderEvent} from '../../core/logic/Events';
import {QueryParameters} from '../../internal-tools/logic/QueryParameters';

let Game: IGame = null;

let active = false;

export function isActive() {
    return active;
}

GamePlayingEvent.subscribe((game: IGame) => {
    Game = game;
    if (!active) {
        return;
    }

    Console.log('GroundTexturePanel activated - try to activate GODMODE now.');
    Console.run('GOD');
    Console.log('GroundTexturePanel activated - try to grant MysticWand');
    Console.run('give MysticWand');

    PrerenderEvent.subscribe( () => {
        if (Game.state === GameState.PLAYING) {
            let position = Game.player.character.getPosition();
            currentXLabel.textContent = position.x.toFixed(0);
            currentYLabel.textContent = position.y.toFixed(0);

            let x = Game.player.camera.getMapX(Game.inputManager.activePointer.x);
            let y = Game.player.camera.getMapY(Game.inputManager.activePointer.y);
            xLabel.textContent = x.toFixed(0);
            yLabel.textContent = y.toFixed(0);
        }
    }, this);

    Game.domElement.addEventListener('click', function (event) {
        if (Game.player.character.getEquippedItem(Equipment.EquipmentSlot.HAND) === Items.MysticWand) {
            let x = Game.player.camera.getMapX(event.pageX);
            let y = Game.player.camera.getMapY(event.pageY);
            placeTexture({x, y});
        }
    });
});

CharacterEquippedItemEvent.subscribe((payload) => {
    if (!active) return;

    if (payload.item.name !== 'MysticWand') return;

    Game.player.character.say('You can now click the ground anywhere to place a texture!');
})

let typeSelect;
let xLabel;
let yLabel;
let currentXLabel;
let currentYLabel;
let controlsContainer;
let minSizeLabel;
let maxSizeLabel;
let sizeInput;
let rotationInput;
let flippedRadios;
let randomizePropertiesToggle;
let stackingRadios;
let textureCount;
let randomizeNextToggle;
let placeButton;
let undoButton;

let types: GroundTextureType[];
let groundTextureType: GroundTextureType;

function setupPanel() {
    let groundTexturePanel = document.getElementById('groundTexturePanel');
    let groundTexturePopup = document.getElementById('groundTexturePopup');
    // Capture inputs to prevent game actions while acting in develop panel
    groundTexturePanel
        .querySelectorAll('input, button, a, select')
        .forEach(preventShortcutPropagation);
    groundTexturePopup
        .querySelectorAll('input, button, a, select')
        .forEach(preventShortcutPropagation);

    typeSelect = document.getElementById('groundTexture_type');
    xLabel = document.getElementById('groundTexture_x');
    yLabel = document.getElementById('groundTexture_y');
    currentXLabel = document.getElementById('groundTexture_currentX');
    currentYLabel = document.getElementById('groundTexture_currentY');
    controlsContainer = document.getElementById('groundTexture_controls');
    minSizeLabel = document.getElementById('groundTexture_minSize');
    maxSizeLabel = document.getElementById('groundTexture_maxSize');
    sizeInput = document.getElementById('groundTexture_size');
    rotationInput = document.getElementById('groundTexture_rotation');
    flippedRadios = document.getElementsByName('groundTexture_flipped');
    randomizePropertiesToggle = document.getElementById('groundTexture_randomizeProperties');
    stackingRadios = document.getElementsByName('groundTexture_stacking');
    textureCount = document.getElementById('groundTexture_textureCount');
    textureCount.textContent = GroundTextureManager.getTextureCount();
    randomizeNextToggle = document.getElementById('groundTexture_randomizeNext');
    placeButton = document.getElementById('groundTexture_placeButton');
    undoButton = document.getElementById('groundTexture_undoButton');


    types = sortStrings(Object.values(groundTextureTypes), 'displayName');
    types.map(function (type) {
        return htmlToElement('<option value="' + type.name + '">' + type.displayName + '</option>');
    }).forEach(function (option) {
        typeSelect.appendChild(option);
    });
    typeSelect.addEventListener('change', function () {
        groundTextureType = groundTextureTypes[typeSelect.value];

        randomizeInputs();

        controlsContainer.classList.remove('hidden');
    });

    rotationInput.addEventListener('input', function () {
        let value = parseInt(this.value);
        if (value < 0) {
            this.value = 360 + (value % 360)
        } else if (value >= 360) {
            this.value = value % 360;
        }
    });

    // Properties are by default randomized
    randomizePropertiesToggle.checked = true;

    placeButton.addEventListener('click', function (event) {
        event.preventDefault();

        placeTexture(Game.player.character.getPosition());
    }.bind(this));

    undoButton.addEventListener('click', function (event) {
        event.preventDefault();

        GroundTextureManager.removeLatestTexture();
        textureCount.textContent = GroundTextureManager.getTextureCount();

        undoButton.classList.add('hidden');
    }.bind(this));

    let popup = document.getElementById('groundTexturePopup');
    let output = document.getElementById('groundTextureOutput');
    document.getElementById('groundTexture_showPopup').addEventListener('click', function (event) {
        event.preventDefault();

        popup.classList.remove('hidden');

        output.textContent = GroundTextureManager.getTexturesAsJSON();
    });

    document.getElementById('groundTexture_closePopup').addEventListener('click', function (event) {
        event.preventDefault();

        popup.classList.add('hidden');
    });

    document.getElementById('groundTexture_download').addEventListener('click', function (event) {
        event.preventDefault();

        let blob = new Blob([GroundTextureManager.getTexturesAsJSON()], {type: 'application/json;charset=utf-8'});
        saveAs(blob, 'ground-textures.json');
    });
}

export function placeTexture(position) {
    if (isUndefined(groundTextureType)) {
        Game.player.character.say('No ground texture type selected');
        return;
    }

    if (Game.state !== GameState.PLAYING) {
        console.warn('Ground textures can only be placed while being ingame.');
        return;
    }

    let flipped: 'none' | 'horizontal' | 'vertical'  = 'none';
    flippedRadios.forEach(function (element) {
        if (element.checked) {
            flipped = element.value;
        }
    });

    let stacking: 'bottom' | 'top' = 'top';
    stackingRadios.forEach(function (radio) {
        if (radio.checked) {
            stacking = radio.value;
        }
    });

    GroundTextureManager.placeTexture({
        type: groundTextureType,
        x: Math.round(position.x),
        y: Math.round(position.y),
        size: parseInt(sizeInput.value),
        rotation: deg2rad(rotationInput.value),
        flipped,
        stacking
    });

    textureCount.textContent = GroundTextureManager.getTextureCount();

    randomizeInputs.call(this);

    undoButton.classList.remove('hidden');
}

function randomizeInputs() {
    if (randomizeNextToggle.checked) {
        const type = randomFrom(types);
        typeSelect.value = type.name;
        groundTextureType = type;
    }


    minSizeLabel.textContent = groundTextureType.minSize;
    maxSizeLabel.textContent = groundTextureType.maxSize;
    sizeInput.setAttribute('min', String(groundTextureType.minSize));
    sizeInput.setAttribute('max', String(groundTextureType.maxSize));
    if (randomizePropertiesToggle.checked) {
        sizeInput.value = roundToNearest(
            randomInt(groundTextureType.minSize, groundTextureType.maxSize + 1),
            5);
    } else {
        if (sizeInput.value > groundTextureType.maxSize) {
            sizeInput.value = groundTextureType.maxSize;
        } else if (sizeInput.value < groundTextureType.minSize) {
            sizeInput.value = groundTextureType.minSize;
        }
    }

    if (groundTextureType.hasOwnProperty('rotation')) {
        rotationInput.value = groundTextureType.rotation || 0;
    } else if (randomizePropertiesToggle.checked) {
        rotationInput.value = randomInt(0, 360);
    }

    if (groundTextureType.hasOwnProperty('flipVertical') && !groundTextureType.flipVertical) {
        if (groundTextureType.hasOwnProperty('flipHorizontal') && !groundTextureType.flipHorizontal) {
            flippedRadios.item(0).checked = true;
        } else {
            if (randomizePropertiesToggle.checked) {
                flippedRadios.item(randomInt(0, 2)).checked = true;
            } else if (flippedRadios.item(2).checked) {
                // If the vertical flip is active right now, switch to no flipping
                flippedRadios.item(0).checked = true;
            }
        }
    } else if (groundTextureType.hasOwnProperty('flipHorizontal') && !groundTextureType.flipHorizontal) {
        if (randomizePropertiesToggle.checked) {

            let random = randomInt(0, 2);
            if (random === 1) {
                random = 2;
            }
            flippedRadios.item(random).checked = true;
        } else if (flippedRadios.item(1).checked) {
            // If the horizontal flip is active right now, switch to no flipping
            flippedRadios.item(0).checked = true;
        }
    } else if (randomizePropertiesToggle.checked) {
        flippedRadios.item(randomInt(0, 3)).checked = true;
    }
}

BackendValidTokenEvent.subscribe( function () {
    if (QueryParameters.get().has(Constants.MODE_PARAMETERS.GROUND_TEXTURE_EDITOR)) {
        active = true;

        Preloading.renderPartial(require('../assets/groundTexturePanel.html'), setupPanel);
    }
});
