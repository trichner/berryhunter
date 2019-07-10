'use strict';

import {isFunction} from './Utils';
import * as UserInterface from './userInterface/UserInterface';

let Game = null;

export const KEYS = [
    13 // ENTER key
];

let rootElement: HTMLElement;
let inputElement: HTMLInputElement;

export function setup(game) {
    Game = game;

    rootElement = UserInterface.getChat();
    inputElement = rootElement.querySelector('#chatInput');

    inputElement.addEventListener('keydown', function (event) {
        // Not perfect, as it captures all shortcuts etc.
        // but necessary to prevent movement while typing
        event.stopPropagation();

        if (KEYS.indexOf(event.which) !== -1) {
            import('./backend/Backend').then(Backend => {
                Backend.sendChatMessage({
                    message: inputElement.textContent
                });
                Game.player.character.say(inputElement.textContent);
                inputElement.textContent = '';
                hide();
                Game.domElement.focus();
            });
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
    rootElement.classList.remove('hidden');
    inputElement.focus();
    _isOpen = true;
}

export function hide() {
    rootElement.classList.add('hidden');
    _isOpen = false;
}

export function isOpen() {
    return _isOpen;
}
