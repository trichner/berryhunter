'use strict';

import * as PlayerName from '../../PlayerName';
import {isDefined, preventInputPropagation, smoothHoverAnimation} from '../../Utils';
import * as DetectBrowser from 'detect-browser';
import * as Preloading from '../../Preloading';
import * as Credits from './Credits';
import {
    FirstGameStateHandledEvent,
    BackendConnectionFailureEvent,
    PreloadingProgressedEvent,
    PreloadingStartedEvent,
    StartScreenDomReadyEvent
} from "../../Events";


let _progress = 0;
let loadingBar = null;

const htmlFile = require('./startScreen.html');
let isDomReady = false;
export let playerNameInput = null;

let rootElement: HTMLElement;
let chromeWarning;

PreloadingStartedEvent.subscribe(() => {
    Preloading.renderPartial(htmlFile, onDomReady);
});

export function onDomReady() {
    rootElement = document.getElementById('startScreen');

    preventInputPropagation(rootElement);

    playerNameInput = rootElement
        .getElementsByClassName('playerNameInput').item(0);
    let playerNameSubmit: HTMLInputElement = rootElement.querySelector('.playerNameSubmit');
    playerNameSubmit.disabled = false;

    loadingBar = document.getElementById('loadingBar');

    isDomReady = true;

    let startForm = document.getElementById('startForm');
    PlayerName.prepareForm(startForm, playerNameInput, 'start');
    PlayerName.fillInput(playerNameInput);

    // re-set progress to ensure the loading bar is synced.
    progress(_progress);

    chromeWarning = document.getElementById('chromeWarning');

    let browser = DetectBrowser.detect();
    const supportedBrowsers = ['chrome', 'firefox'];
    if (!supportedBrowsers.includes(browser.name)) {
        chromeWarning.classList.remove('hidden');
        startForm.classList.add('hidden');
        document.getElementById('continueAnywayButton').addEventListener('click', (event) => {
            event.preventDefault();
            chromeWarning.classList.add('hidden');
            startForm.classList.remove('hidden');
        });
    }

    rootElement.querySelectorAll('.socialLink').forEach(element => {
        smoothHoverAnimation(element, {animationDuration: 0.3});
    });

    smoothHoverAnimation(
        rootElement.querySelector('#betaStamp'),
        {animationDuration: 0.45});

    Credits.setup();

    StartScreenDomReadyEvent.trigger(rootElement);
}

export function show() {
    rootElement.classList.remove('hidden');
}

export function hide() {
    rootElement.classList.add('hidden');
}

PreloadingProgressedEvent.subscribe(setProgress);

export function progress(value: number) {
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
            FirstGameStateHandledEvent.subscribe(() => {
                rootElement.classList.remove('loading');
                rootElement.classList.add('finished');
                let playerNameSubmit: HTMLInputElement = rootElement.querySelector('.playerNameSubmit');
                playerNameSubmit.value = "Play";
            });
        }
    }
}

BackendConnectionFailureEvent.subscribe(() => {
    rootElement.classList.remove('loading');
    rootElement.classList.add('failure');
    let playerNameSubmit: HTMLInputElement = rootElement.querySelector('.playerNameSubmit');
    playerNameSubmit.value = "Couldn't connect";
});

function getProgress() {
    return progress;
}
