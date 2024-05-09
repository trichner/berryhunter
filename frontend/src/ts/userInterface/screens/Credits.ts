import {createStartScreenPanel} from "./ScreenUtil";
import {htmlModuleToString} from "../../Utils";

const html: string = require('./credits.html');

let startScreenElement: HTMLElement;
let rootElement: HTMLElement;
let closeButton: HTMLElement;


export function setup() {
    rootElement = document.getElementById('creditsContainer');
    createStartScreenPanel(
        rootElement,
        htmlModuleToString(html),
        'closeCredits',
        'creditsVisible',
        '#credits');
}
