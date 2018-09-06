'use strict';

import * as Preloading from './Preloading';
import {getUrlParameter, preventInputPropagation, resetFocus} from './Utils';
import * as Backend from './backend/Backend';


export const KEYS = [
    220, // ^ for german keyboards
    192, // ` for US keyboards
];

const FILTERED_KEYCODES = [
    '^'.charCodeAt(0),
    'â'.charCodeAt(0),
    'ô'.charCodeAt(0),
    'û'.charCodeAt(0),
    'Â'.charCodeAt(0),
    'Ô'.charCodeAt(0),
    'Û'.charCodeAt(0),
];

let token = getUrlParameter('token');
let _isOpen = false;
let rootElement;
let commandInput;
let historyElement;
let startTime;

function onDomReady() {
    rootElement = document.getElementById('console');
    commandInput = document.getElementById('console_command');
    historyElement = document.getElementById('console_history');

    commandInput.addEventListener('keypress', function (event) {
        if (FILTERED_KEYCODES.indexOf(event.which) !== -1) {
            event.preventDefault();
        }
    });

    preventInputPropagation(commandInput, KEYS);

    document.getElementById('console').addEventListener('submit', function (event) {
        event.preventDefault();

        onCommand(commandInput.value);
        commandInput.value = '';
    });

    startTime = Date.now();
}

function onCommand(command) {
    log(command);
    if (token) {
        Backend.sendCommand({
            command: command,
            token: token,
        });
    } else {
        if (!_isOpen) {
            show();
        }
        log('ERROR: URL parameter "token" is not defined!');
    }
}

export function run(command) {
    onCommand(command);
}

function milliseconds2string(ms) {
    return (ms / 1000).toFixed(2);
}

export function log(string) {
    let prefix = milliseconds2string(Date.now() - startTime);
    prefix = '[' + prefix + 's] ';

    if (historyElement.innerHTML.length > 0) {
        historyElement.innerHTML += '<br />';
    }
    historyElement.innerHTML += prefix;
    historyElement.innerHTML += string;
    historyElement.scrollTop = historyElement.scrollHeight;
}

export function show() {
    rootElement.classList.add('showing');
    commandInput.focus();
    _isOpen = true;
}

export function hide() {
    rootElement.classList.remove('showing');
    resetFocus();
    _isOpen = false;
}

export function toggle() {
    if (_isOpen) {
        hide();
    } else {
        show();
    }
}

export function isOpen() {
    return _isOpen;
}

Preloading.registerPartial('partials/console.html')
    .then(() => {
        onDomReady();
    });
