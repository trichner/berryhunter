'use strict';

import * as Preloading from './Preloading';
import * as Events from './Events';
import {clearNode, getUrlParameter, isFunction, preventInputPropagation, resetFocus} from './Utils';

let Backend = null;
Events.on('backend.setup', backend => {
    Backend = backend;
});

export const KEY_CODE = 'Backquote';

const FILTERED_KEYCODES = [
    '^'.charCodeAt(0),
    'â'.charCodeAt(0),
    'ô'.charCodeAt(0),
    'û'.charCodeAt(0),
    'Â'.charCodeAt(0),
    'Ô'.charCodeAt(0),
    'Û'.charCodeAt(0),
];

const MAX_HISTORY_LENGTH = 15;

const LOCAL_COMMAND_HANDLERS: { [key: string]: (parameters: string[]) => void } = {
    'define': handleDefine
};

let token = getUrlParameter('token');
let domReady = false;
let _isOpen = false;
let rootElement: HTMLElement;
let commandInput: HTMLInputElement;
let historyElement: HTMLElement;
let startTime: number;
let scheduledMessages = [];
let commandHistory: string[];
let consoleSuggestions: HTMLDataListElement;
let macros: { [key: string]: string[] } = {};

Events.on('backend.validToken', function () {
    // Only load the console once the token was confirmed as valid
    Preloading.renderPartial(require('../partials/console.html'), onDomReady);
});

function onDomReady() {
    rootElement = document.getElementById('console');
    commandInput = document.getElementById('console_command') as HTMLInputElement;
    historyElement = document.getElementById('console_history');
    consoleSuggestions = document.getElementById('console_suggestions') as HTMLDataListElement;

    commandInput.addEventListener('keypress', function (event) {
        if (FILTERED_KEYCODES.indexOf(event.which) !== -1) {
            event.preventDefault();
        }
    });

    preventInputPropagation(commandInput, KEY_CODE);

    document.getElementById('console').addEventListener('submit', function (event) {
        event.preventDefault();

        onCommand(commandInput.value, false);
        commandInput.value = '';
    });

    startTime = Date.now();
    domReady = true;

    // Log messages that were scheduled
    scheduledMessages.forEach(log);

    commandHistory = readCommandHistory();
    clearSuggestions();
    populateSuggestions(commandHistory);

    macros = readMacros();
    createMacroHandlers(macros);
}

function populateSuggestions(suggestions: string[]) {
    suggestions.forEach(suggestion => {
        let suggestionOption = document.createElement('option') as HTMLOptionElement;
        suggestionOption.value = suggestion;
        // Insert new options on top to have to last command first
        consoleSuggestions.insertBefore(suggestionOption, consoleSuggestions.firstChild);
    });
}

function clearSuggestions() {
    clearNode(consoleSuggestions)
}

export function run(command: string, isAutoCommand: boolean = true) {
    onCommand(command, isAutoCommand);
}

function onCommand(command: string, isAutoCommand: boolean) {
    // Ignore empty commands
    if (!command) {
        return;
    }

    command = command.trim();

    if (command.length === 0) {
        return;
    }

    if (!isAutoCommand) {
        storeInHistory(command);
    }
    log(command);
    if (token) {
        if (!tryRunLocally(command)) {
            Backend.sendCommand({
                command: command,
                token: token,
            });
        }
    } else {
        if (!_isOpen) {
            show();
        }
        log('ERROR: URL parameter "token" is not defined!');
    }
}

function tryRunLocally(command: string): boolean {

    let tokens = command.split(' ');

    let handler = LOCAL_COMMAND_HANDLERS[tokens[0]];
    if (isFunction(handler)) {
        handler(tokens.slice(1));
        return true;
    }

    return false;
}

function handleDefine(parameters: string[]): void {
    if (parameters.length < 2) {
        log('ERROR: Missing parameters. define macro syntax is `define macroName command1; command2; ...`');
        return;
    }
    let macroName = parameters[0];
    let commands = parameters
        .slice(1) // second parameter and following
        .join(' ') // restore original input
        .split(';') // separate commands by semicolon
        .filter(command => command) // remove empty
        .map(command => command.trim()) // trim all commands
        .filter(command => command); // remove possible new empties

    if (commands.length === 0) {
        log('ERROR: Missing commands. define macro syntax is `define macroName command1; command2; ...`');
        return;
    }


    if (macros.hasOwnProperty(macroName)) {
        log('Updated macro "' + macroName + '" to ' + commands);
    } else {
        log('Defined macro "' + macroName + '" to ' + commands);
    }

    macros[macroName] = commands;
    createMacroHandler(macroName);

    writeMacros(macros);
}

function handleMacro(macroName: string) {
    let commands: string[] = macros[macroName];
    commands.forEach(command => {
        // It's an autoCommand as we don't want parts of a macro
        // to appear in the history (the macro itself will be recorded)
        onCommand(command, true);
    });
}

function createMacroHandlers(macros: { [key: string]: string[] }) {
    for (const macroName in macros) {
        createMacroHandler(macroName);
    }
}

function createMacroHandler(macroName: string) {
    LOCAL_COMMAND_HANDLERS[macroName] = () => {
        handleMacro(macroName);
    };
}

function milliseconds2string(ms) {
    return (ms / 1000).toFixed(2);
}

function storeInHistory(command: string) {
    let listNeedsRebuild = false;

    // Limit the lists length
    if (commandHistory.length > MAX_HISTORY_LENGTH) {
        commandHistory.shift();
        listNeedsRebuild = true;
    }

    // Remove duplicates from list
    let indexOf = commandHistory.indexOf(command);
    if (indexOf !== -1) {
        commandHistory.splice(indexOf, 1);
        listNeedsRebuild = true;
    }

    commandHistory.push(command);

    if (listNeedsRebuild) {
        clearSuggestions();
        populateSuggestions(commandHistory);
    } else {
        populateSuggestions([command]);
    }

    writeCommandHistory(commandHistory);
}

function readCommandHistory(): string[] {
    let storedItem = localStorage.getItem('consoleHistory');
    if (storedItem === null) {
        return [];
    }

    return JSON.parse(storedItem);
}

function writeCommandHistory(history: string[]) {
    localStorage.setItem('consoleHistory', JSON.stringify(history));
}

function readMacros(): { [key: string]: string[] } {
    let storedMacros = JSON.parse(localStorage.getItem('consoleMacros'));
    if (storedMacros === null) {
        return {};
    }

    return storedMacros;
}

function writeMacros(macros: { [key: string]: string[] }) {
    localStorage.setItem('consoleMacros', JSON.stringify(macros));
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
