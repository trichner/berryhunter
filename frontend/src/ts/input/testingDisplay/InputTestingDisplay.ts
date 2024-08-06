import * as Preloading from '../../Preloading';
import {UserInteraceDomReadyEvent} from '../../Events';

let rootElement: HTMLElement;

Preloading.renderPartial(require('./inputTestingDisplay.html'), () => {
    rootElement = document.getElementById('inputTestingDisplay');
});
