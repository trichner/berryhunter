import * as Preloading from './Preloading';
import {BackendValidTokenEvent, PongReceivedEvent} from './Events';
import {clearNode, isFunction, preventInputPropagation, resetFocus} from './Utils';
import {CommandMessage} from './backend/messages/outgoing/CommandMessage';
import {WebParameters} from './WebParameters';
import {BasicConfig} from '../game-data/BasicConfig';

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
    'define': handleDefine,
    'list': handleList,
    'crash': handleCrash,
};

const hasToken = WebParameters.get().has(BasicConfig.VALUE_PARAMETERS.TOKEN);
const token = WebParameters.get().getString(BasicConfig.VALUE_PARAMETERS.TOKEN, '');
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

BackendValidTokenEvent.subscribe( () => {
    log('Server accepted our token');

    // Only load the console once the token was confirmed as valid
    Preloading.renderPartial(require('../partials/console.html'), onDomReady);
});

PongReceivedEvent.subscribe(() => {
    log('Server replied: PONG');
});


function onDomReady() {
    rootElement = document.getElementById('console');
    commandInput = document.getElementById('console_command') as HTMLInputElement;
    historyElement = document.getElementById('console_history');
    consoleSuggestions = document.getElementById('console_suggestions') as HTMLDataListElement;

    commandInput.addEventListener('keypress', function (event) {
        if (FILTERED_KEYCODES.includes(event.which)) {
            event.preventDefault();
        }
    });

    preventInputPropagation(commandInput, {propagated: KEY_CODE});

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

    WebParameters.get().tryGetStringArray(BasicConfig.VALUE_PARAMETERS.START_COMMANDS, (commands => {
        log('Running ' + commands.length + ' start commands:');
        commands.forEach((command, index) => {
            setTimeout(() => run(command), index * 100);
        });
    }));
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
    clearNode(consoleSuggestions);
}

export function registerLocalCommandHandler(command: string, handler: (parameters: string[]) => void) {
    LOCAL_COMMAND_HANDLERS[command] = handler;
}

/**
 * @param command
 * @param isAutoCommand hides the command from the history
 */
export function run(command: string, isAutoCommand: boolean = true) {
    onCommand(command, isAutoCommand);
}

/**
 * @param command
 * @param isAutoCommand hides the command from the history
 */
function onCommand(command: string, isAutoCommand: boolean) {
    // Ignore empty commands
    if (!command) {
        return;
    }

    command = command.trim();

    if (command.length === 0) {
        return;
    }

    if (command.startsWith('#')) {
        command = command.substring(1);
    }

    if (!isAutoCommand) {
        storeInHistory(command);
    }
    log('#' + command);
    if (hasToken) {
        if (!tryRunLocally(command)) {
            new CommandMessage(command, token).send();
        }
    } else {
        if (!_isOpen) {
            show();
        }
        logError('URL parameter "token" is not defined!');
    }
}

function tryRunLocally(command: string): boolean {

    let tokens = command.split(' ');
    tokens[0] = tokens[0].toLowerCase();

    let handler = LOCAL_COMMAND_HANDLERS[tokens[0]];
    if (isFunction(handler)) {
        handler(tokens.slice(1));
        return true;
    }

    return false;
}

function unifyCommandCase(command: string): string {
    let tokens = command.split(' ');
    tokens[0] = tokens[0].toLowerCase();
    return tokens.join(' ');
}

function handleDefine(parameters: string[]): void {
    if (parameters.length < 2) {
        logError('Missing parameters. define macro syntax is `define macroName command1; command2; ...`');
        return;
    }
    let macroName = parameters[0];
    let commands = parameters
        .slice(1) // second parameter and following
        .join(' ') // restore original input
        .split(';') // separate commands by semicolon
        .filter(command => command) // remove empty
        .map(command => command.trim()) // trim all commands
        .filter(command => command) // remove possible new empties
        .map(command => unifyCommandCase(command)); // all basic commands in lower case

    if (commands.length === 0) {
        logError('Missing commands. define macro syntax is `define macroName command1; command2; ...`');
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

function handleList(parameters: string[]) {

    if (parameters.length === 0) {
        logError('Missing parameter.');
    }

    let subCommand = parameters[0].toLowerCase();
    switch (subCommand) {
        case 'macro':
        case 'macros':
            handleListMacros();
            break;
    }
}

function handleListMacros() {
    for (const [macroName, commands] of Object.entries(macros)) {
        log(macroName + ' => ' + commands);
    }
}

function handleCrash() {
    // Crashing the server in two simple steps
    // 1: Kill yourself
    onCommand('kill', true);
    // 2: close connection by navigating away / reloading the page
    // window.location.reload();
    window.location.assign('about:blank');
}

function milliseconds2string(ms: number) {
    return (ms / 1000).toFixed(2);
}

function storeInHistory(command: string) {
    let listNeedsRebuild = false;

    // Limit the lists length
    if (commandHistory.length > MAX_HISTORY_LENGTH) {
        commandHistory.shift();
        listNeedsRebuild = true;
    }

    // Adjust command to be lower case
    command = unifyCommandCase(command);

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

export function logWarning(message: string) {
    log('WARNING: ' + message);
}

export function logError(message: string) {
    log('ERROR: ' + message);
}

export function log(message: string) {
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
