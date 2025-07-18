import '../assets/HUD.less';
import * as Preloading from '../../../core/logic/Preloading';
import {BasicConfig as Constants} from '../../../../client-data/BasicConfig';
import {clearNode, isUndefined, playCssAnimation} from '../../../common/logic/Utils';
import {ClickableIcon} from './ClickableIcon';
import {ClickableCountableIcon} from './ClickableCountableIcon';
import {VitalSignBar} from '../../../vital-signs/logic/VitalSignBar';
import {IGame} from "../../../core/logic/IGame";
import {UserInteraceDomReadyEvent} from '../../../core/logic/Events';
import {VitalSign} from '../../../vital-signs/logic/VitalSigns';

let Game: IGame = null;

let rootElement: HTMLElement;
let cycleIcon = require('../assets/cycle-icon.svg?raw');

let craftingElement: HTMLElement;
let craftableItemTemplate: HTMLElement;
let inventorySlots: ClickableCountableIcon[];

let vitalSignsBars: { [key: string]: VitalSignBar };

Preloading.renderPartial(require('../assets/HUD.html'), () => {
    rootElement = document.getElementById('gameUI');
    UserInteraceDomReadyEvent.trigger(rootElement);
});

export function setup(game) {
    Game = game;

    setupCrafting();

    setupInventory();

    setupVitalSigns();
}

function setupCrafting() {
    craftingElement = document.getElementById('crafting');
    craftableItemTemplate = craftingElement.removeChild(craftingElement.querySelector('.craftableItem'));
}

function setupInventory() {
    let inventoryElement = document.getElementById('inventory');
    let inventorySlot = document.querySelector('#inventory > .inventorySlot');

    inventorySlots = new Array(Constants.INVENTORY_SLOTS);
    setupInventorySlot(inventorySlot, 0);

    for (let i = 1; i < Constants.INVENTORY_SLOTS; ++i) {
        let inventorySlotCopy = inventorySlot.cloneNode(true);
        inventoryElement.appendChild(inventorySlotCopy);
        setupInventorySlot(inventorySlotCopy, i);
    }
}

function setupInventorySlot(inventorySlot, index) {
    inventorySlots[index] = new ClickableCountableIcon(
        inventorySlot
            .getElementsByClassName('clickableItem')
            .item(0));
    let autoFeedToggle = inventorySlot.getElementsByClassName('autoFeedToggle').item(0);
    autoFeedToggle.innerHTML = cycleIcon;
}

function setupVitalSigns() {
    vitalSignsBars = {
        health: new VitalSignBar(document.getElementById('healthBar'), VitalSign.health),
        satiety: new VitalSignBar(document.getElementById('satietyBar'), VitalSign.satiety),
        bodyHeat: new VitalSignBar(document.getElementById('bodyHeatBar'), VitalSign.bodyHeat),
    };
}

export function show() {
    rootElement.classList.remove('hidden');
    Game.domElement.focus();
    Game.miniMap.start();
}

export function hide() {
    rootElement.classList.add('hidden');
    Game.miniMap.stop();
}

export function getRootElement() {
    return rootElement;
}

const CRAFTABLES_NEW_LINES = [
    [],
    [1],
    [2],
    [2, 3],
    [2, 4],
    [3, 5],
    [3, 5, 6],
    [3, 5, 7],
    [3, 6, 8],
    [4, 7, 9],
    [4, 7, 9, 10],
    [4, 7, 9, 11],
    [4, 7, 10, 12],
    [4, 8, 11, 13],
    [5, 9, 12, 14],
    [5, 9, 12, 14, 15],
    [5, 9, 12, 14, 16],
    [5, 9, 12, 15, 17],
    [5, 9, 13, 16, 18],
    [5, 10, 14, 17, 19],
    [6, 11, 15, 18, 20]
];

export function displayAvailableCrafts(availableCrafts, onLeftClick) {
    clearNode(craftingElement);

    if (availableCrafts.length === 0) {
        return;
    }

    let newLines = CRAFTABLES_NEW_LINES[availableCrafts.length - 1];

    availableCrafts.forEach(function (recipe, index) {
        if (isUndefined(recipe.clickableIcon)) {
            let craftableItemElement = craftableItemTemplate.cloneNode(true) as HTMLElement;

            let clickableIcon = new ClickableIcon(craftableItemElement);
            clickableIcon.onLeftClick = function (event) {
                onLeftClick.call(clickableIcon, event, recipe);
            };
            clickableIcon.setIconGraphic(recipe.item.icon.file, true);
            clickableIcon.addSubIcons(recipe.materials);

            recipe.clickableIcon = clickableIcon;
        }
        recipe.clickableIcon.setHinted(!recipe.isCraftable);
        recipe.clickableIcon.appendTo(craftingElement);
        if (newLines.indexOf(index) === -1) {
            recipe.clickableIcon.domElement.classList.remove('newLine');
        } else {
            recipe.clickableIcon.domElement.classList.add('newLine');
        }
    });
}

export function flashInventory() {
    let inventoryElement = document.getElementById('inventory');
    playCssAnimation(inventoryElement, 'overfilled');
}

export function getInventorySlot(slotIndex: number): ClickableCountableIcon {
    return inventorySlots[slotIndex];
}

export function getVitalSignBar(vitalSign: string): VitalSignBar {
    return vitalSignsBars[vitalSign];
}

export function getMinimapContainer(): Element {
    return document.querySelector('#minimap > .wrapper');
}

export function getChat(): HTMLElement {
    return document.getElementById('chat');
}

export function getScoreboard(): HTMLElement {
    return document.getElementById('scoreboard');
}
