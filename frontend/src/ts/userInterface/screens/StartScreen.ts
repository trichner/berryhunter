'use strict';

import * as PlayerName from '../../PlayerName';
import {isDefined, preventInputPropagation} from '../../Utils';
import * as Events from '../../Events';
import {DetectBrowser} from '../../../../vendor/detect-browser-3.0.0';


let _progress = 0;
let loadingBar = null;

export let htmlFile = 'partials/startScreen.html';
export let isDomReady = false;
export let playerNameInput = null;

export function onDomReady() {
    this.rootElement = document.getElementById('startScreen');

    preventInputPropagation(this.rootElement);

    this.playerNameInput = this.rootElement
        .getElementsByClassName('playerNameInput').item(0);
    this.rootElement.getElementsByClassName('playerNameSubmit').item(0).disabled = false;

    loadingBar = document.getElementById('loadingBar');

    this.isDomReady = true;

    let startForm = document.getElementById('startForm');
    PlayerName.prepareForm(startForm, playerNameInput);
    PlayerName.fillInput(playerNameInput);

    // re-set progress to ensure the loading bar is synced.
    this.progress = _progress;

    this.chromeWarning = document.getElementById('chromeWarning');

    let browser = DetectBrowser.detect();
    if (browser.name !== 'chrome') {
        this.chromeWarning.classList.remove('hidden');
        startForm.classList.add('hidden');
        document.getElementById('continueAnywayButton').addEventListener('click', function (event) {
            event.preventDefault();
            this.chromeWarning.classList.add('hidden');
            startForm.classList.remove('hidden');
        }.bind(this));
    }

    Events.triggerOneTime('startScreen.domReady', this.rootElement)
}

export function show() {
    this.rootElement.classList.remove('hidden');
}

export function hide() {
    this.rootElement.classList.add('hidden');
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
    if (this.isDomReady) {
        loadingBar.style.width = (_progress * 100) + '%';
        if (_progress >= 1) {
            let self = this;
            Events.on('firstGameStateRendered', function () {
                self.rootElement.classList.remove('loading');
                self.rootElement.classList.add('finished');
                // let loadingScreenElement = document.getElementById('loadingScreen');
                // if (loadingScreenElement === null) {
                // 	// Element was already removed
                // 	return;
                // }
                self.rootElement.getElementsByClassName('playerNameSubmit').item(0).value = "Play";
            })

            // loadingScreenElement.classList.add('finished');
            //
            // loadingScreenElement.addEventListener('animationend', function () {
            // 	if (this.parentNode === null) {
            // 		// Element was already removed
            // 		return;
            // 	}
            // 	this.parentNode.removeChild(loadingScreenElement);
            // });
        }
    }
}

function getProgress() {
    return progress;
}
