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

    inputElement.addEventListener('keydown', (event) => {
        // Not perfect, as it captures all shortcuts etc.
        // but necessary to prevent movement while typing
        event.stopPropagation();

        if (KEYS.indexOf(event.which) !== -1) {
            let message = inputElement.value;
            if (hasValidToken && message.startsWith('#')) {
                Console.run(message.substring(1), false);
            } else if (message.length > 0) {
                new ChatMessage(message).send();
                Game.player.character.say(message);
            }

            inputElement.value = '';
            hide();
            Game.domElement.focus();
            event.preventDefault();
            event.stopPropagation();
        }
    });

    inputElement.addEventListener('input', fitInputToContent);

    inputElement.addEventListener('blur', () => {
        hide();
        Game.domElement.focus();
    });
}

export function showMessage(entityId, message) {
    let gameObject = Game.map.getObject(entityId);
    if (isFunction(gameObject.say)) {
        gameObject.say(message);
    }
}

let _isOpen = false;

function fitInputToContent() {
    inputElement.style.removeProperty('height');
    // add 4% height to prevent accidental scrollbars
    inputElement.style.height = (inputElement.scrollHeight * 1.04) + 'px';
}

export function show() {
    fitInputToContent();
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
