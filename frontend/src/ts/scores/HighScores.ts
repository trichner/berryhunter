'use strict';

import * as Events from '../Events';
import {isUndefined, random, randomInt, smoothHoverAnimation} from '../Utils';
import * as NameGenerator from '../NameGenerator';

let rootElement: HTMLElement;
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

export function show() {
    rootElement = document.getElementById('highScores');
    rootElement.classList.add('loaded');
    smoothHoverAnimation(rootElement, 0.8);

    categories.forEach((category) => {
        elements[category] = {
            playerName: rootElement.querySelector('.highscore.' + category + ' > .playerName'),
            score: rootElement.querySelector('.highscore.' + category + ' > .value'),
        }
    });
}

Events.on('startScreen.domReady', function (domElement) {
    startScreenElement = domElement;

    const showMock = false;
    if (showMock) {
        mockHighScoresFromBackend();
    } else {
        document.getElementById('highScores').classList.add('hidden');
    }
});

function mockHighScoresFromBackend() {

    let mockHighScores = {};
    let absoluteHighScore = randomInt(60000, 300000);

    categories.forEach(function (category) {

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
            mockHighScores[category][0].score += randomInt(1, 18);
        });
    }, 500);
}