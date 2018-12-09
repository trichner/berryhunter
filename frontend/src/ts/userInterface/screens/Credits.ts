import {createStartScreenPanel} from "./ScreenUtil";

const html: string = require('./credits.html');

let startScreenElement: HTMLElement;
let rootElement: HTMLElement;
let closeButton: HTMLElement;


export function setup() {
    rootElement = document.getElementById('creditsContainer');
    createStartScreenPanel(
        rootElement,
        html,
        'closeCredits',
        'creditsVisible',
        '#credits');
}

