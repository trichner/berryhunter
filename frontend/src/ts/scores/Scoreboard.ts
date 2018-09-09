'use strict';

import * as UserInterface from '../userInterface/UserInterface';
import {isDefined, isUndefined, clearNode} from '../Utils';

let domElement;
let playerRowTemplate;
let rowContainer;
let rows;

let pendingMessage;

export function setup() {
    domElement = UserInterface.getScoreboard();
    playerRowTemplate = this.domElement.getElementsByClassName('playerRow').item(0);
    rowContainer = this.playerRowTemplate.parentNode;
    rowContainer.removeChild(this.playerRowTemplate);
    rows = [];

    if (isDefined(pendingMessage)) {
        this.updateFromBackend(pendingMessage);
        pendingMessage = undefined;
    }
}

export function updateFromBackend(scoreboardMessage) {
    if (isUndefined(this.domElement)) {
        // Don't try to show a scoreboard if its not yet loaded
        // instead store the message and show as soon as the dom is ready
        pendingMessage = scoreboardMessage;
        return;
    }
    this.domElement.classList.remove('hidden');
    let players = scoreboardMessage.players;
    players.sort(function (a, b) {
        return b.score - a.score;
    });
    if (this.rows.length !== players.length) {
        clearNode(this.rowContainer);
        this.rows.length = 0;
        for (let i = 0; i < players.length; i++) {
            let row = this.playerRowTemplate.cloneNode(true);
            this.rows.push({
                row: row,
                rank: row.getElementsByClassName('rank')[0],
                name: row.getElementsByClassName('name')[0],
                score: row.getElementsByClassName('score')[0],
            });
            this.rowContainer.appendChild(row);
        }
    }

    for (let i = 0; i < players.length; i++) {
        this.rows[i].name.textContent = players[i].name;
        if (players[i].score !== 0) {
            this.rows[i].score.textContent = players[i].score;
        }
    }
}
