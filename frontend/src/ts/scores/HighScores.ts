'use strict';

import * as Events from '../Events';
import {isUndefined} from '../Utils';


export let isRendered = false;
let startScreenElement;

export const categories = [
    'alltime',
    'monthly',
    'weekly',
    'daily',
    'current',
];

export function updateFromBackend(highScores) {
    if (isUndefined(this.startScreenElement)) {
        // Start screen is not yet loaded - ignore high scores
        return;
    }

    if (!this.isRendered) {
        this.isRendered = true;
        this.show();
    }

    this.categories.forEach(function (category) {
        if (!highScores.hasOwnProperty(category)) {
            return;
        }

        let highScore = highScores[category][0];
        this.elements[category].playerName.textContent = highScore.playerName;
        this.elements[category].score.textContent = highScore.score;
    }, this);
}

export function show() {
    this.rootElement = document.getElementById('highScores');
    this.rootElement.classList.add('loaded');

    this.elements = {};
    this.categories.forEach(function (category) {
        this.elements[category] = {
            playerName: this.rootElement.querySelector('.highscore.' + category + ' > .playerName'),
            score: this.rootElement.querySelector('.highscore.' + category + ' > .value'),
        }
    }, this);
}

Events.on('startScreen.domReady', function (domElement) {
    startScreenElement = domElement;
});

// let mockHighScores = {};
// require(['NameGenerator'], function (NameGenerator) {
// 	let absoluteHighScore = Utils.randomInt(60000, 300000);
//
// 	HighScores.categories.forEach(function (category) {
//
// 		mockHighScores[category] = [{
// 			playerName: NameGenerator.generate(),
// 			score: absoluteHighScore
// 		}];
//
// 		absoluteHighScore *= Utils.random(0.5, 0.8);
// 		absoluteHighScore = Math.round(absoluteHighScore);
// 	});
//
// 	setInterval(function () {
// 		HighScores.updateFromBackend(mockHighScores);
//
// 		HighScores.categories.forEach(function (category) {
// 			mockHighScores[category][0].score += Utils.randomInt(1, 18);
// 		});
// 	}, 500);
// });
