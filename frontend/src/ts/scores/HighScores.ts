'use strict';

import * as Events from '../Events';
import {clearNode, isUndefined, makeRequest, random, randomInt, smoothHoverAnimation} from '../Utils';
import * as NameGenerator from '../NameGenerator';
import * as Urls from '../backend/Urls';
import * as moment from 'moment';

let rootElement: HTMLElement;
let elementsToHide: NodeList;
let leaderboardTable: HTMLElement;
let templateRow: HTMLElement;
let isRendered = false;
let startScreenElement;
let elements = {};

export const categories = [
    'alltime',
    'monthly',
    'weekly',
    'daily',
    'current',
];

export function updateFromBackend(highScores) {
    if (isUndefined(startScreenElement)) {
        // Start screen is not yet loaded - ignore high scores
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

        clearNode(leaderboardTable);

        let limit = Math.min(highScores[category].length, 10);
        for (let i = 0; i < limit; i++) {
            let highScore = highScores[category][i];

            let newRow = templateRow.cloneNode(true) as HTMLElement;
            newRow.querySelector('.rank').textContent = '#' + (i +1);
            newRow.querySelector('.date').textContent = highScore.date.format('DD.MM.YYYY');
            newRow.querySelector('.playerName').textContent = highScore.playerName;
            newRow.querySelector('.score').textContent = highScore.score;

            leaderboardTable.appendChild(newRow);
        }
    });
}

export function show() {
    rootElement = document.getElementById('highScores');
    rootElement.classList.add('loaded');

    elementsToHide = document.querySelectorAll('.hideForLeaderboard');
    document.getElementById('closeLeaderboard').addEventListener('click', close);

    leaderboardTable = document.querySelector('.highScoreDetails > .highscore > tbody');
    templateRow = leaderboardTable.removeChild(leaderboardTable.querySelector('.templateRow'));
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

    elementsToHide.forEach((element : Element) => {
        element.classList.add('hidden');
    });

    loadScoreboard().then(populateLeaderboard);
}

function close() {
    rootElement.classList.remove('open');

    elementsToHide.forEach((element : Element) => {
        element.classList.remove('hidden');
    });
}

Events.on('startScreen.domReady', function (domElement) {
    startScreenElement = domElement;

    const showMock = false;
    if (showMock) {
        mockHighScoresFromBackend();
    } else {
        loadHighScores().then(updateFromBackend);
    }
});

function mockHighScoresFromBackend() {

    let mockHighScores = {};
    let absoluteHighScore = randomInt(60000, 300000);

    categories.forEach(function (category) {

        if (category !== 'alltime'){
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
            if (category !== 'alltime'){
                return;
            }
            mockHighScores[category][0].score += randomInt(1, 18);
        });
    }, 500);
}

function loadScoreboard(){
    return makeRequest({
        method: 'GET',
        url: Urls.database + '/scoreboard'
    }).then(mapScores);
}

function loadHighScores(){
    return makeRequest({
        method: 'GET',
        url: Urls.database + '/highscores'
    }).then(mapScores);
}

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
    });

    return mappedHighScores;
}