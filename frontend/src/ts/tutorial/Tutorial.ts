import * as Preloading from '../Preloading';
import {
    BeforeDeathEvent,
    CharacterEquippedItemEvent,
    ControlsActionEvent,
    ControlsMovementEvent,
    ControlsRotateEvent,
    IEvent,
    InventoryAddEvent,
    PlayerCreatedEvent,
    StartScreenDomReadyEvent
} from '../Events';
import {deg2rad, isDefined, isFunction} from '../Utils';
import {BerryhunterApi} from '../backend/BerryhunterApi';
import {Account} from "../Account";
import {integer, radians} from "../interfaces/Types";


// Ginos Vorschlag: Alle Tutorials als (animierte) Icons
// zb Movement = WASD nacheinander jeweils gedrückt

interface IStage {
    markupId: string,
    showUntil?: IEvent,
    timeout?: integer,
    pointTowards?: string | radians,
    eventFilter?: (any) => boolean
}

const stages: IStage[] = [
    {
        markupId: 'movement',
        showUntil: ControlsMovementEvent
    }, {
        markupId: 'rotate',
        showUntil: ControlsRotateEvent
    }, {
        markupId: 'action',
        showUntil: ControlsActionEvent
    },
    {
        markupId: 'yield',
        pointTowards: 'Tree', // nearest gameplay object of type
        showUntil: InventoryAddEvent,
        eventFilter: function (payload) {
            return payload.itemName === 'Wood';
        }
    }, {
        markupId: 'craft',
        pointTowards: deg2rad(225), // direction
        showUntil: InventoryAddEvent,
        eventFilter: function (payload) {
            return payload.itemName === 'WoodClub';
        }
    }, {
        markupId: 'equip',
        pointTowards: deg2rad(110), // direction
        showUntil: CharacterEquippedItemEvent,
        eventFilter: function (payload) {
            return payload.item.name === 'WoodClub';
        }
    }, {
        markupId: 'fire',
        pointTowards: deg2rad(225), // direction
        showUntil: InventoryAddEvent,
        eventFilter: function (payload) {
            return payload.itemName === 'Campfire';
        }
    }, {
        markupId: 'placing',
        showUntil: ControlsActionEvent,
        eventFilter: function (payload) {
            if (payload.item.name !== 'Campfire') {
                return false;
            }
            return payload.actionType === BerryhunterApi.ActionType.PlaceItem;
        }
    }, {
        markupId: 'eating',
        showUntil: ControlsActionEvent,
        eventFilter: function (payload) {
            if (payload.item.name !== 'Berry') {
                return false;
            }
            return payload.actionType === BerryhunterApi.ActionType.ConsumeItem;
        }
    }, {
        markupId: 'finish',
        timeout: 5000,
    }
];

let currentStage = 0;
let rootElement;

function showNextStep() {
    currentStage++;
    if (stages.length <= currentStage) {
        // Last step was shown
        Account.tutorialCompleted = Date.now();
        return;
    }

    let stage = stages[currentStage];
    let tutorialStepElement = document.getElementById('tutorial_' + stage.markupId);
    tutorialStepElement.classList.add('active');

    let eventHandler = function (payload) {
        if (isFunction(stage.eventFilter) && !stage.eventFilter(payload)) {
            return false;
        }

        tutorialStepElement.classList.remove('active');
        tutorialStepElement.classList.add('done');

        return true;
    };

    if (isDefined(stage.timeout)) {
        setTimeout(eventHandler, stage.timeout);
    } else if (isDefined(stage.showUntil)) {
        stage.showUntil.subscribe(eventHandler);
    } else {
        throw 'Either "showUntil" or "timeout" needs to be defined on stage #' + currentStage + ' "' + stage.markupId + '"';
    }
}

Preloading.renderPartial(require('./tutorial.html'), () => {
    rootElement = document.getElementById('tutorial');
    rootElement.addEventListener('transitionend', function (event) {
        event.target.classList.remove('done');
        showNextStep();
    });
});

let tutorialToggle: HTMLInputElement;

StartScreenDomReadyEvent.subscribe(() => {
    tutorialToggle = document.getElementById('tutorialToggle') as HTMLInputElement;
    tutorialToggle.checked = Account.tutorialCompleted === null;
});

PlayerCreatedEvent.subscribe(() => {
    currentStage = -1;

    if (tutorialToggle.checked) {
        showNextStep();
    }
});

BeforeDeathEvent.subscribe(() => {
    tutorialToggle.checked = Account.tutorialCompleted === null;
    // Reset all tutorial elements on death
    let elements = rootElement.getElementsByClassName('tutorialStep');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active');
        elements[i].classList.remove('done');
    }
});
