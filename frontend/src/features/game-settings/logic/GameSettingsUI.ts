import '../assets/gameSettings.less';
import * as Preloading from '../../core/logic/Preloading';
import {GameSettings} from './GameSettings';
import {DevelopSetupEvent} from '../../core/logic/Events';
import {parseInt} from 'lodash';
import {preventShortcutPropagation, resetFocus} from '../../common/logic/Utils';

const gameSettings = GameSettings.get();
let rootElement: HTMLElement;
let panelElement: HTMLElement;
let showButton: HTMLElement;

Preloading.renderPartial(require('../assets/settings.partial.html'), onDomReady);


function onDomReady() {
    rootElement = document.getElementById('gameSettings') as HTMLElement;

    setupButtons();
    setupPanel();

}

function setupButtons() {
    showButton = rootElement.querySelector('#gameSettingsButton');
    preventShortcutPropagation(showButton);
    showButton.addEventListener('click', (event) => {
        event.preventDefault();

        show();
    });

    const closeButton = rootElement.querySelector('#closeGameSettings');
    preventShortcutPropagation(closeButton);
    closeButton.addEventListener('click', (event) => {
        event.preventDefault();

        hide();
    });
}

function setupPanel() {
    panelElement = rootElement.querySelector('#gameSettingsPanel');

    panelElement
        .querySelectorAll('input')
        .forEach(preventShortcutPropagation);

    setupAudioSettings();
}

function setupAudioSettings() {
    setupToggle(
        '#muteAllToggle',
        () => gameSettings.audio.masterMuted,
        value => (gameSettings.audio.masterMuted = value),
    );

    setupRange(
        '#masterVolume',
        '#masterVolume + .value',
        () => gameSettings.audio.masterVolume,
        value => (gameSettings.audio.masterVolume = value),
    );

    setupRange(
        '#musicVolume',
        '#musicVolume + .value',
        () => gameSettings.audio.musicVolume,
        value => (gameSettings.audio.musicVolume = value),
    );

    setupToggle(
        '#backgroundAudioToggle',
        () => gameSettings.audio.enableBackgroundAudio,
        value => (gameSettings.audio.enableBackgroundAudio = value),
    );
}


function setupToggle(
    selector: string,
    getValue: () => boolean,
    setValue: (value: boolean) => void,
) {
    const toggle = rootElement.querySelector(selector) as HTMLInputElement;
    toggle.checked = getValue();
    toggle.addEventListener('change', () => {
        setValue(toggle.checked);
    });
}

function setupRange(
    selector: string,
    valueDisplaySelector: string,
    getValue: () => number,
    setValue: (value: number) => void,
) {
    const input = rootElement.querySelector(selector) as HTMLInputElement;
    const display = rootElement.querySelector(valueDisplaySelector) as HTMLElement;
    const updateUI = (value: number) => {
        input.value = String(value);
        display.textContent = (value * 100).toFixed(0);
    };

    updateUI(getValue());
    input.addEventListener('input', () => {
        const val = parseFloat(input.value);
        setValue(val);
        updateUI(val);
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
