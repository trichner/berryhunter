import '../assets/tutorial.less';
import * as Preloading from '../../core/logic/Preloading';
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
} from '../../core/logic/Events';
import {deg2rad, isDefined, isFunction} from '../../common/logic/Utils';
import {BerryhunterApi} from '../../backend/logic/BerryhunterApi';
import {Account} from "../../accounts/logic/Account";
import {integer, radians} from "../../common/logic/Types";


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
            if (payload.item !== null &&
                payload.item.name !== 'Campfire'
            ) {
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
        // Account.reset('tutorialActivated');
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

Preloading.renderPartial(require('../assets/tutorial.html'), () => {
    rootElement = document.getElementById('tutorial');
    rootElement.addEventListener('transitionend', function (event) {
        event.target.classList.remove('done');
        showNextStep();
    });
});

let tutorialToggle: HTMLInputElement;

StartScreenDomReadyEvent.subscribe(() => {
    tutorialToggle = document.getElementById('tutorialToggle') as HTMLInputElement;
    tutorialToggle.addEventListener('change', () => {
        Account.tutorialActivated = tutorialToggle.checked;
    });

    updateTutorialToggle();
});

function updateTutorialToggle() {
    let activated = Account.tutorialActivated;
    if (activated === null) { // No decision made yet
        activated = Account.tutorialCompleted === null; // Activate if not yet completed
    }
    tutorialToggle.checked = activated;
}

PlayerCreatedEvent.subscribe(() => {
    currentStage = -1;

    Account.tutorialActivated = tutorialToggle.checked;
    if (tutorialToggle.checked) {
        showNextStep();
    }
});

BeforeDeathEvent.subscribe(() => {
    updateTutorialToggle();

    // Reset all tutorial elements on death
    let elements = rootElement.getElementsByClassName('tutorialStep');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active');
        elements[i].classList.remove('done');
    }
});
