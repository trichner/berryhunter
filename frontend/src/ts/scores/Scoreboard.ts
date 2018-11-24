'use strict';

import * as UserInterface from '../userInterface/UserInterface';
import {clearNode, formatIntWithAbbreviation, isDefined, isUndefined} from '../Utils';

let domElement;
let playerRowTemplate;
let rowContainer;
let rows;

let pendingMessage;

export function setup() {
    domElement = UserInterface.getScoreboard();
    playerRowTemplate = domElement.getElementsByClassName('playerRow').item(0);
    rowContainer = playerRowTemplate.parentNode;
    rowContainer.removeChild(playerRowTemplate);
    rows = [];

    if (isDefined(pendingMessage)) {
        updateFromBackend(pendingMessage);
        pendingMessage = undefined;
    }
}

export function updateFromBackend(scoreboardMessage) {
    if (isUndefined(domElement)) {
        // Don't try to show a scoreboard if its not yet loaded
        // instead store the message and show as soon as the dom is ready
        pendingMessage = scoreboardMessage;
        return;
    }
    domElement.classList.remove('hidden');
    let players = scoreboardMessage.players;
    players.sort(function (a, b) {
        return b.score - a.score;
    });
    if (rows.length !== players.length) {
        clearNode(rowContainer);
        rows.length = 0;
        for (let i = 0; i < players.length; i++) {
            let row = playerRowTemplate.cloneNode(true);
            rows.push({
                row: row,
                rank: row.getElementsByClassName('rank')[0],
                name: row.getElementsByClassName('name')[0],
                score: row.getElementsByClassName('score')[0],
            });
            rowContainer.appendChild(row);
        }
    }

    for (let i = 0; i < players.length; i++) {
        rows[i].name.textContent = players[i].name;
        if (players[i].score !== 0) {
            rows[i].score.textContent = formatIntWithAbbreviation(players[i].score);
        }
    }
}
