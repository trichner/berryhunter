import '../assets/credits.less';
import {createStartScreenPanel} from "../../logic/UserInterface";
import {htmlModuleToString} from "../../../common/logic/Utils";

const html: string = require('../assets/credits.html');

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
