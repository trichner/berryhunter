'use strict';

import {isFunction} from './Utils';
import * as UserInterface from './userInterface/UserInterface';
import * as Console from './Console';
import {BackendValidTokenEvent, BeforeDeathEvent} from './Events';
import {IGame} from "./interfaces/IGame";
import {IBackend} from "./interfaces/IBackend";
import {ChatMessage} from "./backend/messages/outgoing/ChatMessage";

let Game: IGame = null;
let Backend: IBackend = null;
let hasValidToken: boolean = false;

export const KEYS = [
    13 // ENTER key
];

let rootElement: HTMLElement;
let inputElement: HTMLInputElement;

export function setup(game: IGame, backend) {
    Game = game;
    Backend = backend;

    rootElement = UserInterface.getChat();
    inputElement = rootElement.querySelector('#chatInput');

    inputElement.addEventListener('keydown', function (event) {
        // Not perfect, as it captures all shortcuts etc.
        // but necessary to prevent movement while typing
        event.stopPropagation();

        if (KEYS.indexOf(event.which) !== -1) {
            let message = inputElement.textContent;
            if (hasValidToken && message.startsWith('#')) {
                Console.run(message.substring(1), false);
            } else {
                new ChatMessage(message).send();
                Game.player.character.say(message);
            }

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

BackendValidTokenEvent.subscribe(() => {
    hasValidToken = true;
});

BeforeDeathEvent.subscribe(() => {
    hide();
});
