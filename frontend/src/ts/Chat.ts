'use strict';

import {isFunction} from './Utils';
import * as UserInterface from './userInterface/UserInterface';

let Game = null;
let Backend = null;

export const KEYS = [
    13 // ENTER key
];

let rootElement;
let inputElement;

export function setup(game, backend) {
    Game = game;
    Backend = backend;

    rootElement = UserInterface.getChat();
    inputElement = rootElement.querySelector('#chatInput');

    inputElement.addEventListener('keydown', function (event) {
        // Not perfect, as it captures all shortcuts etc.
        // but necessary to prevent movement while typing
        event.stopPropagation();

        if (KEYS.indexOf(event.which) !== -1) {
            Backend.sendChatMessage({
                message: inputElement.textContent
            });
            Game.player.character.say(inputElement.textContent);
            inputElement.textContent = '';
            hide();
            Game.domElement.focus();
            event.preventDefault();
            event.stopPropagation();
        }
    });
}

export function showMessage(entityId, message) {
    let gameObject = Game.map.getObject(entityId);
    if (isFunction(gameObject.say)) {
        gameObject.say(message);
    }
}

let _isOpen = false;

export function show() {
    this.rootElement.classList.remove('hidden');
    this.inputElement.focus();
    _isOpen = true;
}

export function hide() {
    this.rootElement.classList.add('hidden');
    _isOpen = false;
}

export function isOpen() {
    return _isOpen;
}
