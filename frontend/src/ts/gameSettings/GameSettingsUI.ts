import * as Preloading from '../Preloading';
import {GameSettings} from './GameSettings';
import {DevelopSetupEvent} from '../Events';
import {parseInt} from 'lodash';
import {resetFocus} from '../Utils';

const gameSettings = GameSettings.get();
let rootElement: HTMLElement;
let panelElement: HTMLElement;
let showButton: HTMLElement;

Preloading.renderPartial(require('./assets/settings.partial.html'), onDomReady);


function onDomReady() {
    rootElement = document.getElementById('gameSettings') as HTMLElement;

    setupButtons();
    setupPanel();

}

function setupButtons() {
    showButton = rootElement.querySelector('#gameSettingsButton');
    showButton.addEventListener('click', (event) => {
        event.preventDefault();

        show();
    });

    rootElement.querySelector('#closeGameSettings').addEventListener('click', (event) => {
        event.preventDefault();

        hide();
    });
}

function setupPanel() {
    panelElement = rootElement.querySelector('#gameSettingsPanel');

    [
        'click',
        'pointerdown',
        'pointerup',
        'mousedown',
        'mouseup',
        'mousemove',
        'touchstart',
        'touchend',
        'keyup',
        'keydown']
        .forEach((eventName) => {
            panelElement.addEventListener(eventName, (event) => {
                event.stopPropagation();
            });
        });

    setupAudioSettings();
}

function setupAudioSettings() {
    const muteAllToggle = rootElement.querySelector('#muteAllToggle') as HTMLInputElement;
    muteAllToggle.checked = gameSettings.audio.masterMuted;
    muteAllToggle.addEventListener('change', () => {
        gameSettings.audio.masterMuted = muteAllToggle.checked;
    });

    const masterVolumeInput = rootElement.querySelector('#masterVolume') as HTMLInputElement;
    const masterVolumeValueElement = rootElement.querySelector('#masterVolume + .value') as HTMLElement;
    masterVolumeInput.value = String(gameSettings.audio.masterVolume);
    masterVolumeValueElement.textContent = masterVolumeInput.value;
    masterVolumeInput.addEventListener('input', () => {
        gameSettings.audio.masterVolume = parseInt(masterVolumeInput.value);
        masterVolumeValueElement.textContent = masterVolumeInput.value;
    });
}

function show() {
    showButton.classList.add('hidden');
    panelElement.classList.remove('hidden');
}

function hide() {
    showButton.classList.remove('hidden');
    panelElement.classList.add('hidden');

    resetFocus();
}

DevelopSetupEvent.subscribe(() => {
    rootElement.classList.add('develop-offset');
});