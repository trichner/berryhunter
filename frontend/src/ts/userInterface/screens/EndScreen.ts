'use strict';

import * as Preloading from '../../Preloading';
import * as PlayerName from '../../PlayerName';
import * as Console from '../../Console';
import {preventInputPropagation} from '../../Utils';
import * as Events from '../../Events';
import * as DayCycle from '../../DayCycle';
import * as SnapshotFactory from '../../backend/SnapshotFactory';

let rootElement;
let playerNameInput;

function onDomReady() {
    rootElement = document.getElementById('endScreen');
    playerNameInput = rootElement.getElementsByClassName('playerNameInput').item(0);

    PlayerName.prepareForm(document.getElementById('endForm'), playerNameInput);

    preventInputPropagation(rootElement);

    this.rootElement.getElementsByClassName('playerForm').item(0)
        .addEventListener('animationend', function () {
            // As soon as the form is faded in, focus the input field
            playerNameInput.focus();
        });
}

Preloading.registerPartial('partials/endScreen.html')
    .then(() => {
        onDomReady();
    });

export function show() {
    PlayerName.fillInput(playerNameInput);
    Console.hide();

    this.rootElement.classList.add('showing');
}

export function hide() {
    this.rootElement.classList.remove('showing');
}

let joinedAtDayTime;
let joinedAtServerTick;

Events.on('game.playing', function () {
    joinedAtDayTime = DayCycle.isDay();
    joinedAtServerTick = SnapshotFactory.getLastGameState().tick;
});

Events.on('game.death', function () {
    let deathAtServerTick = SnapshotFactory.getLastGameState().tick;
    let daysSurvived = Math.floor(DayCycle.getDays(deathAtServerTick - joinedAtServerTick) * 2);

    function dayOrNight(isDay, count) {
        if (isDay) {
            if (count <= 1) {
                return 'day';
            } else {
                return 'days';
            }
        } else {
            if (count <= 1) {
                return 'night';
            } else {
                return 'nights';
            }
        }
    }

    let obituaryText = '';
    obituaryText += 'You survived ';

    if (daysSurvived < 1) {
        obituaryText += 'not even the ';
        obituaryText += dayOrNight(joinedAtDayTime, daysSurvived);
    } else {
        obituaryText += Math.ceil(daysSurvived / 2); // Round up to split an uneven numbers of days and
                                                     // nights to whatever time the player joined
        obituaryText += ' ';
        obituaryText += dayOrNight(joinedAtDayTime, Math.ceil(daysSurvived / 2));
    }

    if (daysSurvived > 1) {
        obituaryText += ' and ';
        obituaryText += Math.floor(daysSurvived / 2); // Round down, to have the rest of the
                                                      // calculation above
        obituaryText += ' ';
        obituaryText += dayOrNight(!joinedAtDayTime, Math.floor(daysSurvived / 2));
    }
    obituaryText += '.';

    rootElement.getElementsByClassName('obituary').item(0).textContent = obituaryText;
});