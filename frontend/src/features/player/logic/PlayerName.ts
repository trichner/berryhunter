import * as NameGenerator from './NameGenerator';
import {Account} from "../../accounts/logic/Account";
import {IBackend} from "../../backend/logic/IBackend";
import {JoinMessage} from "../../backend/logic/messages/outgoing/JoinMessage";
import {BackendSetupEvent, GameJoinEvent, screen} from "../../core/logic/Events";

let Backend: IBackend = null;
BackendSetupEvent.subscribe((backend: IBackend) => {
    Backend = backend;
});

const MAX_LENGTH = 20;

function get() {
    let playerName = {
        name: Account.playerName,
        suggestion: NameGenerator.generate(),
        fromStorage: true,
    };
    if (playerName.name === null) {
        playerName.fromStorage = false;
    }

    return playerName;
}

function set(name) {
    Account.playerName = name;
}

function remove() {
    Account.playerName = null;
}

export function prepareForm(formElement, inputElement, screen: screen) {
    inputElement.setAttribute('maxlength', MAX_LENGTH);
    formElement.addEventListener('submit', (event) => {
        onSubmit(event, inputElement, screen);
    });
}

export function fillInput(inputElement) {
    let playerName = get();
    inputElement.setAttribute('placeholder', playerName.suggestion);
    if (playerName.fromStorage) {
        inputElement.value = playerName.name;
    }

    inputElement.focus();
}

/**
 *
 * @return an integer between 0 (included) and max (excluded)
 */
export function hash(name, max) {
    let unicodeSum = 0;
    for (let i = 0; i < name.length; i++) {
        unicodeSum += name.charCodeAt(i);
    }

    return unicodeSum % max;
}


function onSubmit(event, inputElement, screen: screen) {
    event.preventDefault();

    let name: string = inputElement.value;
    if (!name) {
        name = inputElement.getAttribute('placeholder');
        remove();
    } else {
        // Only save the name if its not generated
        set(name);
    }
    name = name.substr(0, MAX_LENGTH);


    new JoinMessage(name).send();
    GameJoinEvent.trigger(screen);
}
