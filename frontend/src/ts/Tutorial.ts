'use strict';

import * as Preloading from './Preloading';
import * as Events from './Events';
import {deg2rad, isFunction, dateDiff, dateDiffUnit} from './Utils';
import {BerryhunterApi} from './backend/BerryhunterApi';

const LOCAL_STORAGE_KEY = 'tutorialCompleted';


// Ginos Vorschlag: Alle Tutorials als (animierte) Icons
// zb Movement = WASD nacheinander jeweils gedrückt

const stages = [{
    markupId: 'movement',
    showUntil: 'controls.movement',
}, {
    markupId: 'rotate',
    showUntil: 'controls.rotate'
}, {
    markupId: 'action',
    showUntil: 'controls.action'
}, {
    markupId: 'yield',
    pointTowards: 'Tree', // nearest gameplay object of type
    showUntil: 'inventory.add',
    eventFilter: function (payload) {
        return payload.itemName === 'Wood';
    }
}, {
    markupId: 'craft',
    pointTowards: deg2rad(225), // direction
    showUntil: 'inventory.add',
    eventFilter: function (payload) {
        return payload.itemName === 'WoodClub';
    }
}, {
    markupId: 'equip',
    pointTowards: deg2rad(110), // direction
    showUntil: 'character.equipItem',
    eventFilter: function (payload) {
        return payload.item.name === 'WoodClub';
    }
}, {
    markupId: 'fire',
    pointTowards: deg2rad(225), // direction
    showUntil: 'inventory.add',
    eventFilter: function (payload) {
        return payload.itemName === 'Campfire';
    }
}, {
    markupId: 'placing',
    showUntil: 'controls.action',
    eventFilter: function (payload) {
        if (payload.item.name !== 'Campfire') {
            return false;
        }
        return payload.actionType = BerryhunterApi.ActionType.PlaceItem;
    }
}, {
    markupId: 'eating',
    showUntil: 'controls.action',
    eventFilter: function (payload) {
        if (payload.item.name !== 'Berry') {
            return false;
        }
        return payload.actionType = BerryhunterApi.ActionType.ConsumeItem;
    }

}, {
    markupId: 'finish',
    showUntil: 'timeout.5000',
}];

let currentStage = 0;
let rootElement;

function showNextStep() {
    currentStage++;
    if (stages.length <= currentStage) {
        // Last step was shown
        localStorage.setItem(LOCAL_STORAGE_KEY, String(Date.now()));
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

    if (stage.showUntil.startsWith('timeout.')) {
        setTimeout(eventHandler, stage.showUntil.split('.')[1]);
    } else {
        Events.on(stage.showUntil, eventHandler);
    }
}

Preloading.registerPartial('partials/tutorial.html')
    .then(() => {
        rootElement = document.getElementById('tutorial');
        rootElement.addEventListener('transitionend', function (event) {
            event.target.classList.remove('done');
            showNextStep();
        });
    });


Events.on('game.playing', function () {
    currentStage = -1;

    let lastCompleted: any = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lastCompleted !== null) {
        lastCompleted = parseInt(lastCompleted, 10);
        // more than 14 days difference?
        if (dateDiff(Date.now(), lastCompleted, dateDiffUnit.days) > 14) {
            showNextStep();
        } else {
            // Set the tutorial as completed for today, to only show tutorials after inactivity
            localStorage.setItem(LOCAL_STORAGE_KEY, String(Date.now()));
        }
    } else {
        // Tutorial was never completed yet
        showNextStep();
    }
});

Events.on('game.death', function () {
    // Reset all tutorial elements on death
    let elements = rootElement.getElementsByClassName('tutorialStep');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active');
        elements[i].classList.remove('done');
    }
});