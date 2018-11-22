'use strict';

import {
    clearNode,
    formatInt,
    isDefined,
    isUndefined,
    makeRequest,
    random,
    randomInt,
    smoothHoverAnimation
} from '../Utils';
import * as NameGenerator from '../NameGenerator';
import * as Urls from '../backend/Urls';
import * as moment from 'moment';
import * as Preloading from "../Preloading";
import * as Events from '../Events';

let rootElement: HTMLElement;
let elementsToHide: NodeList;
let leaderboardTables: Map<string, HTMLElement>;
let templateRow: HTMLElement;
let elements = {};
let pendingTimeout: number;

export const categories = [
    'alltime',
    'monthly',
    'weekly',
    'daily',
    //  'current',
];

interface HighScoresDTO {
    alltime: HighScoreDTO[];
    monthly: HighScoreDTO[];
    weekly: HighScoreDTO[];
    daily: HighScoreDTO[];
}

interface HighScoreDTO {
    // e.g. "c38a8700-365f-4fdc-ad3f-81be7b0e4faa"
    uuid: string;

    name: string;

    score: number;

    // e.g. "2018-10-30T13:47:24Z"
    updated: string;
}

const htmlFile = require('./highScores.html');
Preloading.renderPartial(htmlFile, onDomReady);

function onDomReady() {
    rootElement = document.getElementById('highScores');

    initDom();
    show();
}

function initDom() {
    // FIXME das kann erst geladen werden, wenn alle anderen Screen geladen sind
    elementsToHide = document.querySelectorAll('.hideForLeaderboard');
    document.getElementById('closeLeaderboard').addEventListener('click', close);

    leaderboardTables = new Map();
    categories.forEach(category => {
        let selector = '.highScoreDetails .highscore.' + category + ' > tbody';
        leaderboardTables.set(category, document.querySelector(selector));
    });

    let table = leaderboardTables.get('alltime');
    templateRow = table.removeChild(table.querySelector('.templateRow'));
    templateRow.classList.remove('templateRow');

    categories.forEach((category) => {
        elements[category] = {
            playerName: rootElement.querySelector('.highscore.' + category + ' > .playerName'),
            score: rootElement.querySelector('.highscore.' + category + ' > .value'),
        }
    });
}

Events.on('startScreen.domReady', () => {
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
});

function open() {
    rootElement.classList.add('open');

    elementsToHide.forEach((element: Element) => {
        element.classList.add('hidden');
    });

    loadScoreboard().then(populateScoreboards);
}

function close() {
    rootElement.classList.remove('open');

    elementsToHide.forEach((element: Element) => {
        element.classList.remove('hidden');
    });
}

function show() {
    rootElement.classList.remove('hidden');
    (function update() {
        loadHighScores().then((highScores) => {
            populateHighScores(highScores);

            pendingTimeout = window.setTimeout(update, 2000);
        });
    })();
}

function hide() {
    rootElement.classList.add('hidden');
    rootElement.classList.remove('loaded');
    if (isDefined(pendingTimeout)) {
        window.clearTimeout(pendingTimeout);
    }
}

function loadHighScores() {
    return makeRequest({
        method: 'GET',
        url: Urls.database + '/highscores'
    }).then(mapScores);
}

export function populateHighScores(highScores) {
    if (isUndefined(rootElement)) {
        // html is not yet loaded - ignore high scores
        return;
    }

    rootElement.classList.add('loaded');

    categories.forEach((category) => {
        if (!highScores.hasOwnProperty(category)) {
            return;
        }

        let highScore = highScores[category][0];
        elements[category].playerName.textContent = highScore.playerName;
        elements[category].score.textContent = formatNumber(highScore.score);
    });
}

function loadScoreboard() {
    return makeRequest({
        method: 'GET',
        url: Urls.database + '/scoreboard'
    }).then(mapScores);
}

function populateScoreboards(highScores) {
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
            if (category == 'daily') {
                newRow.querySelector('.date').textContent = highScore.date.format('HH:mm');
            } else {
                newRow.querySelector('.date').textContent = highScore.date.format('DD.MM.YYYY');
            }
            newRow.querySelector('.playerName').textContent = highScore.playerName;
            newRow.querySelector('.score').textContent = formatNumber(highScore.score);

            table.appendChild(newRow);
        }
    });
}

// TODO use this method ingame for the scoreboard, too
const multipliers = ['', 'K', 'M', 'B', 'T'];
function formatNumber(x: number): string {

    let kExp:  number = 0;

    while (x >= 10 * 1000 && kExp < multipliers.length - 1) {
        kExp++;
        x /= 1000;
    }

    return formatInt(Math.floor(x)) + ' ' + multipliers[kExp];
}

// TODO remove me
let score = 10 * 1000;

function mapScores(response: string) {

    let highScores: HighScoresDTO = JSON.parse(response);

    let mappedHighScores = {};
    categories.forEach((category) => {
        if (!highScores.hasOwnProperty(category)) {
            return;
        }

        mappedHighScores[category] = highScores[category].map((highScore: HighScoreDTO) => {
            return {
                playerName: highScore.name,
                score: highScore.score,
                date: moment(highScore.updated, 'YYYY-MM-DD[T]HH:mm:ssZ')
            }
        });

        // TODO remove me
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
        populateHighScores(mockHighScores);

        categories.forEach(function (category) {
            if (category !== 'alltime') {
                return;
            }
            mockHighScores[category][0].score += randomInt(1, 18);
        });
    }, 500);
}

Events.on(Events.GAME_PLAYING, () => {
    hide();
});

Events.on(Events.ENDSCREEN_SHOWN, () => {
    show();
});