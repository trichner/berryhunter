import * as Preloading from '../../Preloading';
import * as PlayerName from '../../PlayerName';
import * as Console from '../../Console';
import {preventInputPropagation} from '../../Utils';
import {BeforeDeathEvent, EndScreenShownEvent, PlayerCreatedEvent} from '../../Events';
import * as DayCycle from '../../DayCycle';
import * as SnapshotFactory from '../../backend/SnapshotFactory';
import {Rating} from "../../rating/Rating";

let rootElement;
let playerNameInput;

function onDomReady() {
    rootElement = document.getElementById('endScreen');
    playerNameInput = rootElement.getElementsByClassName('playerNameInput').item(0);

    PlayerName.prepareForm(document.getElementById('endForm'), playerNameInput, 'end');

    preventInputPropagation(rootElement);

    rootElement.getElementsByClassName('playerForm').item(0)
        .addEventListener('animationend', function () {
            EndScreenShownEvent.trigger();
            // As soon as the form is faded in, focus the input field
            playerNameInput.focus();
        });

    new Rating(rootElement.querySelector('.userRating'), true);
}

Preloading.renderPartial(require('./endScreen.html'), onDomReady);

export function show() {
    PlayerName.fillInput(playerNameInput);
    Console.hide();

    rootElement.classList.add('showing');
}

export function hide() {
    rootElement.classList.remove('showing');
}

let joinedAtDayTime;
let joinedAtServerTick;

PlayerCreatedEvent.subscribe(() => {
    joinedAtDayTime = DayCycle.isDay();
    joinedAtServerTick = SnapshotFactory.getLastGameState().tick;
});

BeforeDeathEvent.subscribe(() => {
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
