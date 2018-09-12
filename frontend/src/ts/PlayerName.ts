'use strict';

import * as NameGenerator from './NameGenerator';
import * as Backend from './backend/Backend';


const MAX_LENGTH = 20;

export function get() {
    let playerName = {
        name: localStorage.getItem('playerName'),
        suggestion: NameGenerator.generate(),
        fromStorage: true,
    };
    if (playerName.name === null) {
        playerName.fromStorage = false;
    }

    return playerName;
}

export function set(name) {
    localStorage.setItem('playerName', name);
}

export function remove() {
    localStorage.removeItem('playerName');
}

export function prepareForm(formElement, inputElement) {
    inputElement.setAttribute('maxlength', this.MAX_LENGTH);
    formElement.addEventListener('submit', onSubmit.bind(this, inputElement));
}

export function fillInput(inputElement) {
    let playerName = this.get();
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


function onSubmit(inputElement, event) {
    event.preventDefault();

    let name = inputElement.value;
    if (!name) {
        name = inputElement.getAttribute('placeholder');
        this.remove();
    } else {
        // Only save the name if its not generated
        this.set(name);
    }
    name = name.substr(0, this.MAX_LENGTH);


    Backend.sendJoin({
        playerName: name
    });
}

