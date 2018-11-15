'use strict';

import {clearNode, isDefined, makeRequest, random, randomInt, smoothHoverAnimation} from '../Utils';
import * as NameGenerator from '../NameGenerator';
import * as Urls from '../backend/Urls';
import * as moment from 'moment';
import * as Preloading from "../Preloading";
import * as Events from '../Events';

// TODO cleanup: Benennungen, Reihenfolge

let rootElement: HTMLElement;
let elementsToHide: NodeList;
let leaderboardTables: Map<string, HTMLElement>;
let templateRow: HTMLElement;
let isRendered = false;
let domReady = true;
let elements = {};
let pendingTimeout: number;

export const categories = [
    'alltime',
    'monthly',
    'weekly',
    'daily',
    //  'current',
];

const htmlFile = require('./highScores.html');


Preloading.renderPartial(htmlFile, onDomReady);

function onDomReady() {
    domReady = true;

    const showMock = false;
    if (showMock) {
        mockHighScoresFromBackend();
    } else {
        (function update() {
            loadHighScores().then((highScores) => {
                updateFromBackend(highScores);

                pendingTimeout = window.setTimeout(update, 2000);
            });
        })();
    }
}


export function updateFromBackend(highScores) {
    if (!domReady) {
        // html is not yet loaded - ignore high scores
        return;
    }

    if (!isRendered) {
        isRendered = true;
        show();
    }

    categories.forEach((category) => {
        if (!highScores.hasOwnProperty(category)) {
            return;
        }

        let highScore = highScores[category][0];
        elements[category].playerName.textContent = highScore.playerName;
        elements[category].score.textContent = highScore.score;
    });
}

export function populateLeaderboard(highScores) {
    categories.forEach((category) => {
        if (!highScores.hasOwnProperty(category)) {
            return;
        }

        let table = leaderboardTables.get(category);
        clearNode(table);

        let limit = Math.min(highScores[category].length, 10);
        for (let i = 0; i < limit; i++) {
            let highScore = highScores[category][i];

            let newRow = templateRow.cloneNode(true) as HTMLElement;
            newRow.querySelector('.rank').textContent = '#' + (i + 1);
            newRow.querySelector('.date').textContent = highScore.date.format('DD.MM.YYYY');
            newRow.querySelector('.playerName').textContent = highScore.playerName;
            newRow.querySelector('.score').textContent = highScore.score;

            table.appendChild(newRow);
        }
    });
}

export function show() {
    rootElement = document.getElementById('highScores');
    rootElement.classList.add('loaded');

    elementsToHide = document.querySelectorAll('.hideForLeaderboard');
    document.getElementById('closeLeaderboard').addEventListener('click', close);

    leaderboardTables = new Map();
    categories.forEach(category => {
        let selector = '.highScoreDetails .highscore.' + category + ' > tbody';
        leaderboardTables.set(category, document.querySelector(selector));
    });

    let table = leaderboardTables.get('alltime');
    templateRow = table.removeChild(table.querySelector('.templateRow'));
    templateRow.classList.remove('templateRow')

    let overviewElement = rootElement.querySelector('.highScoreOverview');
    let menuItem = document.querySelector('a[href="#highScores"]');
    smoothHoverAnimation(
        overviewElement,
        {
            animationDuration: 0.3,
            additionalHoverElement: menuItem
        });

    overviewElement.addEventListener('click', open);
    menuItem.addEventListener('click', open);

    categories.forEach((category) => {
        elements[category] = {
            playerName: rootElement.querySelector('.highscore.' + category + ' > .playerName'),
            score: rootElement.querySelector('.highscore.' + category + ' > .value'),
        }
    });
}

function open() {
    rootElement.classList.add('open');

    elementsToHide.forEach((element: Element) => {
        element.classList.add('hidden');
    });

    loadScoreboard().then(populateLeaderboard);
}

function close() {
    rootElement.classList.remove('open');

    elementsToHide.forEach((element: Element) => {
        element.classList.remove('hidden');
    });
}

function mockHighScoresFromBackend() {

    let mockHighScores = {};
    let absoluteHighScore = randomInt(60000, 300000);

    categories.forEach(function (category) {

        if (category !== 'alltime') {
            return;
        }

        mockHighScores[category] = [{
            playerName: NameGenerator.generate(),
            score: absoluteHighScore
        }];

        absoluteHighScore *= random(0.5, 0.8);
        absoluteHighScore = Math.round(absoluteHighScore);
    });

    setInterval(function () {
        updateFromBackend(mockHighScores);

        categories.forEach(function (category) {
            if (category !== 'alltime') {
                return;
            }
            mockHighScores[category][0].score += randomInt(1, 18);
        });
    }, 500);
}

function loadScoreboard() {
    return makeRequest({
        method: 'GET',
        url: Urls.database + '/scoreboard'
    }).then(mapScores);
}

function loadHighScores() {
    return makeRequest({
        method: 'GET',
        url: Urls.database + '/highscores'
    }).then(mapScores);
}

// // TODO remove me
let score = 1000000;

function mapScores(response: string) {
    // Example response: [{"uuid":"c38a8700-365f-4fdc-ad3f-81be7b0e4faa","name":"Arnold Hardrock","score":2066,"updated":"2018-10-30T13:47:24Z"}]
    let highScores = JSON.parse(response);

    let mappedHighScores = {};
    categories.forEach((category) => {
        if (!highScores.hasOwnProperty(category)) {
            return;
        }

        mappedHighScores[category] = highScores[category].map(highScore => {
            return {
                playerName: highScore.name,
                score: highScore.score,
                date: moment(highScore.updated, 'YYYY-MM-DD[T]HH:mm:ssZ')
            }
        });

        // // TODO remove me
        while (mappedHighScores[category].length < 10) {
            mappedHighScores[category].push({
                playerName: "Dummy",
                score: score,
                date: moment()
            });
        }
        score *= 1.10;
    });

    return mappedHighScores;
}

Events.on(Events.GAME_PLAYING, () => {
    // Hide scores
    // TODO do nothing while game runs
    if (isDefined(pendingTimeout)) {
        window.clearTimeout(pendingTimeout);
    }
});

Events.on(Events.GAME_DEATH, () => {
    // Show scores
    // start timeout loop again
});