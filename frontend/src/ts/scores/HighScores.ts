'use strict';

import {
    clearNode,
    formatInt,
    formatIntWithAbbreviation,
    isDefined,
    isUndefined,
    makeRequest,
    preventInputPropagation,
    smoothHoverAnimation
} from '../Utils';
import * as Urls from '../backend/Urls';
import * as moment from 'moment-mini';
import * as Preloading from "../Preloading";
import {EndScreenShownEvent, GamePlayingEvent, GameSetupEvent, StartScreenDomReadyEvent} from '../Events';
import {GameState, IGame} from "../interfaces/IGame";
import * as SocialMedia from "../userInterface/partials/SocialMedia";

let rootElement: HTMLElement;
let leaderboardTables: Map<string, HTMLElement>;
let templateRow: HTMLElement;
let elements = {};
let pendingTimeout: number;

let Game: IGame = null;
GameSetupEvent.subscribe(game => {
    Game = game;
});

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
    preventInputPropagation(rootElement);

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
            score: rootElement.querySelector('.highscore.' + category + ' > .score'),
        };
    });

    SocialMedia.content.then((htmlContent) => {
        rootElement.querySelector('.socialMediaContainer').innerHTML = htmlContent;

        rootElement.querySelectorAll('.socialLink').forEach((element) => {
            smoothHoverAnimation(element, {animationDuration: 0.3});
        });
    });
}

StartScreenDomReadyEvent.subscribe(() => {
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
    if (Game.state === GameState.PLAYING) {
        // Prevent the scoreboard from being opened during transition into play mode
        return;
    }

    rootElement.classList.add('open');
    document.body.classList.add('leaderboardVisible');

    loadScoreboard().then(populateScoreboards);
}

function close(event: Event) {
    event.preventDefault();

    rootElement.classList.remove('open');
    document.body.classList.remove('leaderboardVisible');
}

function show() {
    rootElement.classList.remove('hidden');

    // TODO reduced load on DB server. As long as there's no "current"
    //  category it doesn't make sense to keep reloading the scores.
    // (function update() {
    //     loadHighScores().then((highScores) => {
    //         populateHighScores(highScores);
    //
    //         pendingTimeout = window.setTimeout(update, 2000);
    //     });
    // })();

    loadHighScores()
        .then((highScores) => {
            populateHighScores(highScores);
        })
        .catch((response) => {
            console.error('Error loading highscores.', response);
            hide();
        });
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
        if (isDefined(highScore)) {
            displayValueWithTitle(elements[category].playerName, highScore.playerName);
            displayValueWithTitle(
                elements[category].score,
                formatIntWithAbbreviation(highScore.score),
                formatInt(highScore.score));
        } else {
            displayValueWithTitle(elements[category].playerName, '---', 'No scores in period');
            displayValueWithTitle(elements[category].score, '---', 'No scores in period');
        }
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
            displayValueWithTitle(newRow.querySelector('.playerName'), highScore.playerName);
            displayValueWithTitle(
                newRow.querySelector('.score'),
                formatIntWithAbbreviation(highScore.score),
                formatInt(highScore.score));

            table.appendChild(newRow);
        }
    });
}

function displayValueWithTitle(element: Element, value: string, title?: string) {
    if (isUndefined(title)) {
        title = value;
    }
    element.textContent = value;
    element.setAttribute('title', title);
}


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
    });

    return mappedHighScores;
}

GamePlayingEvent.subscribe(() => {
    hide();
});

EndScreenShownEvent.subscribe(() => {
    show();
});
