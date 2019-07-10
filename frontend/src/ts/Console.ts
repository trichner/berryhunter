'use strict';

import * as Preloading from './Preloading';
import * as Events from './Events';
import {getUrlParameter, preventInputPropagation, resetFocus} from './Utils';

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
let hasValidToken = false;
let domReady = false;
let _isOpen = false;
let rootElement;
let commandInput;
let historyElement;
let startTime;
let scheduledMessages = [];

Events.on('backend.validToken', function () {
    // Only load the console once the token was confirmed as valid
    Preloading.renderPartial(require('../partials/console.html'), onDomReady);
    hasValidToken = true;
});

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

        run(commandInput.value);
        commandInput.value = '';
    });

    startTime = Date.now();
    domReady = true;

    // Log messages that were scheduled
    scheduledMessages.forEach(log);
}

export function run(command, force: boolean = false) {
    onCommand(command, force);
}

function onCommand(command, force: boolean) {
    log(command);

    if (hasValidToken || force) {
        if (handleCommandLocally(command)) {
            return;
        }

        import('./backend/Backend').then(Backend => {
            Backend.sendCommand({
                command: command,
                token: token,
            });
        });
    } else {
        if (!_isOpen) {
            show();
        }
        if (!token) {
            log('ERROR: URL parameter "token" is not defined!');
        } else {
            log('ERROR: Defined token is not valid!');
        }
    }
}

function handleCommandLocally(command: string) {
    if (!command) return;

    let args: string[] = command.split(' ');

    if (args.length < 1) return;

    let cmd: string = args[0].toUpperCase();

    switch (cmd) {
        case 'OVERLAYS':
            import('./develop/OverlayTester').then(OverlayTester => OverlayTester.toggle());
            return true;
        case 'HIDEOL':
            import('./develop/OverlayTester').then(OverlayTester => OverlayTester.hideAll());

    }
    return false;
}

function milliseconds2string(ms) {
    return (ms / 1000).toFixed(2);
}

export function log(message) {
    if (!domReady) {
        scheduledMessages.push(message);
        return;
    }

    let prefix = milliseconds2string(Date.now() - startTime);
    prefix = '[' + prefix + 's] ';

    if (historyElement.innerHTML.length > 0) {
        historyElement.innerHTML += '<br />';
    }
    historyElement.innerHTML += prefix;
    historyElement.innerHTML += message;
    historyElement.scrollTop = historyElement.scrollHeight;
}

export function show() {
    if (!domReady) {
        return;
    }

    rootElement.classList.add('showing');
    commandInput.focus();
    _isOpen = true;
}

export function hide() {
    if (!domReady) {
        return;
    }

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
