'use strict';

import {nearlyEqual, isDefined} from '../Utils';
import * as _ from 'lodash';


let lastGameState;

export function newSnapshot(backendState, gameState) {
    let snapshot;
    if (this.hasSnapshot()) {
        snapshot = {};
        snapshot.tick = gameState.tick;

        snapshot.player = _.clone(gameState.player);

        if (backendState === 'PLAYING' &&
            !lastGameState.player.isSpectator &&
            nearlyEqual(lastGameState.player.position.x, gameState.player.position.x, 0.01) &&
            nearlyEqual(lastGameState.player.position.y, gameState.player.position.y, 0.01)) {
            delete snapshot.player.position;
        }

        // Inventory handles item stacks
        snapshot.inventory = gameState.inventory;

        // GameMapWithBackend handles entity states
        snapshot.entities = gameState.entities;
    } else {
        snapshot = gameState;
    }

    lastGameState = gameState;

    return snapshot;
}

export function hasSnapshot() {
    return isDefined(lastGameState);
}

export function getLastGameState() {
    return lastGameState;
}
