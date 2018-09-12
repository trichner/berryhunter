'use strict';

import * as PlayerName from '../../PlayerName';
import {isDefined, preventInputPropagation} from '../../Utils';
import * as Events from '../../Events';
import * as DetectBrowser from 'detect-browser';


let _progress = 0;
let loadingBar = null;

export let htmlFile = 'partials/startScreen.html';
export let isDomReady = false;
export let playerNameInput = null;

let rootElement;
let chromeWarning;

export function onDomReady() {
    rootElement = document.getElementById('startScreen');

    preventInputPropagation(rootElement);

    playerNameInput = rootElement
        .getElementsByClassName('playerNameInput').item(0);
    rootElement.getElementsByClassName('playerNameSubmit').item(0).disabled = false;

    loadingBar = document.getElementById('loadingBar');

    isDomReady = true;

    let startForm = document.getElementById('startForm');
    PlayerName.prepareForm(startForm, playerNameInput);
    PlayerName.fillInput(playerNameInput);

    // re-set progress to ensure the loading bar is synced.
    progress(_progress);

    chromeWarning = document.getElementById('chromeWarning');

    let browser = DetectBrowser.detect();
    if (browser.name !== 'chrome') {
        chromeWarning.classList.remove('hidden');
        startForm.classList.add('hidden');
        document.getElementById('continueAnywayButton').addEventListener('click', (event) => {
            event.preventDefault();
            chromeWarning.classList.add('hidden');
            startForm.classList.remove('hidden');
        });
    }

    Events.triggerOneTime('startScreen.domReady', rootElement)
}

export function show() {
    rootElement.classList.remove('hidden');
}

export function hide() {
    rootElement.classList.add('hidden');
}

export function progress(value) {
    if (isDefined(value)) {
        setProgress(value);
    } else {
        return getProgress();
    }
}

function setProgress(value) {
    // Prevent the progress from going backwards
    if (value <= _progress) {
        return;
    }
    _progress = value;
    if (isDomReady) {
        loadingBar.style.width = (_progress * 100) + '%';
        if (_progress >= 1) {
            Events.on('firstGameStateRendered', () => {
                rootElement.classList.remove('loading');
                rootElement.classList.add('finished');
                rootElement.getElementsByClassName('playerNameSubmit').item(0).value = "Play";
            })
        }
    }
}

function getProgress() {
    return progress;
}
